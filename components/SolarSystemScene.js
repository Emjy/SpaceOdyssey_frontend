'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fetchBody, getMoonStubsFromPlanet } from '../lib/solarApi';

// ─── Config ───────────────────────────────────────────────────────────────────

const PLANET_DATA = [
    //                                                                               tilt(°)  rotDir (+1=prograde, -1=rétrograde)
    { name: 'mercure', r: 10, size: 0.15, color: '#c8c8c8', emissive: '#555555', speed: 0.16,  tilt:   0.03, rotDir:  1 },
    { name: 'venus',   r: 13, size: 0.35, color: '#f0d080', emissive: '#6b4a00', speed: 0.10,  tilt: 177.4,  rotDir: -1 },
    { name: 'terre',   r: 16, size: 0.38, color: '#4a80c0', emissive: '#0a2a50', speed: 0.07,  tilt:  23.44, rotDir:  1 },
    { name: 'mars',    r: 19, size: 0.22, color: '#d05010', emissive: '#501800', speed: 0.04,  tilt:  25.19, rotDir:  1 },
    { name: 'jupiter', r: 28, size: 1.40, color: '#d8a060', emissive: '#4a2800', speed: 0.016, tilt:   3.13, rotDir:  1 },
    { name: 'saturne', r: 36, size: 1.20, color: '#ede0a0', emissive: '#504000', speed: 0.010, tilt:  26.73, rotDir:  1 },
    { name: 'uranus',  r: 45, size: 0.75, color: '#88eef0', emissive: '#104050', speed: 0.006, tilt:  97.77, rotDir: -1 },
    { name: 'neptune', r: 52, size: 0.72, color: '#3355e8', emissive: '#0c1555', speed: 0.004, tilt:  28.32, rotDir:  1 },
    { name: 'pluton',  r: 58, size: 0.12, color: '#9a8070', emissive: '#302520', speed: 0.002, tilt: 122.53, rotDir: -1 },
];

// Convention : /textures/moons/{api_id}.jpg
// Ajouter un fichier dans ce dossier suffit — aucune modif de code requise.
const MOON_TEXTURE_BASE = '/textures/moons';

const DEFAULT_CAM_DIST = 90;
const PLANET_ORBIT_MIN = 10;
const PLANET_ORBIT_MAX = 58;
const PLANET_SPEED_MIN = 0.002;
const PLANET_SPEED_MAX = 0.16;
const MOON_ORBIT_MIN = 1.2;
const MOON_ORBIT_MAX = 7.8;
const MOON_SPEED_MIN = 0.03;
const MOON_SPEED_MAX = 0.18;
const TARGET_SCREEN_FRACTION = 0.5;
const MOON_VISIBLE_SIZE_FACTOR = 2.4;
const MOON_VISIBLE_SIZE_MIN = 0.018;
const MOON_VISIBLE_SIZE_MAX_FACTOR = 0.12;
const MOON_FOCUS_MIN_RADIUS = 0.035;
const SELECTED_MOON_VISIBLE_MIN = 0.018;
const SUN_RADIUS = 5.5;
const GALAXY_ROTATION_SPEED = 0.00014;
const GALAXY_HALO_ROTATION_SPEED = 0.00004;
const GALAXY_SUN_ORBIT_RADIUS = 64;
const GALAXY_SUN_FOCUS_DISTANCE = 6.2;
const GALAXY_TO_SOLAR_APPROACH_STEP = 0.008;
const GALAXY_TO_SOLAR_FADE_TRIGGER = 0.58;
const SOLAR_SYSTEM_INTRO_STEP = 0.012;
const SOLAR_SYSTEM_DEFAULT_POSITION = { x: 0, y: 24, z: 36 };
const SOLAR_SYSTEM_INTRO_POSITION = { x: 0, y: 62, z: 118 };
const FRAME_TIME_60FPS = 1000 / 60;
const GALAXY_IDLE_FPS = 48;
const SOLAR_SYSTEM_IDLE_FPS = 36;
const INTERACTION_BOOST_MS = 900;
const SUN_BOIL_AMPLITUDE = 0.2;
const SUN_BOIL_SPEED = 0.00115;
const SUN_PULSE_SPEED = 0.00062;
const IRREGULAR_MOON_SHAPES = {
    phobos: { seed: 1.73, amplitude: 0.22 },
    deimos: { seed: 4.21, amplitude: 0.14 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Arc de traîne 180° avec dégradé.
// reversed=false : φ=0 sombre (queue), φ=π lumineux (tête à la planète) — arc.rotation.y = Math.PI - angle
// reversed=true  : φ=0 lumineux (tête à la lune),  φ=π sombre (queue)   — arc.rotation.y = -angle
function makeTrailArc(radius, color = 0xffffff, opacity = 0.4, reversed = false) {
    const N = 128;
    const pts = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI, false, 0)
        .getPoints(N)
        .map(p => new THREE.Vector3(p.x, 0, p.y));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    const c = new THREE.Color(color);
    const colorArr = new Float32Array((N + 1) * 3);
    for (let i = 0; i <= N; i++) {
        const t = reversed ? 1 - i / N : i / N;
        colorArr[i * 3]     = c.r * t;
        colorArr[i * 3 + 1] = c.g * t;
        colorArr[i * 3 + 2] = c.b * t;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

    const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        opacity,
        transparent: true,
        depthWrite: false,
        linewidth: 2,
    });
    return new THREE.Line(geo, mat);
}

function makeSphere(radius, color, emissive, segments = radius >= 3 ? 64 : radius >= 0.6 ? 48 : radius >= 0.18 ? 32 : 24) {
    const geo = new THREE.SphereGeometry(radius, segments, segments);
    const mat = new THREE.MeshPhongMaterial({
        color:             new THREE.Color(color),
        emissive:          new THREE.Color(emissive),
        emissiveIntensity: 2.5,
        specular:          new THREE.Color(0x2a2a3e),
        shininess:         18,
        transparent:       true,
        opacity:           1.0,
    });
    return new THREE.Mesh(geo, mat);
}

function parseBodyDimensions(dimension) {
    if (typeof dimension !== 'string') return null;

    const values = dimension
        .match(/-?\d+(?:[.,]\d+)?/g)
        ?.map((value) => Number.parseFloat(value.replace(',', '.')))
        .filter((value) => Number.isFinite(value) && value > 0);

    if (!values || values.length < 3) return null;
    return values.slice(0, 3);
}

function normalizeStretch(x = 1, y = 1, z = 1) {
    return {
        x: THREE.MathUtils.clamp(x, 0.65, 1.45),
        y: THREE.MathUtils.clamp(y, 0.65, 1.45),
        z: THREE.MathUtils.clamp(z, 0.65, 1.45),
    };
}

function getMoonStretch(moonBody) {
    const parsedDimensions = parseBodyDimensions(moonBody?.dimension);
    if (parsedDimensions) {
        const [x, y, z] = parsedDimensions;
        const avg = (x + y + z) / 3;
        if (avg > 0) {
            return normalizeStretch(x / avg, y / avg, z / avg);
        }
    }

    const meanRadius = moonBody?.meanRadius;
    const equaRadius = moonBody?.equaRadius;
    const polarRadius = moonBody?.polarRadius;
    if (Number.isFinite(meanRadius) && meanRadius > 0) {
        const equatorialRatio = Number.isFinite(equaRadius) && equaRadius > 0 ? equaRadius / meanRadius : 1;
        const polarRatio = Number.isFinite(polarRadius) && polarRadius > 0 ? polarRadius / meanRadius : 1;
        return normalizeStretch(equatorialRatio, polarRatio, equatorialRatio);
    }

    return null;
}

function applyMoonStretch(geometry, stretch) {
    if (!stretch) return;

    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);
        vertex.set(
            vertex.x * stretch.x,
            vertex.y * stretch.y,
            vertex.z * stretch.z
        );
        position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
}

function deformMoonGeometry(geometry, { seed, amplitude }) {
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const vertex = new THREE.Vector3();
    const direction = new THREE.Vector3();

    for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);
        direction.fromBufferAttribute(normal, i);

        const waviness =
            Math.sin((direction.x + seed) * 4.7) * 0.5 +
            Math.cos((direction.y - seed * 0.7) * 5.9) * 0.3 +
            Math.sin((direction.z + seed * 1.3) * 7.1) * 0.2;
        const displacement = 1 + waviness * amplitude;

        vertex.multiplyScalar(displacement);
        position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
}

function getMoonColor(moonBody) {
    const density = moonBody?.density;
    const avgTemp = moonBody?.avgTemp;

    let r = 0.69, g = 0.65, b = 0.62;
    let er = 0.04, eg = 0.04, eb = 0.04;

    if (Number.isFinite(density) && density > 0) {
        if (density < 1.3) {
            // Lune glacée (Enceladus, Mimas) : blanc-bleu
            r = 0.80; g = 0.88; b = 0.95;
            er = 0.05; eg = 0.07; eb = 0.10;
        } else if (density < 1.8) {
            // Glace/roche mixte (Titan, Rhea, Callisto) : gris-bleuté
            r = 0.65; g = 0.68; b = 0.72;
            er = 0.04; eg = 0.04; eb = 0.05;
        } else if (density < 2.5) {
            // Rocheuse (Ganymede, Triton) : gris moyen
            r = 0.58; g = 0.55; b = 0.52;
            er = 0.04; eg = 0.03; eb = 0.03;
        } else if (density < 3.5) {
            // Silicate dense (Luna, Europa) : gris-beige
            r = 0.60; g = 0.58; b = 0.55;
            er = 0.05; eg = 0.04; eb = 0.03;
        } else {
            // Très dense (métallique) : gris sombre
            r = 0.50; g = 0.47; b = 0.43;
            er = 0.04; eg = 0.03; eb = 0.02;
        }
    }

    if (Number.isFinite(avgTemp) && avgTemp > 0) {
        if (avgTemp < 100) {
            r -= 0.06; b += 0.06;
        } else if (avgTemp > 240) {
            r += 0.05; g += 0.02; b -= 0.05;
        }
    }

    const clamp = v => Math.max(0, Math.min(1, v));
    const toHex = (rv, gv, bv) => {
        const ri = Math.round(clamp(rv) * 255);
        const gi = Math.round(clamp(gv) * 255);
        const bi = Math.round(clamp(bv) * 255);
        return `#${ri.toString(16).padStart(2, '0')}${gi.toString(16).padStart(2, '0')}${bi.toString(16).padStart(2, '0')}`;
    };

    return { color: toHex(r, g, b), emissive: toHex(er, eg, eb) };
}

function makeMoonMesh(moonId, moonBody, radius, color, emissive, segments = 24) {
    const mesh = makeSphere(radius, color, emissive, segments);
    const stretch = getMoonStretch(moonBody);
    const shapePreset = IRREGULAR_MOON_SHAPES[moonId];

    applyMoonStretch(mesh.geometry, stretch);

    if (shapePreset) {
        deformMoonGeometry(mesh.geometry, shapePreset);
    } else if (stretch) {
        mesh.geometry.computeVertexNormals();
    }

    mesh.geometry.computeBoundingSphere();
    mesh.userData.renderRadius = mesh.geometry.boundingSphere?.radius ?? radius;
    return mesh;
}

