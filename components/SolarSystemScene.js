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

// Textures spécifiques par lune (ID de l'API le-systeme-solaire.net)
const MOON_TEXTURES = {
    europe:   '/textures/texture_europe.jpg',
    io: '/textures/texture_io.jpg',
    deimos: '/textures/texture_deimos.jpg'
};

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

    const mat = new THREE.LineBasicMaterial({ vertexColors: true, opacity, transparent: true, depthWrite: false });
    return new THREE.Line(geo, mat);
}

function makeSphere(radius, color, emissive) {
    const geo = new THREE.SphereGeometry(radius, 64, 64);
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
        const moonSize = moonEntry?.mesh.geometry.parameters.radius;
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
    selectedPlanet,
    selectedAsteroid,
    selectedMoon,
    moons = [],
    nbMoons = 0,
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
    const moonTexRef = useRef(null);       // texture générique (fallback)
    const moonTexCacheRef = useRef({});    // id → THREE.Texture (textures spécifiques)

    const selectedPlanetRef = useRef(selectedPlanet);
    const selectedAsteroidRef = useRef(selectedAsteroid);
    const selectedMoonRef = useRef(selectedMoon);
    const targetCamDistRef = useRef(DEFAULT_CAM_DIST);
    const minCamDistRef = useRef(0.05);
    const focusMoonWorldPosRef = useRef(new THREE.Vector3());
    const focusMoonCamDirRef = useRef(new THREE.Vector3());
    const proximityPlanetRef = useRef(null);

    const moonsHostPlanet = useMemo(() => {
        if (selectedMoon && selectedPlanet) return selectedPlanet;
        if (focusOnPlanet && selectedPlanet) return selectedPlanet;
        return proximityPlanet;
    }, [focusOnPlanet, proximityPlanet, selectedMoon, selectedPlanet]);

    const focusCameraOnMoon = useCallback((moonName) => {
        const controls = ctrlRef.current;
        const camera = cameraRef.current;
        const moonEntry = moonsRef.current.find(m => m.mesh.userData.name === moonName);
        if (!moonEntry || !controls || !camera) return false;

        const moonSize = moonEntry.mesh.geometry.parameters.radius;
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
        camera.position.set(0, 24, 36);
        camera.lookAt(0, 0, 0);
        minCamDistRef.current = getDistanceForScreenFraction(SUN_RADIUS, camera, 0.5);
        targetCamDistRef.current = camera.position.distanceTo(controls.target);
        controls.update();
    }, [resetViewNonce]);

    // ── Init scène ────────────────────────────────────────────────────────
    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.005, 2000);
        camera.position.set(0, 24, 36);
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
        ctrlRef.current = controls;

        // Étoiles
        const sp = new Float32Array(5000 * 3);
        for (let i = 0; i < sp.length; i++) sp[i] = (Math.random() - 0.5) * 900;
        const starsGeo = new THREE.BufferGeometry();
        starsGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
        scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, sizeAttenuation: true })));

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
        scene.add(sunMesh);

        // Planètes
        PLANET_DATA.forEach((cfg, i) => {
            const orbitRadius = getCompressedPlanetRadius(cfg.name, planets);
            const orbitSpeed = getCompressedPlanetSpeed(cfg.name, planets);
            // Arc de traîne 180° — sera tourné chaque frame
            const arc = makeTrailArc(orbitRadius);
            scene.add(arc);

            const orbitGroup = new THREE.Group();
            orbitGroup.rotation.x = getOrbitalInclination(
                planets.find((planet) => planet.id === cfg.name),
                0
            );
            scene.add(orbitGroup);

            const group = new THREE.Group();
            orbitGroup.add(group);

            // tiltGroup : axe de rotation incliné, fixe
            const tiltGroup = new THREE.Group();
            tiltGroup.rotation.z = THREE.MathUtils.degToRad(cfg.tilt);
            group.add(tiltGroup);

            const mesh = makeSphere(cfg.size, cfg.color, cfg.emissive);
            mesh.userData = { type: 'planet', name: cfg.name };
            tiltGroup.add(mesh);
            let ring = null;
            if (cfg.name === 'saturne') {
                ring = makeSaturnRings(cfg.size);
                tiltGroup.add(ring);
            }

            const initAngle = (i / PLANET_DATA.length) * Math.PI * 2;
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
            const mesh = makeSphere(size, '#a59a8a', '#120f0b');
            const angle = (i / Math.max(asteroids.length, 1)) * Math.PI * 2;
            const height = ((i % 5) - 2) * 0.08;

            mesh.position.set(Math.cos(angle) * orbitRadius, height, Math.sin(angle) * orbitRadius);
            mesh.userData = { type: 'asteroid', name: asteroid.id };
            scene.add(mesh);

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
        const PLANET_TEXTURES = {
            mercure: '/textures/texture_mercure.jpg',
            venus: '/textures/texture_venus.jpg',
            terre: '/textures/texture_terre.jpg',
            mars: '/textures/texture_mars.jpg',
            jupiter: '/textures/texture_jupiter.jpg',
            saturne: '/textures/texture_saturne.jpg',
            uranus: '/textures/texture_uranus.jpg',
            neptune: '/textures/texture_neptune.jpg',
        };
        Object.entries(PLANET_TEXTURES).forEach(([name, path]) => {
            loader.load(path, (tex) => {
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

        // Texture du Soleil
        loader.load('/textures/texture_soleil.jpg', (tex) => { // Ajustez l'extension (.jpg, .png) si nécessaire
            tex.colorSpace = THREE.SRGBColorSpace;

            // On applique la texture comme couleur de base
            sunMesh.material.map = tex;
            // On l'applique aussi sur l'émission pour qu'elle brille avec ses propres motifs
            sunMesh.material.emissiveMap = tex;

            // On réinitialise les couleurs à blanc pour que la texture s'affiche avec ses couleurs réelles
            sunMesh.material.color.set(0xffffff);
            sunMesh.material.emissive.set(0xffffff);

            sunMesh.material.needsUpdate = true;
        });

        const applyTexToMesh = (mesh, tex) => {
            mesh.material.map = tex;
            mesh.material.color.set(0xffffff);
            mesh.material.emissive.set(0x000000);
            mesh.material.emissiveIntensity = 0;
            mesh.material.needsUpdate = true;
        };

        // Texture lune générique (fallback)
        loader.load('/textures/texture_moon.jpg', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            moonTexRef.current = tex;
            moonsRef.current.forEach(m => {
                const id = m.mesh.userData.name;
                if (!moonTexCacheRef.current[id]) applyTexToMesh(m.mesh, tex);
            });
        });

        // Textures spécifiques par lune
        Object.entries(MOON_TEXTURES).forEach(([id, path]) => {
            loader.load(path, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                moonTexCacheRef.current[id] = tex;
                const entry = moonsRef.current.find(m => m.mesh.userData.name === id);
                if (entry) applyTexToMesh(entry.mesh, tex);
            });
        });

        // Texture anneaux Saturne
        loader.load('/textures/texture_saturne_anneaux.png', (tex) => {
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
        };
        window.addEventListener('resize', onResize);

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
            applyZoom(e.clientX, e.clientY, e.deltaY > 0 ? 1 : -1);
        };

        let pinchDist = 0;
        const onTouchStart = (e) => {
            if (e.touches.length === 2) {
                pinchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY,
                );
            }
        };
        const onTouchMove = (e) => {
            if (e.touches.length !== 2 || !pinchDist) return;
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
        const onTouchEnd = () => { pinchDist = 0; };

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: true });
        el.addEventListener('touchend', onTouchEnd);

        // ── Boucle de rendu ────────────────────────────────────────────────
        const camDir = new THREE.Vector3();
        const moonWorldPos = new THREE.Vector3();
        const focusTargetWorldPos = new THREE.Vector3();

        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);

            const sel = selectedPlanetRef.current;
            const selAsteroid = selectedAsteroidRef.current;

            PLANET_DATA.forEach(cfg => {
                const p = planetsRef.current[cfg.name];
                if (!p) return;

                // Orbite
                p.angle += THREE.MathUtils.degToRad(p.speed);
                p.group.position.set(Math.cos(p.angle) * p.r, 0, Math.sin(p.angle) * p.r);
                p.mesh.rotation.y += 0.004 * cfg.rotDir;

                // Arc rotatif : rotation.y = -angle aligne le début de l'arc sur la planète
                // (correction du sens de rotation Three.js vs EllipseCurve)
                p.arc.rotation.y = Math.PI - p.angle;

                // Opacité : lors d'un focus, cacher tout sauf la planète sélectionnée
                const isSel = cfg.name === sel;
                const targetMeshOp = sel && !isSel ? 0 : 1.0;
                const targetArcOp  = sel ? (isSel ? 0.4 : 0) : 0.4;
                p.mesh.material.opacity = THREE.MathUtils.lerp(p.mesh.material.opacity, targetMeshOp, 0.06);
                p.arc.material.opacity  = THREE.MathUtils.lerp(p.arc.material.opacity,  targetArcOp,  0.06);
                if (p.ring?.material) {
                    const targetRingOp = sel ? (isSel ? 0.75 : 0) : 0.75;
                    p.ring.material.opacity = THREE.MathUtils.lerp(p.ring.material.opacity, targetRingOp, 0.06);
                }
            });

            asteroidsRef.current.forEach((asteroid) => {
                asteroid.angle += asteroid.speed;
                asteroid.mesh.position.set(
                    Math.cos(asteroid.angle) * asteroid.r,
                    asteroid.y,
                    Math.sin(asteroid.angle) * asteroid.r
                );

                const isSel = asteroid.mesh.userData.name === selAsteroid;
                const targetOpacity = sel ? 0 : (selAsteroid ? (isSel ? 1 : 0.25) : 0.85);
                asteroid.mesh.material.opacity = THREE.MathUtils.lerp(asteroid.mesh.material.opacity, targetOpacity, 0.08);
            });

            // Lunes
            moonsRef.current.forEach(m => {
                m.angle -= THREE.MathUtils.degToRad(m.speed);
                m.mesh.position.set(Math.cos(m.angle) * m.radius, 0, Math.sin(m.angle) * m.radius);
                m.arc.rotation.y = -m.angle;
                m.mesh.rotation.y -= 0.008;
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
            const camRate = selMoon ? 1.0 : 0.06;
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
            renderer.dispose();
            asteroidsRef.current.forEach(({ mesh }) => {
                mesh.geometry.dispose();
                mesh.material.dispose();
            });
            asteroidsRef.current = [];
            window.removeEventListener('resize', onResize);
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

        const visibleMoons = moonsHostPlanet
            ? (selectedMoon
            ? availableMoons.filter((moon) => moon.id === selectedMoon)
            : availableMoons.slice(0, nbMoons))
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
            const moonSize = selectedMoon
                ? Math.max(physicalMoonSize, SELECTED_MOON_VISIBLE_MIN)
                : THREE.MathUtils.clamp(
                    physicalMoonSize * MOON_VISIBLE_SIZE_FACTOR,
                    MOON_VISIBLE_SIZE_MIN,
                    pData.size * MOON_VISIBLE_SIZE_MAX_FACTOR
                );
            const arc = makeTrailArc(moonOrbitR, 0xd0d0d0, 0.3, true);
            orbitGroup.add(arc);
            const mesh = makeSphere(moonSize, '#c0c0c0', '#0a0a0a');
            mesh.userData = { type: 'moon', name: moonData.id, parentName: moonsHostPlanet };
            const tex = moonTexCacheRef.current[moonData.id] ?? moonTexRef.current;
            if (tex) {
                mesh.material.map = tex;
                mesh.material.color.set(0xffffff);
                mesh.material.emissive.set(0x000000);
                mesh.material.emissiveIntensity = 0;
                mesh.material.needsUpdate = true;
            }
            orbitGroup.add(mesh);

            const initAngle = (i / visibleMoons.length) * Math.PI * 2;
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
    const pointerRef = useRef({ down: false, moved: false });
    const handlePointerDown = useCallback(() => { pointerRef.current = { down: true, moved: false }; }, []);
    const handlePointerMove = useCallback(() => { if (pointerRef.current.down) pointerRef.current.moved = true; }, []);

    const handlePointerUp = useCallback((e) => {
        const { down, moved } = pointerRef.current;
        pointerRef.current = { down: false, moved: false };
        if (!down || moved) return;

        const el = mountRef.current, cam = cameraRef.current, sc = sceneRef.current;
        if (!el || !cam || !sc) return;

        const rect = el.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            ((e.clientY - rect.top) / rect.height) * -2 + 1,
        );
        const rc = new THREE.Raycaster();
        rc.setFromCamera(mouse, cam);

        const meshes = [
            ...Object.values(planetsRef.current).map(p => p.mesh),
            ...asteroidsRef.current.map(a => a.mesh),
            ...moonsRef.current.map(m => m.mesh),
        ];
        const hits = rc.intersectObjects(meshes);
        if (!hits.length) return;

        const { type, name, parentName } = hits[0].object.userData;
        if (type === 'planet') { focusPlanet(name); }
        else if (type === 'asteroid') { focusAsteroid(name); }
        else if (type === 'moon') { focusMoon(name, parentName); }
    }, [focusAsteroid, focusPlanet, focusMoon]);

    return (
        <div
            ref={mountRef}
            style={{ position: 'absolute', inset: 0, cursor: 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        />
    );
}