function getObjectRenderRadius(mesh) {
    return mesh?.userData?.renderRadius
        ?? mesh?.geometry?.boundingSphere?.radius
        ?? mesh?.geometry?.parameters?.radius
        ?? null;
}

function primeBoilingMesh(mesh, amplitude = SUN_BOIL_AMPLITUDE) {
    const geometry = mesh?.geometry;
    const position = geometry?.attributes?.position;
    if (!geometry || !position) return;

    const basePositions = new Float32Array(position.array);
    const directions = new Float32Array(position.count * 3);
    const phases = new Float32Array(position.count);
    const weights = new Float32Array(position.count);
    const vertex = new THREE.Vector3();

    for (let i = 0; i < position.count; i++) {
        vertex.fromArray(basePositions, i * 3);
        if (vertex.lengthSq() === 0) {
            vertex.set(0, 1, 0);
        } else {
            vertex.normalize();
        }

        directions[i * 3] = vertex.x;
        directions[i * 3 + 1] = vertex.y;
        directions[i * 3 + 2] = vertex.z;

        const harmonicSeed = vertex.x * 12.7 + vertex.y * 8.3 + vertex.z * 5.9;
        phases[i] = harmonicSeed * Math.PI;
        weights[i] = 0.58 + 0.42 * Math.abs(Math.sin(harmonicSeed * 1.73));
    }

    mesh.userData.boiling = {
        amplitude,
        basePositions,
        directions,
        phases,
        weights,
    };
}

function updateBoilingMesh(mesh, timeMs) {
    const boiling = mesh?.userData?.boiling;
    const geometry = mesh?.geometry;
    const position = geometry?.attributes?.position;
    if (!boiling || !geometry || !position) return;

    const {
        amplitude,
        basePositions,
        directions,
        phases,
        weights,
    } = boiling;

    const array = position.array;
    const time = timeMs * SUN_BOIL_SPEED;

    for (let i = 0; i < position.count; i++) {
        const idx = i * 3;
        const waveA = Math.sin(time + phases[i]);
        const waveB = Math.cos(time * 1.83 + phases[i] * 1.37);
        const waveC = Math.sin(time * 0.57 + phases[i] * 2.11);
        const displacement = amplitude * weights[i] * (waveA * 0.52 + waveB * 0.3 + waveC * 0.18);

        array[idx] = basePositions[idx] + directions[idx] * displacement;
        array[idx + 1] = basePositions[idx + 1] + directions[idx + 1] * displacement;
        array[idx + 2] = basePositions[idx + 2] + directions[idx + 2] * displacement;
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    mesh.userData.renderRadius = geometry.boundingSphere?.radius ?? mesh.userData.renderRadius;
}

function makeStarSpriteTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.16, 'rgba(255,246,228,0.96)');
    gradient.addColorStop(0.4, 'rgba(255,220,170,0.42)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function makeSoftDiscTexture({
    innerColor = 'rgba(255,255,255,1)',
    midColor = 'rgba(255,255,255,0.35)',
    outerColor = 'rgba(255,255,255,0)',
    size = 256,
} = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.45, midColor);
    gradient.addColorStop(1, outerColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function makeGlowBandTexture({
    centerColor = 'rgba(255,255,255,0.9)',
    edgeColor = 'rgba(255,255,255,0)',
    width = 512,
    height = 80,
} = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, width, height);

    const puffCount = 28;
    for (let i = 0; i < puffCount; i++) {
        const t = i / (puffCount - 1);
        const x = t * width + (Math.random() - 0.5) * (width / puffCount) * 0.9;
        const y = height * 0.5 + (Math.random() - 0.5) * height * 0.18;
        const radiusX = (width * (0.098 - t * 0.038)) * (0.82 + Math.random() * 0.46);
        const radiusY = (height * (0.52 - t * 0.17)) * (0.84 + Math.random() * 0.36);
        const alpha = 0.6 - t * 0.33 + Math.random() * 0.07;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, radiusY / Math.max(radiusX, 1));
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radiusX);
        gradient.addColorStop(0, centerColor.replace(/[\d.]+\)\s*$/, `${Math.min(alpha + 0.18, 0.95)})`));
        gradient.addColorStop(0.34, centerColor.replace(/[\d.]+\)\s*$/, `${Math.min(alpha, 0.9)})`));
        gradient.addColorStop(0.72, centerColor.replace(/[\d.]+\)\s*$/, `${Math.max(alpha * 0.34, 0.06)})`));
        gradient.addColorStop(1, edgeColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(-radiusX, -radiusX, radiusX * 2, radiusX * 2);
        ctx.restore();
    }

    const softAcross = ctx.createLinearGradient(0, 0, 0, height);
    softAcross.addColorStop(0, 'rgba(255,255,255,0)');
    softAcross.addColorStop(0.14, 'rgba(255,255,255,0.38)');
    softAcross.addColorStop(0.5, 'rgba(255,255,255,1)');
    softAcross.addColorStop(0.86, 'rgba(255,255,255,0.38)');
    softAcross.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = softAcross;
    ctx.fillRect(0, 0, width, height);

    const alongFade = ctx.createLinearGradient(0, 0, width, 0);
    alongFade.addColorStop(0, 'rgba(255,255,255,0.98)');
    alongFade.addColorStop(0.1, 'rgba(255,255,255,1)');
    alongFade.addColorStop(0.36, 'rgba(255,255,255,0.9)');
    alongFade.addColorStop(0.7, 'rgba(255,255,255,0.54)');
    alongFade.addColorStop(1, 'rgba(255,255,255,0.13)');
    ctx.fillStyle = alongFade;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'source-over';

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function makeSaturnRings(planetRadius) {
    // Anneaux principaux visibles de Saturne, en proportion du rayon de la planète.
    const inner = planetRadius * 1.11;
    const outer = planetRadius * 2.32;
    const geo = new THREE.RingGeometry(inner, outer, 128);

    // Remapper les UVs pour une texture radiale (U=0 bord interne, U=1 bord externe)
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        const r = Math.sqrt(x * x + y * y);
        uv.setXY(i, (r - inner) / (outer - inner), 0.5);
    }
    uv.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
        color: 0xd4c088, side: THREE.DoubleSide,
        transparent: true, opacity: 0.75,
    });
    const ring = new THREE.Mesh(geo, mat);
    // Les anneaux sont dans le plan équatorial de la planète.
    ring.rotation.x = Math.PI / 2;
    return ring;
}

function getCompressedPlanetRadius(planetName, planets) {
    const fallback = PLANET_DATA.find(p => p.name === planetName)?.r ?? PLANET_ORBIT_MIN;
    const orbitValues = planets
        .map(planet => planet.semimajorAxis)
        .filter(value => Number.isFinite(value) && value > 0);

    const planetData = planets.find(planet => planet.id === planetName);
    const semimajorAxis = planetData?.semimajorAxis;
    if (!Number.isFinite(semimajorAxis) || semimajorAxis <= 0 || orbitValues.length < 2) {
        return fallback;
    }

    const minOrbit = Math.min(...orbitValues);
    const maxOrbit = Math.max(...orbitValues);
    const minLog = Math.log10(minOrbit);
    const maxLog = Math.log10(maxOrbit);
    const valueLog = Math.log10(semimajorAxis);

    if (maxLog === minLog) return fallback;

    const normalized = (valueLog - minLog) / (maxLog - minLog);
    return THREE.MathUtils.lerp(PLANET_ORBIT_MIN, PLANET_ORBIT_MAX, normalized);
}

function getCompressedPlanetSpeed(planetName, planets) {
    const fallback = PLANET_DATA.find(p => p.name === planetName)?.speed ?? PLANET_SPEED_MIN;
    const orbitPeriods = planets
        .map(planet => planet.sideralOrbit)
        .filter(value => Number.isFinite(value) && value > 0);

    const planetData = planets.find(planet => planet.id === planetName);
    const sideralOrbit = planetData?.sideralOrbit;
    if (!Number.isFinite(sideralOrbit) || sideralOrbit <= 0 || orbitPeriods.length < 2) {
        return fallback;
    }

    const minLog = Math.log10(Math.min(...orbitPeriods));
    const maxLog = Math.log10(Math.max(...orbitPeriods));
    const valueLog = Math.log10(sideralOrbit);
    if (maxLog === minLog) return fallback;

    const normalized = (valueLog - minLog) / (maxLog - minLog);
    return THREE.MathUtils.lerp(PLANET_SPEED_MAX, PLANET_SPEED_MIN, normalized);
}

function getCompressedMoonRadius(semimajorAxis, minAxis, maxAxis) {
    if (!Number.isFinite(semimajorAxis) || semimajorAxis <= 0 || !Number.isFinite(minAxis) || !Number.isFinite(maxAxis) || minAxis <= 0 || maxAxis <= 0) {
        return null;
    }

    const minLog = Math.log10(minAxis);
    const maxLog = Math.log10(maxAxis);
    const valueLog = Math.log10(semimajorAxis);
    if (maxLog === minLog) return (MOON_ORBIT_MIN + MOON_ORBIT_MAX) / 2;

    const normalized = (valueLog - minLog) / (maxLog - minLog);
    return THREE.MathUtils.lerp(MOON_ORBIT_MIN, MOON_ORBIT_MAX, normalized);
}

function getCompressedMoonSpeed(sideralOrbit, minPeriod, maxPeriod) {
    if (!Number.isFinite(sideralOrbit) || sideralOrbit <= 0 || !Number.isFinite(minPeriod) || !Number.isFinite(maxPeriod) || minPeriod <= 0 || maxPeriod <= 0) {
        return null;
    }

    const minLog = Math.log10(minPeriod);
    const maxLog = Math.log10(maxPeriod);
    const valueLog = Math.log10(sideralOrbit);
    if (maxLog === minLog) return (MOON_SPEED_MIN + MOON_SPEED_MAX) / 2;

    const normalized = (valueLog - minLog) / (maxLog - minLog);
    return THREE.MathUtils.lerp(MOON_SPEED_MAX, MOON_SPEED_MIN, normalized);
}

function getOrbitalInclination(body, fallback = 0) {
    const value = body?.inclination;
    if (!Number.isFinite(value)) return fallback;
    return THREE.MathUtils.degToRad(value);
}

function getDistanceForScreenFraction(radius, camera, screenFraction = TARGET_SCREEN_FRACTION) {
    if (!camera || !Number.isFinite(radius) || radius <= 0) return 0.35;

    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
    const limitingFov = Math.min(verticalFov, horizontalFov);
    const clampedFraction = THREE.MathUtils.clamp(screenFraction, 0.05, 0.95);
    const distance = radius / (clampedFraction * Math.tan(limitingFov / 2));

    return Math.max(distance, radius * 2);
}

function followTarget(controls, camera, desiredTarget, smoothing = 1) {
    if (!controls || !camera || !desiredTarget) return;

    const delta = desiredTarget.clone().sub(controls.target).multiplyScalar(smoothing);
    controls.target.add(delta);
    camera.position.add(delta);
}

function getActiveTargetMinDistance(camera, selectedMoon, selectedAsteroid, selectedPlanet, moons, asteroids, planetsMap) {
    if (!camera) return 0.05;

    if (selectedMoon) {
        const moonEntry = moons.find(m => m.mesh.userData.name === selectedMoon);
        const moonSize = getObjectRenderRadius(moonEntry?.mesh);
        if (Number.isFinite(moonSize) && moonSize > 0) {
            const zoomLockRadius = Math.max(moonSize, MOON_FOCUS_MIN_RADIUS);
            return getDistanceForScreenFraction(zoomLockRadius, camera, 0.5);
        }
    }

    if (selectedAsteroid) {
        const asteroidEntry = asteroids.find(a => a.mesh.userData.name === selectedAsteroid);
        const asteroidSize = asteroidEntry?.mesh.geometry.parameters.radius;
        if (Number.isFinite(asteroidSize) && asteroidSize > 0) {
            return getDistanceForScreenFraction(asteroidSize, camera, 0.5);
        }
    }

    if (selectedPlanet && planetsMap[selectedPlanet]) {
        const planetSize = planetsMap[selectedPlanet].mesh.geometry.parameters.radius;
        if (Number.isFinite(planetSize) && planetSize > 0) {
            return getDistanceForScreenFraction(planetSize, camera, 0.5);
        }
    }

    return getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5);
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function SolarSystemScene({
    planets = [],
    asteroids = [],
    focusOnPlanet = false,
    resetViewNonce = 0,
    selectedMilkyWay,
    selectedPlanet,
    selectedAsteroid,
    selectedMoon,
    moons = [],
    nbMoons = 0,
    focusOnSolarSystem,
    focusPlanet,
    focusAsteroid,
    focusMoon,
}) {
    const [moonDataVersion, setMoonDataVersion] = useState(0);
    const [proximityPlanet, setProximityPlanet] = useState(null);
    const mountRef = useRef(null);
    const frameRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const ctrlRef = useRef(null);
    const planetsRef = useRef({});   // name → { orbitGroup, group, mesh, arc, ring, angle, r, speed }
    const asteroidsRef = useRef([]); // [{ mesh, angle, r, speed }]
    const moonsRef = useRef([]);   // [{ mesh, arc, angle, speed, radius, parentName }]
    const moonDataCacheRef = useRef({});
    const moonTexCacheRef = useRef({});    // id → THREE.Texture (textures spécifiques par lune)

    const selectedPlanetRef = useRef(selectedPlanet);
    const selectedAsteroidRef = useRef(selectedAsteroid);
    const selectedMoonRef = useRef(selectedMoon);
    const targetCamDistRef = useRef(DEFAULT_CAM_DIST);
    const minCamDistRef = useRef(0.05);
    const focusMoonWorldPosRef = useRef(new THREE.Vector3());
    const focusMoonCamDirRef = useRef(new THREE.Vector3());
    const proximityPlanetRef = useRef(null);
    const solarSystemRootRef = useRef(null);
    const galaxyRootRef = useRef(null);
    const galaxySunRef = useRef(null);
    const isMilkyWayModeRef = useRef(selectedMilkyWay !== 'Solar System');
    const overlayRef = useRef(null);
    const sunTooltipRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
    const pointerNdcRef = useRef(new THREE.Vector2());
    const pointerRef = useRef({ down: false, moved: false });
    const galaxyTransitionRef = useRef({
        phase: 'idle',
        progress: 0,
        startDistance: DEFAULT_CAM_DIST,
        startCamera: new THREE.Vector3(),
        startTarget: new THREE.Vector3(),
        cameraDir: new THREE.Vector3(0, 0, 1),
        sunWorld: new THREE.Vector3(),
        introStartCamera: new THREE.Vector3(),
        introEndCamera: new THREE.Vector3(
            SOLAR_SYSTEM_DEFAULT_POSITION.x,
            SOLAR_SYSTEM_DEFAULT_POSITION.y,
            SOLAR_SYSTEM_DEFAULT_POSITION.z
        ),
    });
    const sceneVisibilityRef = useRef(true);
    const interactionBoostUntilRef = useRef(0);

    const moonsHostPlanet = useMemo(() => {
        if (selectedMoon && selectedPlanet) return selectedPlanet;
        if (focusOnPlanet && selectedPlanet) return selectedPlanet;
        return proximityPlanet;
    }, [focusOnPlanet, proximityPlanet, selectedMoon, selectedPlanet]);

    const isMilkyWayMode = selectedMilkyWay !== 'Solar System';

    useEffect(() => {
        isMilkyWayModeRef.current = isMilkyWayMode;
    }, [isMilkyWayMode]);

    const markInteractionHot = useCallback((duration = INTERACTION_BOOST_MS) => {
        if (typeof performance === 'undefined') return;
        interactionBoostUntilRef.current = performance.now() + duration;
    }, []);

    const focusCameraOnGalaxy = useCallback(() => {
        const camera = cameraRef.current;
        const controls = ctrlRef.current;
        if (!camera || !controls) return;

        controls.target.set(0, 0, 0);
        camera.position.set(-24, 38, 88);
        camera.lookAt(0, 0, 0);
        controls.enabled = true;
        minCamDistRef.current = 12;
        targetCamDistRef.current = camera.position.distanceTo(controls.target);
        controls.update();
    }, []);

    const setOverlayOpacity = useCallback((opacity) => {
        if (!overlayRef.current) return;
        overlayRef.current.style.opacity = `${THREE.MathUtils.clamp(opacity, 0, 1)}`;
    }, []);

    const hideSunTooltip = useCallback(() => {
        if (sunTooltipRef.current) sunTooltipRef.current.style.opacity = '0';
        if (mountRef.current) mountRef.current.style.cursor = pointerRef.current.down ? 'grabbing' : 'grab';
    }, []);

    const showSunTooltip = useCallback((x, y) => {
        if (!sunTooltipRef.current) return;
        sunTooltipRef.current.style.left = `${x}px`;
        sunTooltipRef.current.style.top = `${y}px`;
        sunTooltipRef.current.style.opacity = '1';
        if (mountRef.current) mountRef.current.style.cursor = 'pointer';
    }, []);

    const getPointerHit = useCallback((clientX, clientY, objects) => {
        const el = mountRef.current;
        const camera = cameraRef.current;
        if (!el || !camera || !objects.length) return null;

        const rect = el.getBoundingClientRect();
        pointerNdcRef.current.set(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            ((clientY - rect.top) / rect.height) * -2 + 1
        );
        raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);

        return raycasterRef.current.intersectObjects(objects)[0] ?? null;
    }, []);

    const startGalaxySunTransition = useCallback(() => {
        const camera = cameraRef.current;
        const controls = ctrlRef.current;
        const galaxySun = galaxySunRef.current;
        if (!camera || !controls || !galaxySun) return;

        const transition = galaxyTransitionRef.current;
        if (transition.phase !== 'idle') return;

        galaxySun.updateWorldMatrix(true, false);
        galaxySun.getWorldPosition(transition.sunWorld);
        transition.phase = 'galaxy-approach';
        transition.progress = 0;
        transition.startCamera.copy(camera.position);
        transition.startTarget.copy(controls.target);
        transition.startDistance = camera.position.distanceTo(controls.target);
        transition.cameraDir.subVectors(camera.position, controls.target).normalize();
        if (transition.cameraDir.lengthSq() === 0) {
            transition.cameraDir.set(-0.28, 0.42, 1).normalize();
        }
        hideSunTooltip();
        setOverlayOpacity(0);
    }, [hideSunTooltip, setOverlayOpacity]);

    const focusCameraOnMoon = useCallback((moonName) => {
        const controls = ctrlRef.current;
        const camera = cameraRef.current;
        const moonEntry = moonsRef.current.find(m => m.mesh.userData.name === moonName);
        if (!moonEntry || !controls || !camera) return false;

        const moonSize = getObjectRenderRadius(moonEntry.mesh);
        const focusDist = getDistanceForScreenFraction(moonSize, camera, 0.2);
        minCamDistRef.current = getDistanceForScreenFraction(Math.max(moonSize, MOON_FOCUS_MIN_RADIUS), camera, 0.5);
        targetCamDistRef.current = focusDist;
        moonEntry.mesh.updateWorldMatrix(true, false);
        moonEntry.mesh.getWorldPosition(focusMoonWorldPosRef.current);
        controls.target.copy(focusMoonWorldPosRef.current);
        focusMoonCamDirRef.current.subVectors(camera.position, controls.target);
        if (focusMoonCamDirRef.current.lengthSq() === 0) {
            focusMoonCamDirRef.current.set(0, 0.4, 1);
        }
        camera.position.copy(
            controls.target.clone().add(
                focusMoonCamDirRef.current.normalize().multiplyScalar(targetCamDistRef.current)
            )
        );
        return true;
    }, []);

    useEffect(() => {
        selectedPlanetRef.current = selectedPlanet;
        if (selectedMoonRef.current || selectedAsteroidRef.current) return; // cible prioritaire
        if (selectedPlanet) {
            const p = PLANET_DATA.find(c => c.name === selectedPlanet);
            const camera = cameraRef.current;
            if (p && camera) {
                minCamDistRef.current = getDistanceForScreenFraction(p.size, camera, 0.5);
                targetCamDistRef.current = getDistanceForScreenFraction(p.size, camera, 0.3);
            } else {
                targetCamDistRef.current = DEFAULT_CAM_DIST;
            }
        } else {
            const camera = cameraRef.current;
            minCamDistRef.current = camera
                ? getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5)
                : 0.05;
            targetCamDistRef.current = DEFAULT_CAM_DIST;
        }
    }, [selectedPlanet]);

    useEffect(() => {
        selectedMoonRef.current = selectedMoon;
        if (!selectedMoon && !selectedAsteroidRef.current) {
            // Retour au zoom planète si encore sélectionnée
            const p = PLANET_DATA.find(c => c.name === selectedPlanetRef.current);
            const camera = cameraRef.current;
            if (p && camera) {
                minCamDistRef.current = getDistanceForScreenFraction(p.size, camera, 0.5);
                targetCamDistRef.current = getDistanceForScreenFraction(p.size, camera, 0.3);
            } else {
                targetCamDistRef.current = DEFAULT_CAM_DIST;
            }
        }
    }, [selectedMoon]);

    useEffect(() => {
        selectedAsteroidRef.current = selectedAsteroid;
        if (selectedAsteroid) {
            const asteroidEntry = asteroidsRef.current.find(a => a.mesh.userData.name === selectedAsteroid);
            const asteroidSize = asteroidEntry ? asteroidEntry.mesh.geometry.parameters.radius : 0.08;
            const camera = cameraRef.current;
            if (camera) {
                minCamDistRef.current = getDistanceForScreenFraction(asteroidSize, camera, 0.5);
                targetCamDistRef.current = getDistanceForScreenFraction(asteroidSize, camera, 0.3);
            } else {
                targetCamDistRef.current = Math.max(asteroidSize * 34, 2.2);
            }
        } else if (!selectedPlanetRef.current && !selectedMoonRef.current) {
            const camera = cameraRef.current;
            minCamDistRef.current = camera
                ? getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5)
                : 0.05;
            targetCamDistRef.current = DEFAULT_CAM_DIST;
        }
    }, [selectedAsteroid]);

    useEffect(() => {
        const camera = cameraRef.current;
        const controls = ctrlRef.current;
        if (!camera || !controls) return;

        controls.target.set(0, 0, 0);
        camera.position.set(
            SOLAR_SYSTEM_DEFAULT_POSITION.x,
            SOLAR_SYSTEM_DEFAULT_POSITION.y,
            SOLAR_SYSTEM_DEFAULT_POSITION.z
        );
        camera.lookAt(0, 0, 0);
        controls.enabled = true;
        galaxyTransitionRef.current.phase = 'idle';
        setOverlayOpacity(0);
        minCamDistRef.current = getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5);
        targetCamDistRef.current = camera.position.distanceTo(controls.target);
        controls.update();
    }, [resetViewNonce, setOverlayOpacity]);

    useEffect(() => {
        hideSunTooltip();
        if (isMilkyWayMode) {
            galaxyTransitionRef.current.phase = 'idle';
            setOverlayOpacity(0);
            focusCameraOnGalaxy();
            return;
        }

        const camera = cameraRef.current;
        const controls = ctrlRef.current;
        if (!camera || !controls) return;

        const transition = galaxyTransitionRef.current;
        controls.target.set(0, 0, 0);
        if (transition.phase === 'await-solar-system' || transition.phase === 'solar-arrival') {
            camera.position.set(
                SOLAR_SYSTEM_INTRO_POSITION.x,
                SOLAR_SYSTEM_INTRO_POSITION.y,
                SOLAR_SYSTEM_INTRO_POSITION.z
            );
            camera.lookAt(0, 0, 0);
            controls.enabled = false;
            transition.phase = 'solar-arrival';
            transition.progress = 0;
            transition.introStartCamera.copy(camera.position);
            transition.introEndCamera.set(
                SOLAR_SYSTEM_DEFAULT_POSITION.x,
                SOLAR_SYSTEM_DEFAULT_POSITION.y,
                SOLAR_SYSTEM_DEFAULT_POSITION.z
            );
            minCamDistRef.current = getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5);
            targetCamDistRef.current = transition.introEndCamera.length();
            setOverlayOpacity(1);
            controls.update();
            return;
        }

        camera.position.set(
            SOLAR_SYSTEM_DEFAULT_POSITION.x,
            SOLAR_SYSTEM_DEFAULT_POSITION.y,
            SOLAR_SYSTEM_DEFAULT_POSITION.z
        );
        camera.lookAt(0, 0, 0);
        controls.enabled = true;
        minCamDistRef.current = getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5);
        targetCamDistRef.current = camera.position.distanceTo(controls.target);
        setOverlayOpacity(0);
        controls.update();
    }, [focusCameraOnGalaxy, hideSunTooltip, isMilkyWayMode, setOverlayOpacity]);

    // ── Init scène ────────────────────────────────────────────────────────
    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const solarSystemRoot = new THREE.Group();
        const galaxyRoot = new THREE.Group();
        solarSystemRootRef.current = solarSystemRoot;
        galaxyRootRef.current = galaxyRoot;
        scene.add(solarSystemRoot);
        scene.add(galaxyRoot);

        const transitionPhase = galaxyTransitionRef.current.phase;
        const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.005, 2000);
        if (isMilkyWayModeRef.current) {
            camera.position.set(-24, 38, 88);
        } else if (transitionPhase === 'await-solar-system' || transitionPhase === 'solar-arrival') {
            camera.position.set(
                SOLAR_SYSTEM_INTRO_POSITION.x,
                SOLAR_SYSTEM_INTRO_POSITION.y,
                SOLAR_SYSTEM_INTRO_POSITION.z
            );
        } else {
            camera.position.set(
                SOLAR_SYSTEM_DEFAULT_POSITION.x,
                SOLAR_SYSTEM_DEFAULT_POSITION.y,
                SOLAR_SYSTEM_DEFAULT_POSITION.z
            );
        }
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x020508);
        el.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;  // géré manuellement (zoom vers curseur)
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.65;
        if (!isMilkyWayModeRef.current && (transitionPhase === 'await-solar-system' || transitionPhase === 'solar-arrival')) {
            controls.enabled = false;
            galaxyTransitionRef.current.phase = 'solar-arrival';
            galaxyTransitionRef.current.progress = 0;
            galaxyTransitionRef.current.introStartCamera.copy(camera.position);
            galaxyTransitionRef.current.introEndCamera.set(
                SOLAR_SYSTEM_DEFAULT_POSITION.x,
                SOLAR_SYSTEM_DEFAULT_POSITION.y,
                SOLAR_SYSTEM_DEFAULT_POSITION.z
            );
            setOverlayOpacity(1);
        }
        ctrlRef.current = controls;
        const handleControlsInteraction = () => {
            markInteractionHot();
        };
        controls.addEventListener('start', handleControlsInteraction);
        controls.addEventListener('change', handleControlsInteraction);

        const starSpriteTexture = makeStarSpriteTexture();

        // Étoiles de fond
        const STAR_COUNT = 10000;
        const starPositions = new Float32Array(STAR_COUNT * 3);
        const starColors = new Float32Array(STAR_COUNT * 3);
        for (let i = 0; i < STAR_COUNT; i++) {
            starPositions[i * 3]     = (Math.random() - 0.5) * 900;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 900;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 900;
            // Légère variation de teinte : blanc pur, blanc-bleuté, blanc-jaunâtre
            const tint = Math.random();
            if (tint < 0.5) {
                starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1;
            } else if (tint < 0.75) {
                starColors[i * 3] = 0.88; starColors[i * 3 + 1] = 0.93; starColors[i * 3 + 2] = 1;
            } else {
                starColors[i * 3] = 1; starColors[i * 3 + 1] = 0.97; starColors[i * 3 + 2] = 0.88;
            }
        }
        const starsGeo = new THREE.BufferGeometry();
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({
            map: starSpriteTexture,
            vertexColors: true,
            size: 0.30,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.92,
            depthWrite: false,
            alphaTest: 0.02,
        })));
        const galaxyDisk = new THREE.Group();
        galaxyRoot.add(galaxyDisk);

        const coreGlowTexture = makeSoftDiscTexture({
            innerColor: 'rgba(255,244,224,0.98)',
            midColor: 'rgba(255,215,166,0.38)',
            outerColor: 'rgba(255,255,255,0)',
            size: 256,
        });
        const armRibbonTexture = makeGlowBandTexture({
            centerColor: 'rgba(223,236,255,0.96)',
            edgeColor: 'rgba(255,255,255,0)',
        });
        const armRibbonCoreTexture = makeGlowBandTexture({
            centerColor: 'rgba(245,248,255,0.98)',
            edgeColor: 'rgba(255,255,255,0)',
        });
        const hiiTexture = makeSoftDiscTexture({
            innerColor: 'rgba(255,194,206,0.92)',
            midColor: 'rgba(255,108,138,0.26)',
            outerColor: 'rgba(0,0,0,0)',
            size: 256,
        });
        const dustTexture = makeSoftDiscTexture({
            innerColor: 'rgba(18,14,12,0.9)',
            midColor: 'rgba(6,5,5,0.34)',
            outerColor: 'rgba(0,0,0,0)',
            size: 256,
        });
        const armDefinitions = [
            { phase: 0.28, twist: 0.168, width: 0.125, start: 5, end: 92, weight: 1.3, primary: true, sway: 0.045 },
            { phase: Math.PI + 0.28, twist: 0.168, width: 0.125, start: 5, end: 92, weight: 1.3, primary: true, sway: 0.045 },
            { phase: Math.PI / 2 + 0.72, twist: 0.154, width: 0.17, start: 8, end: 84, weight: 0.72, primary: false, sway: 0.038 },
            { phase: (Math.PI * 3) / 2 + 0.72, twist: 0.154, width: 0.17, start: 8, end: 84, weight: 0.72, primary: false, sway: 0.038 },
        ];
        const armWeightSum = armDefinitions.reduce((sum, arm) => sum + arm.weight, 0);
        const pickArm = () => {
            let value = Math.random() * armWeightSum;
            for (const arm of armDefinitions) {
                value -= arm.weight;
                if (value <= 0) return arm;
            }
            return armDefinitions[0];
        };
        const getArmCenterPoint = (arm, radius) => {
            const localRadius = Math.max(radius - arm.start, 0);
            const wave = Math.sin(localRadius * 0.085 + arm.phase * 1.3) * arm.sway;
            const angle = arm.phase + localRadius * arm.twist + wave;
            return {
                angle,
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
            };
        };
        const sampleArmPoint = (arm, radius, scatterScale = 1) => {
            const centerPoint = getArmCenterPoint(arm, radius);
            const radiusBlend = THREE.MathUtils.smoothstep(radius, arm.start, arm.end);
            const widthScale = THREE.MathUtils.lerp(1.85, 1.0, Math.pow(radiusBlend, 0.78));
            const angleNoise = (Math.random() - 0.5) * (arm.width + radius * 0.0018) * 6 * scatterScale * widthScale;
            const radialNoise = (Math.random() - 0.5) * THREE.MathUtils.lerp(2.8, 1.2, radiusBlend);
            const angle = centerPoint.angle + angleNoise;
            return {
                angle,
                x: Math.cos(angle) * (radius + radialNoise),
                z: Math.sin(angle) * (radius + radialNoise),
            };
        };
        const buildArmRibbon = (arm, {
            texture,
            widthStart,
            widthEnd,
            opacity,
            color,
            innerRadius = arm.start,
            outerRadius = arm.end,
            steps = 180,
            thicknessLift = 0,
        }) => {
            const positions = [];
            const uvs = [];
            const indices = [];
            const colors = [];

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, t);
                const center = getArmCenterPoint(arm, radius);
                const prev = getArmCenterPoint(arm, Math.max(innerRadius, radius - 0.4));
                const next = getArmCenterPoint(arm, Math.min(outerRadius, radius + 0.4));
                const tangent = new THREE.Vector2(next.x - prev.x, next.z - prev.z).normalize();
                const normal = new THREE.Vector2(-tangent.y, tangent.x);
                const width = THREE.MathUtils.lerp(widthStart, widthEnd, Math.pow(t, 0.72));
                const halfWidth = width * 0.5;
                const centerY = Math.sin(t * Math.PI * 2.2 + arm.phase * 1.4) * THREE.MathUtils.lerp(thicknessLift, thicknessLift * 0.22, t);

                positions.push(
                    center.x - normal.x * halfWidth, centerY, center.z - normal.y * halfWidth,
                    center.x + normal.x * halfWidth, centerY, center.z + normal.y * halfWidth
                );
                uvs.push(t, 0, t, 1);
                colors.push(color.r, color.g, color.b, color.r, color.g, color.b);

                if (i < steps) {
                    const base = i * 2;
                    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
                }
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setIndex(indices);

            return new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity,
                    color: 0xffffff,
                    vertexColors: true,
                    depthWrite: false,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                })
            );
        };

        const buildGalaxyPopulation = (count, size, opacity, palette, thicknessScale = 1) => {
            const positions = [];
            const colors = [];

            for (let i = 0; i < count; i++) {
                const selector = Math.random();
                let x = 0;
                let y = 0;
                let z = 0;
                let color;

                if (selector < 0.11) {
                    const r = Math.pow(Math.random(), 1.6) * 22;
                    const theta = Math.random() * Math.PI * 2;
                    x = Math.cos(theta) * r;
                    z = Math.sin(theta) * r;
                    y = (Math.random() - 0.5) * (2.8 - r * 0.06) * thicknessScale;
                    color = palette.core.clone().lerp(palette.disk, Math.min(r / 22, 1));
                } else {
                    const arm = pickArm();
                    const radius = arm.start + Math.pow(Math.random(), arm.primary ? 2.05 : 1.72) * (arm.end - arm.start);
                    const point = sampleArmPoint(arm, radius, arm.primary ? 0.92 : 1.08);
                    x = point.x;
                    z = point.z;
                    y = (Math.random() - 0.5) * Math.max(0.12, 1.55 - radius * 0.012) * thicknessScale;

                    const edgeBlend = THREE.MathUtils.smoothstep(radius, 16, arm.end);
                    const armColor = arm.primary ? palette.armPrimary : palette.armSecondary;
                    color = palette.disk.clone().lerp(armColor, 0.45 + edgeBlend * 0.5);
                    if (radius < 30) {
                        color.lerp(palette.core, 0.25);
                    }
                }

                positions.push(x, y, z);
                colors.push(color.r, color.g, color.b);
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            return new THREE.Points(geo, new THREE.PointsMaterial({
                map: starSpriteTexture,
                size,
                vertexColors: true,
                transparent: true,
                opacity,
                sizeAttenuation: true,
                depthWrite: false,
                alphaTest: 0.02,
                blending: THREE.AdditiveBlending,
            }));
        };

        const buildBulgePopulation = (count, size, opacity, colorA, colorB, options = {}) => {
            const {
                radiusMax = 30,
                concentration = 1.52,
                verticalScale = 0.58,
                radialJitter = 0.12,
                depthJitter = 0.1,
                centerDepthSpread = 0,
                edgeDepthSpread = 0,
                colorFalloff = 24,
            } = options;
            const positions = [];
            const colors = [];

            for (let i = 0; i < count; i++) {
                const r = Math.pow(Math.random(), concentration) * radiusMax;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
                const sinPhi = Math.sin(phi);
                const radialScale = 0.94 + Math.random() * radialJitter;
                const x = Math.cos(theta) * sinPhi * r * radialScale;
                const depthSpread = THREE.MathUtils.lerp(
                    centerDepthSpread,
                    edgeDepthSpread,
                    Math.pow(Math.min(r / Math.max(radiusMax, 1), 1), 0.78)
                );
                const z = Math.sin(theta) * sinPhi * r * (0.96 + Math.random() * depthJitter)
                    + (Math.random() - 0.5) * depthSpread;
                const y = Math.cos(phi) * r * verticalScale;
                const t = Math.min(r / colorFalloff, 1);
                const color = colorA.clone().lerp(colorB, t);

                positions.push(x, y, z);
                colors.push(color.r, color.g, color.b);
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            return new THREE.Points(geo, new THREE.PointsMaterial({
                map: starSpriteTexture,
                size,
                vertexColors: true,
                transparent: true,
                opacity,
                sizeAttenuation: true,
                depthWrite: false,
                alphaTest: 0.02,
                blending: THREE.AdditiveBlending,
            }));
        };

        const buildBulgeHaloPopulation = (count, size, opacity, colorA, colorB, options = {}) => {
            const {
                radiusMax = 23,
                concentration = 1.75,
                verticalScale = 0.82,
                radialJitter = 0.16,
                centerDepthSpread = 0,
                edgeDepthSpread = 0,
                colorFalloff = 18,
            } = options;
            const positions = [];
            const colors = [];

            for (let i = 0; i < count; i++) {
                const r = Math.pow(Math.random(), concentration) * radiusMax;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
                const sinPhi = Math.sin(phi);
                const x = Math.cos(theta) * sinPhi * r * (0.94 + Math.random() * radialJitter);
                const depthSpread = THREE.MathUtils.lerp(
                    centerDepthSpread,
                    edgeDepthSpread,
                    Math.pow(Math.min(r / Math.max(radiusMax, 1), 1), 0.78)
                );
                const z = Math.sin(theta) * sinPhi * r * (0.94 + Math.random() * radialJitter)
                    + (Math.random() - 0.5) * depthSpread;
                const y = Math.cos(phi) * r * verticalScale;
                const t = Math.min(r / colorFalloff, 1);
                const color = colorA.clone().lerp(colorB, t);

                positions.push(x, y, z);
                colors.push(color.r, color.g, color.b);
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            return new THREE.Points(geo, new THREE.PointsMaterial({
                map: starSpriteTexture,
                size,
                vertexColors: true,
                transparent: true,
                opacity,
                sizeAttenuation: true,
                depthWrite: false,
                alphaTest: 0.02,
                blending: THREE.AdditiveBlending,
            }));
        };

        const galaxySmallStars = buildGalaxyPopulation(43000, 0.32, 0.68, {
            core: new THREE.Color('#fbe9cd'),
            disk: new THREE.Color('#d7d4cb'),
            armPrimary: new THREE.Color('#bfd6f5'),
            armSecondary: new THREE.Color('#aebfd8'),
        }, 1.45);
        const galaxyMidStars = buildGalaxyPopulation(20500, 0.58, 0.84, {
            core: new THREE.Color('#fff3df'),
            disk: new THREE.Color('#ece1cd'),
            armPrimary: new THREE.Color('#d5e4ff'),
            armSecondary: new THREE.Color('#bccde9'),
        }, 1.32);
        const galaxyGiantStars = buildGalaxyPopulation(3400, 1.08, 0.9, {
            core: new THREE.Color('#ffd49e'),
            disk: new THREE.Color('#fff1dc'),
            armPrimary: new THREE.Color('#e2ebff'),
            armSecondary: new THREE.Color('#cad8ef'),
        }, 1.24);
        const galaxyBulge = buildBulgePopulation(
            15500,
            0.48,
            0.77,
            new THREE.Color('#fff7ea'),
            new THREE.Color('#ffd69a'),
            {
                radiusMax: 52,
                concentration: 1.32,
                verticalScale: 0.34,
                radialJitter: 0.24,
                depthJitter: 0.2,
                centerDepthSpread: 32,
                edgeDepthSpread: 0.35,
                colorFalloff: 40,
            }
        );
        const galaxyBulgeCore = buildBulgePopulation(
            9800,
            0.68,
            0.84,
            new THREE.Color('#fffef8'),
            new THREE.Color('#ffe3b8'),
            {
                radiusMax: 38,
                concentration: 1.72,
                verticalScale: 0.36,
                radialJitter: 0.2,
                depthJitter: 0.16,
                centerDepthSpread: 25,
                edgeDepthSpread: 0.3,
                colorFalloff: 28,
            }
        );
        const galaxyBulgeHalo = buildBulgeHaloPopulation(
            9200,
            0.56,
            0.72,
            new THREE.Color('#fff8ec'),
            new THREE.Color('#ffdcb1'),
            {
                radiusMax: 50,
                concentration: 1.28,
                verticalScale: 0.52,
                radialJitter: 0.28,
                centerDepthSpread: 19,
                edgeDepthSpread: 0.28,
                colorFalloff: 36,
            }
        );

        galaxyDisk.add(galaxySmallStars);
        galaxyDisk.add(galaxyMidStars);
        galaxyDisk.add(galaxyGiantStars);
        galaxyDisk.add(galaxyBulge);
        galaxyDisk.add(galaxyBulgeCore);
        galaxyDisk.add(galaxyBulgeHalo);
        const armGlowRibbons = armDefinitions.map((arm) => {
            const broadRibbon = buildArmRibbon(arm, {
                texture: armRibbonTexture,
                widthStart: arm.primary ? 27 : 20,
                widthEnd: arm.primary ? 12.5 : 9.4,
                opacity: arm.primary ? 0.37 : 0.27,
                color: arm.primary ? new THREE.Color('#bfd3f3') : new THREE.Color('#aebfd8'),
                innerRadius: arm.start,
                outerRadius: arm.end,
                steps: arm.primary ? 220 : 190,
                thicknessLift: arm.primary ? 0.85 : 0.58,
            });
            const coreRibbon = buildArmRibbon(arm, {
                texture: armRibbonCoreTexture,
                widthStart: arm.primary ? 15.5 : 11.6,
                widthEnd: arm.primary ? 7 : 5.1,
                opacity: arm.primary ? 0.3 : 0.22,
                color: arm.primary ? new THREE.Color('#e4ecff') : new THREE.Color('#d0daf0'),
                innerRadius: arm.start,
                outerRadius: arm.end,
                steps: arm.primary ? 220 : 190,
                thicknessLift: arm.primary ? 0.46 : 0.3,
            });
            galaxyDisk.add(broadRibbon);
            galaxyDisk.add(coreRibbon);
            return { broadRibbon, coreRibbon };
        });

        const coreGlowSpecs = [
            { size: 24, opacity: 0.96, x: 0, z: 0, y: 0.03 },
            { size: 42, opacity: 0.34, x: 0.6, z: -0.3, y: 0.02 },
            { size: 70, opacity: 0.12, x: -0.4, z: 0.5, y: 0.0 },
        ];
        const coreGlows = coreGlowSpecs.map((spec) => {
            const glow = new THREE.Mesh(
                new THREE.PlaneGeometry(spec.size, spec.size),
                new THREE.MeshBasicMaterial({
                    map: coreGlowTexture,
                    transparent: true,
                    opacity: spec.opacity,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                })
            );
            glow.position.set(spec.x, spec.y, spec.z);
            glow.rotation.x = -Math.PI / 2;
            galaxyDisk.add(glow);
            return glow;
        });

        const haloGeo = new THREE.BufferGeometry();
        const haloPoints = [];
        const haloColors = [];
        for (let i = 0; i < 3200; i++) {
            const radius = 18 + Math.pow(Math.random(), 0.58) * 98;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * (10 + radius * 0.04);
            const haloColor = new THREE.Color('#b8cae7').lerp(new THREE.Color('#fff2d2'), Math.random() * 0.3);
            haloPoints.push(x, y, z);
            haloColors.push(haloColor.r, haloColor.g, haloColor.b);
        }
        haloGeo.setAttribute('position', new THREE.Float32BufferAttribute(haloPoints, 3));
        haloGeo.setAttribute('color', new THREE.Float32BufferAttribute(haloColors, 3));
        const halo = new THREE.Points(haloGeo, new THREE.PointsMaterial({
            map: starSpriteTexture,
            size: 0.36,
            vertexColors: true,
            transparent: true,
            opacity: 0.18,
            sizeAttenuation: true,
            depthWrite: false,
            alphaTest: 0.02,
        }));
        galaxyRoot.add(halo);

        const dustBands = [];
        for (let i = 0; i < 120; i++) {
            const arm = pickArm();
            const radius = Math.max(12, arm.start - 2 + Math.pow(Math.random(), 0.78) * (arm.end - arm.start - 4));
            const point = sampleArmPoint(arm, radius, 0.44);
            const laneRadius = radius - (arm.primary ? 1.4 : 0.8);
            const laneAngle = point.angle - (arm.primary ? 0.055 : 0.035);
            const lane = new THREE.Mesh(
                new THREE.PlaneGeometry(4 + Math.random() * 11, 1.8 + Math.random() * 4.6),
                new THREE.MeshBasicMaterial({
                    map: dustTexture,
                    transparent: true,
                    opacity: 0.18 + Math.random() * 0.16,
                    depthWrite: false,
                    alphaTest: 0.004,
                    blending: THREE.NormalBlending,
                })
            );
            lane.position.set(
                Math.cos(laneAngle) * laneRadius,
                (Math.random() - 0.5) * 0.22,
                Math.sin(laneAngle) * laneRadius
            );
            lane.rotation.x = -Math.PI / 2;
            lane.rotation.z = laneAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.18;
            dustBands.push(lane);
            galaxyDisk.add(lane);
        }

        const gasClouds = [];
        for (let i = 0; i < 54; i++) {
            const arm = pickArm();
            const radius = Math.max(22, arm.start + Math.pow(Math.random(), 0.75) * (arm.end - arm.start));
            const point = sampleArmPoint(arm, radius, 0.3);
            const cloud = new THREE.Mesh(
                new THREE.PlaneGeometry(1.2 + Math.random() * 3.8, 1.2 + Math.random() * 3.8),
                new THREE.MeshBasicMaterial({
                    map: hiiTexture,
                    transparent: true,
                    opacity: 0.22 + Math.random() * 0.22,
                    depthWrite: false,
                    alphaTest: 0.004,
                    blending: THREE.AdditiveBlending,
                })
            );
            cloud.position.set(point.x, (Math.random() - 0.5) * 0.16, point.z);
            cloud.rotation.x = -Math.PI / 2;
            cloud.rotation.z = Math.random() * Math.PI;
            gasClouds.push(cloud);
            galaxyDisk.add(cloud);
        }

        const galaxySunPoint = getArmCenterPoint(armDefinitions[0], GALAXY_SUN_ORBIT_RADIUS);
        const galaxySun = makeSphere(0.9, '#fff3b0', '#ffcf66', 32);
        galaxySun.position.set(galaxySunPoint.x, 0.16, galaxySunPoint.z);
        galaxySun.userData = { type: 'galaxy-sun' };
        galaxyDisk.add(galaxySun);
        galaxySunRef.current = galaxySun;

        // Éclairage
        // Ambiance faible → côté nuit sombre, côté jour tranché
        scene.add(new THREE.AmbientLight(0x334466, 1.8));
        // Soleil : distance=0 (pas de coupure), decay=1 (1/r au lieu de 1/r²) pour atteindre les planètes lointaines
        const sunLight = new THREE.PointLight(0xfff5e0, 420, 0, 1);
        scene.add(sunLight);

        // Soleil
        const sunMesh = makeSphere(5.5, '#ffe880', '#000000');
        sunMesh.material.emissive.set(0xffaa22);
        sunMesh.material.emissiveIntensity = 2.5;
        sunMesh.userData = { type: 'sun' };
        primeBoilingMesh(sunMesh);
        solarSystemRoot.add(sunMesh);

        // Planètes
        PLANET_DATA.forEach((cfg, i) => {
            const orbitRadius = getCompressedPlanetRadius(cfg.name, planets);
            const orbitSpeed = getCompressedPlanetSpeed(cfg.name, planets);
            const orbitGroup = new THREE.Group();
            orbitGroup.rotation.x = getOrbitalInclination(
                planets.find((planet) => planet.id === cfg.name),
                0
            );
            solarSystemRoot.add(orbitGroup);

            // Arc de traîne 180° dans le même plan orbital que la planète.
            const arc = makeTrailArc(orbitRadius);
            orbitGroup.add(arc);

            const group = new THREE.Group();
            orbitGroup.add(group);

            // tiltGroup : axe de rotation incliné, fixe
            const tiltGroup = new THREE.Group();
            tiltGroup.rotation.z = THREE.MathUtils.degToRad(cfg.tilt);
            group.add(tiltGroup);

            const mesh = makeSphere(cfg.size, cfg.color, cfg.emissive, 48);
            mesh.userData = { type: 'planet', name: cfg.name };
            tiltGroup.add(mesh);
            let ring = null;
            if (cfg.name === 'saturne') {
                ring = makeSaturnRings(cfg.size);
                tiltGroup.add(ring);
            }

            const initAngle = Math.random() * Math.PI * 2;
            group.position.set(Math.cos(initAngle) * orbitRadius, 0, Math.sin(initAngle) * orbitRadius);

            planetsRef.current[cfg.name] = { orbitGroup, group, mesh, arc, ring, angle: initAngle, r: orbitRadius, speed: orbitSpeed };
        });

        const marsRadius = getCompressedPlanetRadius('mars', planets);
        const jupiterRadius = getCompressedPlanetRadius('jupiter', planets);
        const asteroidBeltInner = marsRadius + (jupiterRadius - marsRadius) * 0.28;
        const asteroidBeltOuter = marsRadius + (jupiterRadius - marsRadius) * 0.62;

        asteroids.forEach((asteroid, i) => {
            const beltSpread = Math.max(asteroidBeltOuter - asteroidBeltInner, 1.5);
            const orbitRadius = asteroidBeltInner + (i / Math.max(asteroids.length - 1, 1)) * beltSpread + ((i % 3) - 1) * 0.22;
            const size = THREE.MathUtils.clamp((asteroid.meanRadius ?? 40) / 900, 0.035, 0.18);
            const mesh = makeSphere(size, '#a59a8a', '#120f0b', 18);
            const angle = Math.random() * Math.PI * 2;
            const height = ((i % 5) - 2) * 0.08;

            mesh.position.set(Math.cos(angle) * orbitRadius, height, Math.sin(angle) * orbitRadius);
            mesh.userData = { type: 'asteroid', name: asteroid.id };
            solarSystemRoot.add(mesh);

            asteroidsRef.current.push({
                mesh,
                angle,
                r: orbitRadius,
                speed: 0.004 + (i % 5) * 0.0005,
                y: height,
            });
        });

        // Textures planètes
        const loader = new THREE.TextureLoader();

        // Planètes — /textures/planets/{id}.jpg
        Object.keys(planetsRef.current).forEach((name) => {
            loader.load(`/textures/planets/${name}.jpg`, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                const planet = planetsRef.current[name];
                if (!planet) return;
                planet.mesh.material.map = tex;
                planet.mesh.material.color.set(0xffffff);
                planet.mesh.material.emissive.set(0x000000);
                planet.mesh.material.emissiveIntensity = 0;
                planet.mesh.material.needsUpdate = true;
            });
        });

        // Soleil — /textures/stars/soleil.jpg
        loader.load('/textures/stars/soleil.jpg', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;

            // On applique la texture comme couleur de base
            sunMesh.material.map = tex;
            // On l'applique aussi sur l'émission pour qu'elle brille avec ses propres motifs
            sunMesh.material.emissiveMap = tex;

            // On réinitialise les couleurs à blanc pour que la texture s'affiche avec ses couleurs réelles
            sunMesh.material.color.set(0xffffff);
            sunMesh.material.emissive.set(0xffffff);

            sunMesh.material.needsUpdate = true;

            if (galaxySunRef.current) {
                galaxySunRef.current.material.map = tex;
                galaxySunRef.current.material.emissiveMap = tex;
                galaxySunRef.current.material.color.set(0xffffff);
                galaxySunRef.current.material.emissive.set(0xffffff);
                galaxySunRef.current.material.emissiveIntensity = 1.9;
                galaxySunRef.current.material.needsUpdate = true;
            }
        });

        // Texture anneaux Saturne — /textures/planets/saturne_anneaux.png
        loader.load('/textures/planets/saturne_anneaux.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const saturn = planetsRef.current['saturne'];
            if (!saturn) return;
            let ring = null;
            saturn.group.traverse(obj => {
                if (obj.geometry?.type === 'RingGeometry') ring = obj;
            });
            if (!ring) return;
            ring.material.map = tex;
            ring.material.color.set(0xffffff);
            ring.material.needsUpdate = true;
        });

        // Resize
        const onResize = () => {
            const w = el.clientWidth, h = el.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            markInteractionHot();
        };
        window.addEventListener('resize', onResize);

        const onVisibilityChange = () => {
            sceneVisibilityRef.current = !document.hidden;
            markInteractionHot();
        };
        sceneVisibilityRef.current = !document.hidden;
        document.addEventListener('visibilitychange', onVisibilityChange);

        // ── Zoom vers le curseur / pinch ──────────────────────────────────
        const MAX_DIST = 180;
        const zoomRc = new THREE.Raycaster();
        const zoomAnchor = new THREE.Vector3();
        const zoomOffset = new THREE.Vector3();
        const cameraForward = new THREE.Vector3();
        const targetPlane = new THREE.Plane();

        const applyZoom = (clientX, clientY, sign) => {
            // sign > 0 = zoom out, sign < 0 = zoom in
            const rect = el.getBoundingClientRect();
            const ndx = ((clientX - rect.left) / rect.width) * 2 - 1;
            const ndy = -((clientY - rect.top) / rect.height) * 2 + 1;

            zoomRc.setFromCamera(new THREE.Vector2(ndx, ndy), camera);

            const dist = camera.position.distanceTo(controls.target);
            const step = dist * 0.06 * sign;
            const newDist = dist + step;
            const minDist = getActiveTargetMinDistance(
                camera,
                selectedMoonRef.current,
                selectedAsteroidRef.current,
                selectedPlanetRef.current,
                moonsRef.current,
                asteroidsRef.current,
                planetsRef.current,
            );
            minCamDistRef.current = minDist;
            if (newDist < minDist || newDist > MAX_DIST) return;

            const isSolarSystemMode = !selectedPlanetRef.current && !selectedMoonRef.current && !selectedAsteroidRef.current;
            if (isSolarSystemMode) {
                zoomOffset.copy(camera.position).sub(controls.target).setLength(newDist);
                camera.position.copy(controls.target).add(zoomOffset);
                targetCamDistRef.current = newDist;
                return;
            }

            camera.getWorldDirection(cameraForward);
            targetPlane.setFromNormalAndCoplanarPoint(cameraForward, controls.target);

            if (zoomRc.ray.intersectPlane(targetPlane, zoomAnchor)) {
                const zoomRatio = 1 - (newDist / dist);
                zoomOffset.copy(zoomAnchor).sub(controls.target).multiplyScalar(zoomRatio);
                controls.target.add(zoomOffset);
                camera.position.add(zoomOffset);
            }

            zoomOffset.copy(camera.position).sub(controls.target).setLength(newDist);
            camera.position.copy(controls.target).add(zoomOffset);
            targetCamDistRef.current = newDist;
        };

        const onWheel = (e) => {
            e.preventDefault();
            markInteractionHot();
            applyZoom(e.clientX, e.clientY, e.deltaY > 0 ? 1 : -1);
        };

        let pinchDist = 0;
        const onTouchStart = (e) => {
            markInteractionHot();
            if (e.touches.length === 2) {
                pinchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY,
                );
            }
        };
        const onTouchMove = (e) => {
            if (e.touches.length !== 2 || !pinchDist) return;
            markInteractionHot();
            const d = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY,
            );
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            // delta positif = doigts se rapprochent = zoom in
            applyZoom(midX, midY, (pinchDist - d) * 0.04);
            pinchDist = d;
        };
        const onTouchEnd = () => {
            pinchDist = 0;
            markInteractionHot();
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: true });
        el.addEventListener('touchend', onTouchEnd);

        // ── Boucle de rendu ────────────────────────────────────────────────
        const camDir = new THREE.Vector3();
        const moonWorldPos = new THREE.Vector3();
        const focusTargetWorldPos = new THREE.Vector3();
        const transitionCameraPos = new THREE.Vector3();
        const transitionTarget = new THREE.Vector3();
        let lastRenderTime = performance.now() - FRAME_TIME_60FPS;

        const animate = (now = performance.now()) => {
            frameRef.current = requestAnimationFrame(animate);
            if (!sceneVisibilityRef.current) {
                lastRenderTime = now;
                return;
            }

            const transition = galaxyTransitionRef.current;
            const isMilkyWay = isMilkyWayModeRef.current;
            const isInteractive = pointerRef.current.down || now < interactionBoostUntilRef.current || transition.phase !== 'idle';
            const targetFps = isInteractive
                ? 60
                : (isMilkyWay ? GALAXY_IDLE_FPS : SOLAR_SYSTEM_IDLE_FPS);
            const targetFrameTime = FRAME_TIME_60FPS * (60 / targetFps);
            const elapsed = now - lastRenderTime;
            if (elapsed < targetFrameTime) return;

            const deltaMs = Math.min(elapsed, 100);
            const deltaFrames = deltaMs / FRAME_TIME_60FPS;
            const damp = (base) => 1 - Math.pow(1 - base, deltaFrames);
            lastRenderTime = now;

            solarSystemRoot.visible = !isMilkyWay;
            galaxyRoot.visible = isMilkyWay;

            if (isMilkyWay) {
                galaxyDisk.rotation.y += GALAXY_ROTATION_SPEED * deltaFrames;
                halo.rotation.y += GALAXY_HALO_ROTATION_SPEED * deltaFrames;
                coreGlows.forEach((glow, index) => {
                    glow.material.opacity = coreGlowSpecs[index].opacity * (0.96 + Math.sin(now * 0.00035 + index) * 0.04);
                });
                armGlowRibbons.forEach(({ broadRibbon, coreRibbon }, index) => {
                    broadRibbon.material.opacity = (index < 2 ? 0.2 : 0.13) * (0.98 + Math.sin(now * 0.00016 + index) * 0.03);
                    coreRibbon.material.opacity = (index < 2 ? 0.15 : 0.1) * (0.98 + Math.sin(now * 0.00019 + index * 1.7) * 0.03);
                });
                gasClouds.forEach((cloud, index) => {
                    cloud.material.opacity = 0.18 + ((Math.sin(now * 0.00045 + index * 0.51) + 1) * 0.5) * 0.16;
                });
                galaxySun.rotation.y += 0.01 * deltaFrames;
                if (transition.phase === 'galaxy-approach') {
                    galaxySun.updateWorldMatrix(true, false);
                    galaxySun.getWorldPosition(transition.sunWorld);
                    transition.progress = Math.min(transition.progress + GALAXY_TO_SOLAR_APPROACH_STEP * deltaFrames, 1);
                    const eased = 1 - Math.pow(1 - transition.progress, 3);
                    transitionTarget.lerpVectors(transition.startTarget, transition.sunWorld, eased);
                    controls.target.copy(transitionTarget);
                    transitionCameraPos.copy(transition.cameraDir).multiplyScalar(
                        THREE.MathUtils.lerp(transition.startDistance, GALAXY_SUN_FOCUS_DISTANCE, eased)
                    );
                    camera.position.copy(controls.target).add(transitionCameraPos);
                    setOverlayOpacity(THREE.MathUtils.smoothstep(transition.progress, GALAXY_TO_SOLAR_FADE_TRIGGER, 1));
                    controls.enabled = false;
                    if (transition.progress >= 1) {
                        transition.phase = 'await-solar-system';
                        focusOnSolarSystem();
                    }
                } else {
                    controls.enabled = true;
                    setOverlayOpacity(0);
                }
                controls.update();
                renderer.render(scene, camera);
                return;
            }

            if (transition.phase === 'solar-arrival') {
                transition.progress = Math.min(transition.progress + SOLAR_SYSTEM_INTRO_STEP * deltaFrames, 1);
                const eased = 1 - Math.pow(1 - transition.progress, 4);
                camera.position.lerpVectors(transition.introStartCamera, transition.introEndCamera, eased);
                controls.target.set(0, 0, 0);
                setOverlayOpacity(1 - THREE.MathUtils.smoothstep(transition.progress, 0.08, 0.9));
                if (transition.progress >= 1) {
                    transition.phase = 'idle';
                    controls.enabled = true;
                    minCamDistRef.current = getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5);
                    targetCamDistRef.current = camera.position.distanceTo(controls.target);
                    setOverlayOpacity(0);
                }
                controls.update();
                renderer.render(scene, camera);
                return;
            }

            updateBoilingMesh(sunMesh, now);
            const sunPulse = 1
                + Math.sin(now * SUN_PULSE_SPEED) * 0.01
                + Math.sin(now * SUN_PULSE_SPEED * 1.91) * 0.005;
            sunMesh.scale.setScalar(sunPulse);
            sunMesh.rotation.y += 0.0016 * deltaFrames;
            sunMesh.material.emissiveIntensity = 2.45
                + Math.sin(now * SUN_PULSE_SPEED * 1.3) * 0.14
                + Math.sin(now * SUN_PULSE_SPEED * 2.6) * 0.06;
            sunLight.intensity = 420
                + Math.sin(now * SUN_PULSE_SPEED * 1.2) * 10
                + Math.sin(now * SUN_PULSE_SPEED * 2.1) * 5;

            const sel = selectedPlanetRef.current;
            const selAsteroid = selectedAsteroidRef.current;

            PLANET_DATA.forEach(cfg => {
                const p = planetsRef.current[cfg.name];
                if (!p) return;

                // Orbite
                p.angle += THREE.MathUtils.degToRad(p.speed) * deltaFrames;
                p.group.position.set(Math.cos(p.angle) * p.r, 0, Math.sin(p.angle) * p.r);
                p.mesh.rotation.y += 0.004 * cfg.rotDir * deltaFrames;

                // Aligne l'extrémité de la traînée sur le centre courant de la planète.
                p.arc.rotation.y = Math.PI - p.angle;

                // Opacité : lors d'un focus, cacher tout sauf la planète sélectionnée
                const isSel = cfg.name === sel;
                const targetMeshOp = sel && !isSel ? 0 : 1.0;
                const targetArcOp  = sel ? (isSel ? 0.4 : 0) : 0.4;
                p.mesh.material.opacity = THREE.MathUtils.lerp(p.mesh.material.opacity, targetMeshOp, damp(0.06));
                p.arc.material.opacity  = THREE.MathUtils.lerp(p.arc.material.opacity,  targetArcOp,  damp(0.06));
                if (p.ring?.material) {
                    const targetRingOp = sel ? (isSel ? 0.75 : 0) : 0.75;
                    p.ring.material.opacity = THREE.MathUtils.lerp(p.ring.material.opacity, targetRingOp, damp(0.06));
                }
            });

            asteroidsRef.current.forEach((asteroid) => {
                asteroid.angle += asteroid.speed * deltaFrames;
                asteroid.mesh.position.set(
                    Math.cos(asteroid.angle) * asteroid.r,
                    asteroid.y,
                    Math.sin(asteroid.angle) * asteroid.r
                );

                const isSel = asteroid.mesh.userData.name === selAsteroid;
                const targetOpacity = sel ? 0 : (selAsteroid ? (isSel ? 1 : 0.25) : 0.85);
                asteroid.mesh.material.opacity = THREE.MathUtils.lerp(asteroid.mesh.material.opacity, targetOpacity, damp(0.08));
            });

            // Lunes
            moonsRef.current.forEach(m => {
                m.angle -= THREE.MathUtils.degToRad(m.speed) * deltaFrames;
                m.mesh.position.set(Math.cos(m.angle) * m.radius, 0, Math.sin(m.angle) * m.radius);
                // Même logique pour les lunes : l'extrémité lumineuse doit passer par le centre.
                m.arc.rotation.y = -m.angle;
                m.mesh.rotation.y -= 0.008 * deltaFrames;
            });

            // Suivi cible
            const selMoon = selectedMoonRef.current;
            if (selMoon) {
                const moonEntry = moonsRef.current.find(m => m.mesh.userData.name === selMoon);
                if (moonEntry) {
                    moonEntry.mesh.getWorldPosition(moonWorldPos);
                    followTarget(controls, camera, moonWorldPos);
                }
            } else if (selAsteroid) {
                const asteroidEntry = asteroidsRef.current.find(a => a.mesh.userData.name === selAsteroid);
                if (asteroidEntry) {
                    focusTargetWorldPos.copy(asteroidEntry.mesh.position);
                    followTarget(controls, camera, focusTargetWorldPos);
                }
            } else if (sel && planetsRef.current[sel]) {
                planetsRef.current[sel].group.getWorldPosition(focusTargetWorldPos);
                followTarget(controls, camera, focusTargetWorldPos);
            }

            if (!selectedPlanetRef.current && !selectedMoonRef.current && !selectedAsteroidRef.current) {
                let nearestPlanet = null;
                let nearestDistance = Infinity;

                Object.entries(planetsRef.current).forEach(([name, planetEntry]) => {
                    planetEntry.group.getWorldPosition(focusTargetWorldPos);
                    const distanceToSurface = camera.position.distanceTo(focusTargetWorldPos) - planetEntry.mesh.geometry.parameters.radius;
                    if (distanceToSurface < nearestDistance) {
                        nearestDistance = distanceToSurface;
                        nearestPlanet = name;
                    }
                });

                const nextProximityPlanet = nearestDistance <= 10 ? nearestPlanet : null;
                if (proximityPlanetRef.current !== nextProximityPlanet) {
                    proximityPlanetRef.current = nextProximityPlanet;
                    setProximityPlanet(nextProximityPlanet);
                }
            } else if (proximityPlanetRef.current !== null) {
                proximityPlanetRef.current = null;
                setProximityPlanet(null);
            }

            // Zoom programmé — targetCamDistRef est mis à jour par les useEffect de focus
            // ET par applyZoom (zoom manuel), donc les deux coexistent sans conflit.
            camDir.subVectors(camera.position, controls.target);
            const currentDist = camDir.length();
            const minAllowedDist = getActiveTargetMinDistance(
                camera,
                selectedMoonRef.current,
                selectedAsteroidRef.current,
                selectedPlanetRef.current,
                moonsRef.current,
                asteroidsRef.current,
                planetsRef.current,
            );
            minCamDistRef.current = minAllowedDist;
            const desiredDist = Math.max(targetCamDistRef.current, minAllowedDist);
            // Pour les lunes : correction immédiate (rate=1) car elles bougent vite
            // par rapport à focusDist — un lerp lent créerait un lag de plusieurs unités.
            const camRate = selMoon ? 1.0 : damp(0.06);
            if (currentDist < minAllowedDist - 0.001) {
                camera.position.copy(controls.target.clone().add(camDir.normalize().multiplyScalar(minAllowedDist)));
            } else if (Math.abs(currentDist - desiredDist) > 0.001) {
                const newDist = THREE.MathUtils.lerp(currentDist, desiredDist, camRate);
                camera.position.copy(controls.target.clone().add(camDir.normalize().multiplyScalar(newDist)));
            }
            // Quand aucune cible, synchroniser pour que le prochain focus parte de la bonne distance
            if (!selectedPlanetRef.current && !selectedMoonRef.current && !selectedAsteroidRef.current) {
                minCamDistRef.current = getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5);
                targetCamDistRef.current = currentDist;
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameRef.current);
            controls.dispose();
            controls.removeEventListener('start', handleControlsInteraction);
            controls.removeEventListener('change', handleControlsInteraction);
            renderer.dispose();
            asteroidsRef.current.forEach(({ mesh }) => {
                mesh.geometry.dispose();
                mesh.material.dispose();
            });
            asteroidsRef.current = [];
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Lunes ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        moonsRef.current.forEach(m => {
            const parent = planetsRef.current[m.parentName];
            if (parent) { parent.group.remove(m.orbitGroup); }
            m.mesh.geometry.dispose(); m.mesh.material.dispose();
            m.arc.geometry.dispose(); m.arc.material.dispose();
        });
        moonsRef.current = [];

        const pData = PLANET_DATA.find(c => c.name === moonsHostPlanet);
        const parent = planetsRef.current[moonsHostPlanet];
        const parentBody = planets.find((planet) => planet.id === moonsHostPlanet);
        if (!pData || !parent || !parentBody) return;

        const availableMoons = selectedPlanet === moonsHostPlanet && moons.length
            ? moons
            : getMoonStubsFromPlanet(parentBody);
        if (!availableMoons.length) return;

        const baseMoons = availableMoons.slice(0, nbMoons);
        const visibleMoons = moonsHostPlanet
            ? (selectedMoon && !baseMoons.some(m => m.id === selectedMoon)
                ? [...baseMoons, availableMoons.find(m => m.id === selectedMoon)].filter(Boolean)
                : baseMoons)
            : [];

        if (!visibleMoons.length) return;
        const moonBodies = visibleMoons.map(moon => moonDataCacheRef.current[moon.id]).filter(Boolean);
        const semimajorAxes = moonBodies.map(body => body?.semimajorAxis).filter(value => Number.isFinite(value) && value > 0);
        const orbitPeriods = moonBodies.map(body => body?.sideralOrbit).filter(value => Number.isFinite(value) && value > 0);
        const minMoonAxis = semimajorAxes.length ? Math.min(...semimajorAxes) : null;
        const maxMoonAxis = semimajorAxes.length ? Math.max(...semimajorAxes) : null;
        const minMoonPeriod = orbitPeriods.length ? Math.min(...orbitPeriods) : null;
        const maxMoonPeriod = orbitPeriods.length ? Math.max(...orbitPeriods) : null;

        visibleMoons.forEach((moonData, i) => {
            const moonBody = moonDataCacheRef.current[moonData.id];
            const moonOrbitR = getCompressedMoonRadius(moonBody?.semimajorAxis, minMoonAxis, maxMoonAxis)
                ?? (pData.size * 2.8 + i * pData.size * 1.1);
            const orbitGroup = new THREE.Group();
            orbitGroup.rotation.x = getOrbitalInclination(moonBody, 0);
            parent.group.add(orbitGroup);

            // Arc de lune 180° — dans l'espace local du groupe planète
            const physicalMoonSize = moonBody?.meanRadius && parentBody?.meanRadius
                ? pData.size * (moonBody.meanRadius / parentBody.meanRadius)
                : Math.max(pData.size * 0.05, 0.025);
            const isSelected = moonData.id === selectedMoon;
            const moonSize = isSelected
                ? Math.max(physicalMoonSize, SELECTED_MOON_VISIBLE_MIN)
                : THREE.MathUtils.clamp(
                    physicalMoonSize * MOON_VISIBLE_SIZE_FACTOR,
                    MOON_VISIBLE_SIZE_MIN,
                    pData.size * MOON_VISIBLE_SIZE_MAX_FACTOR
                );
            const arc = makeTrailArc(moonOrbitR, 0xd0d0d0, 0.3, true);
            orbitGroup.add(arc);
            const { color: moonColor, emissive: moonEmissive } = getMoonColor(moonBody);
            const mesh = makeMoonMesh(moonData.id, moonBody, moonSize, moonColor, moonEmissive, 24);
            mesh.userData = {
                ...mesh.userData,
                type: 'moon',
                name: moonData.id,
                parentName: moonsHostPlanet,
            };

            // Texture depuis le cache si déjà chargée, sinon tentative de chargement
            // (échec silencieux → couleur API conservée)
            const cachedTex = moonTexCacheRef.current[moonData.id];
            if (cachedTex) {
                mesh.material.map = cachedTex;
                mesh.material.color.set(0xffffff);
                mesh.material.emissive.set(0x000000);
                mesh.material.emissiveIntensity = 0;
                mesh.material.needsUpdate = true;
            } else {
                new THREE.TextureLoader().load(
                    `${MOON_TEXTURE_BASE}/${moonData.id}.jpg`,
                    (tex) => {
                        tex.colorSpace = THREE.SRGBColorSpace;
                        moonTexCacheRef.current[moonData.id] = tex;
                        mesh.material.map = tex;
                        mesh.material.color.set(0xffffff);
                        mesh.material.emissive.set(0x000000);
                        mesh.material.emissiveIntensity = 0;
                        mesh.material.needsUpdate = true;
                    },
                    undefined,
                    () => { /* pas de texture → couleur dérivée de l'API */ }
                );
            }
            orbitGroup.add(mesh);

            const initAngle = Math.random() * Math.PI * 2;
            mesh.position.set(Math.cos(initAngle) * moonOrbitR, 0, Math.sin(initAngle) * moonOrbitR);
            moonsRef.current.push({
                orbitGroup,
                mesh, arc,
                angle: initAngle,
                speed: getCompressedMoonSpeed(moonBody?.sideralOrbit, minMoonPeriod, maxMoonPeriod)
                    ?? Math.max(0.04, 0.18 / (i + 1)),
                radius: moonOrbitR,
                parentName: moonsHostPlanet,
            });
        });

        if (selectedMoon) {
            // Forcer la mise à jour des matrices monde avant de lire getWorldPosition
            parent.group.updateWorldMatrix(true, true);
            focusCameraOnMoon(selectedMoon);
        }
    }, [focusOnPlanet, moonsHostPlanet, selectedMoon, moons, nbMoons, moonDataVersion, focusCameraOnMoon, planets]);

    useEffect(() => {
        let cancelled = false;
        const hostBody = planets.find((planet) => planet.id === moonsHostPlanet);
        const sourceMoons = selectedPlanet === moonsHostPlanet && moons.length
            ? moons
            : getMoonStubsFromPlanet(hostBody);
        const moonIds = sourceMoons.map(moon => moon.id).filter(Boolean);
        const missingIds = moonIds.filter(id => !moonDataCacheRef.current[id]);

        if (!moonsHostPlanet || !missingIds.length) return undefined;

        Promise.all(
            missingIds.map(async (id) => {
                try {
                    const body = await fetchBody(id);
                    return [id, body];
                } catch {
                    return [id, null];
                }
            })
        ).then((entries) => {
            if (cancelled) return;
            let didUpdate = false;
            entries.forEach(([id, body]) => {
                moonDataCacheRef.current[id] = body;
                didUpdate = true;
            });
            if (didUpdate) setMoonDataVersion(version => version + 1);
        });

        return () => {
            cancelled = true;
        };
    }, [moonsHostPlanet, moons]);

    // ── Raycasting ────────────────────────────────────────────────────────
    const handlePointerDown = useCallback(() => {
        pointerRef.current = { down: true, moved: false };
        hideSunTooltip();
        if (mountRef.current) mountRef.current.style.cursor = 'grabbing';
    }, [hideSunTooltip]);

    const handlePointerMove = useCallback((e) => {
        if (pointerRef.current.down) {
            pointerRef.current.moved = true;
            return;
        }

        if (!isMilkyWayMode || galaxyTransitionRef.current.phase !== 'idle' || !galaxySunRef.current) {
            hideSunTooltip();
            return;
        }

        const hit = getPointerHit(e.clientX, e.clientY, [galaxySunRef.current]);
        if (!hit || hit.object.userData.type !== 'galaxy-sun') {
            hideSunTooltip();
            return;
        }

        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        showSunTooltip(e.clientX - rect.left, e.clientY - rect.top);
    }, [getPointerHit, hideSunTooltip, isMilkyWayMode, showSunTooltip]);

    const handlePointerUp = useCallback((e) => {
        const { down, moved } = pointerRef.current;
        pointerRef.current = { down: false, moved: false };
        if (mountRef.current) mountRef.current.style.cursor = 'grab';
        if (!down || moved) return;

        if (galaxyTransitionRef.current.phase !== 'idle') return;

        const meshes = [
            ...Object.values(planetsRef.current).map(p => p.mesh),
            ...asteroidsRef.current.map(a => a.mesh),
            ...moonsRef.current.map(m => m.mesh),
            ...(galaxySunRef.current ? [galaxySunRef.current] : []),
        ];
        const hit = getPointerHit(e.clientX, e.clientY, meshes);
        if (!hit) return;

        const { type, name, parentName } = hit.object.userData;
        if (type === 'galaxy-sun') { startGalaxySunTransition(); }
        else if (type === 'planet') { focusPlanet(name); }
        else if (type === 'asteroid') { focusAsteroid(name); }
        else if (type === 'moon') { focusMoon(name, parentName); }
    }, [focusAsteroid, focusMoon, focusPlanet, getPointerHit, startGalaxySunTransition]);

    const handlePointerLeave = useCallback(() => {
        pointerRef.current = { down: false, moved: false };
        hideSunTooltip();
        if (mountRef.current) mountRef.current.style.cursor = 'grab';
    }, [hideSunTooltip]);

    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            <div
                ref={mountRef}
                style={{ position: 'absolute', inset: 0, cursor: 'grab' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
            />
            <div
                ref={overlayRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.22) 38%, rgba(0,0,0,0.96) 100%)',
                }}
            />
            <div
                ref={sunTooltipRef}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    transform: 'translate(-50%, calc(-100% - 14px))',
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: 'rgba(6, 10, 16, 0.88)',
                    border: '1px solid rgba(255, 243, 183, 0.28)',
                    color: '#fff3bf',
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
            >
                Soleil
            </div>
        </div>
    );
}
