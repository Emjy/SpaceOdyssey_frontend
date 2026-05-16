'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/CatalogView.module.css';
import { getMoonStubsFromPlanet, fetchBody } from '../lib/solarApi';
import { GALAXIES, isGalaxyOverviewSelection } from '../data/galaxies';
import InfinityLoader from './InfinityLoader';

const StarCanvas = dynamic(() => import('./StarCanvas'), { ssr: false });

// ── Couleurs des planètes solaires (hors API) ─────────────────────────────

const SOLAR_COLORS = {
    mercure: '#c8c8c8', mercury: '#c8c8c8',
    venus: '#f0d080',
    terre: '#4a80c0', earth: '#4a80c0',
    mars: '#d05010',
    jupiter: '#d8a060',
    saturne: '#ede0a0', saturn: '#ede0a0',
    uranus: '#88eef0',
    neptune: '#3355e8',
    pluton: '#9a8070', pluto: '#9a8070',
};

const VISUAL_TYPE_LABELS = {
    'gas-giant': 'Géante gazeuse',
    'lava-world': 'Monde de lave',
    'ice-world': 'Monde glacé',
    temperate: 'Monde tempéré',
    rocky: 'Monde rocheux',
    Planet: 'Planète',
    Moon: 'Lune',
    Asteroid: 'Astéroïde',
};

const PLANET_TEXTURE_BASE = '/textures/planets';
const STAR_TEXTURE_BASE = '/textures/stars';
const MOON_TEXTURE_BASE = '/textures/moons';

// Reprend exactement les données de PLANET_DATA dans SolarSystemScene.js
const SOLAR_RING_DATA = {
    saturne: { innerScale: 1.11, outerScale: 2.32, color: '#d4c088', opacity: 0.75, tilt: 26.73, banded: true, texturePath: '/textures/planets/saturne_anneaux.png' },
    uranus:  { innerScale: 1.58, outerScale: 2.05, color: '#c9efe6', opacity: 0.28, tilt: 97.77 },
    neptune: { innerScale: 1.82, outerScale: 2.18, color: '#8aa0c8', opacity: 0.24, tilt: 28.32 },
};

// Compression verticale simulant la perspective du système orbital (caméra à ~34° au-dessus)
const RING_TILT = 0.38;

const CAROUSEL_STEP_GAP = 92;
const CAROUSEL_VISIBLE_RADIUS_DEFAULT = 2;
const CAROUSEL_VISIBLE_RADIUS_STARS   = 1;

const EXO_TYPE_BACKGROUNDS = {
    'gas-giant': [
        'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 34%)',
        'repeating-linear-gradient(180deg, rgba(255,255,255,0.18) 0 8px, rgba(20,10,0,0.06) 8px 16px, rgba(255,255,255,0.08) 16px 22px)',
    ],
    'lava-world': [
        'radial-gradient(circle at 65% 68%, rgba(255,120,20,0.34) 0%, rgba(255,120,20,0) 24%)',
        'radial-gradient(circle at 34% 26%, rgba(255,220,120,0.22) 0%, rgba(255,220,120,0) 18%)',
        'repeating-linear-gradient(135deg, rgba(40,0,0,0.28) 0 10px, rgba(255,100,0,0.18) 10px 18px, rgba(0,0,0,0.1) 18px 28px)',
    ],
    'ice-world': [
        'radial-gradient(circle at 38% 24%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 30%)',
        'repeating-linear-gradient(145deg, rgba(255,255,255,0.16) 0 9px, rgba(110,170,220,0.12) 9px 18px, rgba(255,255,255,0.05) 18px 26px)',
    ],
    temperate: [
        'radial-gradient(circle at 66% 70%, rgba(80,150,90,0.26) 0%, rgba(80,150,90,0) 24%)',
        'repeating-linear-gradient(160deg, rgba(255,255,255,0.08) 0 10px, rgba(0,50,90,0.08) 10px 18px, rgba(40,120,70,0.1) 18px 28px)',
    ],
    rocky: [
        'radial-gradient(circle at 62% 66%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 20%)',
        'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 9px, rgba(0,0,0,0.1) 9px 18px, rgba(255,255,255,0.04) 18px 28px)',
    ],
};

function normalizeAssetName(value) {
    return String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '');
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

function clampMoonStretch(x = 1, y = 1, z = 1) {
    return {
        x: Math.max(0.9, Math.min(1.1, x)),
        y: Math.max(0.9, Math.min(1.1, y)),
        z: Math.max(0.9, Math.min(1.1, z)),
    };
}

function getMoonStretch(body) {
    const parsedDimensions = parseBodyDimensions(body?.dimension);
    const meanRadius = body?.meanRadius;
    if (Number.isFinite(meanRadius) && meanRadius >= 300) return null;
    const dampFactor = !Number.isFinite(meanRadius) ? 0.55 : meanRadius > 650 ? 0.28 : meanRadius > 350 ? 0.4 : 0.6;

    if (parsedDimensions) {
        const [x, y, z] = parsedDimensions;
        const avg = (x + y + z) / 3;
        if (avg > 0) {
            const raw = {
                x: 1 + ((x / avg) - 1) * dampFactor,
                y: 1 + ((y / avg) - 1) * dampFactor,
                z: 1 + ((z / avg) - 1) * dampFactor,
            };
            return clampMoonStretch(raw.x, raw.y, raw.z);
        }
    }

    const equaRadius = body?.equaRadius;
    const polarRadius = body?.polarRadius;
    if (Number.isFinite(meanRadius) && meanRadius > 0) {
        const equatorialRatio = Number.isFinite(equaRadius) && equaRadius > 0 ? equaRadius / meanRadius : 1;
        const polarRatio = Number.isFinite(polarRadius) && polarRadius > 0 ? polarRadius / meanRadius : 1;
        const raw = {
            x: 1 + (equatorialRatio - 1) * dampFactor,
            y: 1 + (polarRatio - 1) * dampFactor,
            z: 1 + (equatorialRatio - 1) * dampFactor,
        };
        return clampMoonStretch(raw.x, raw.y, raw.z);
    }

    return null;
}

function getMoonCatalogTone(body) {
    const density = body?.density;
    const avgTemp = body?.avgTemp;

    let r = 0.69, g = 0.65, b = 0.62;

    if (Number.isFinite(density) && density > 0) {
        if (density < 1.3) {
            r = 0.80; g = 0.88; b = 0.95;
        } else if (density < 1.8) {
            r = 0.65; g = 0.68; b = 0.72;
        } else if (density < 2.5) {
            r = 0.58; g = 0.55; b = 0.52;
        } else if (density < 3.5) {
            r = 0.60; g = 0.58; b = 0.55;
        } else {
            r = 0.50; g = 0.47; b = 0.43;
        }
    }

    if (Number.isFinite(avgTemp) && avgTemp > 0) {
        if (avgTemp < 100) {
            r -= 0.06; b += 0.06;
        } else if (avgTemp > 240) {
            r += 0.05; g += 0.02; b -= 0.05;
        }
    }

    const clamp = (v) => Math.max(0, Math.min(1, v));
    const toHex = (rv, gv, bv) => {
        const ri = Math.round(clamp(rv) * 255);
        const gi = Math.round(clamp(gv) * 255);
        const bi = Math.round(clamp(bv) * 255);
        return `#${ri.toString(16).padStart(2, '0')}${gi.toString(16).padStart(2, '0')}${bi.toString(16).padStart(2, '0')}`;
    };

    return {
        tint: toHex(r, g, b),
        glow: toHex(r * 0.22, g * 0.22, b * 0.22),
    };
}

function getBodyVisual(body, kind) {
    const name = body?.id ?? body?.name ?? body?.englishName ?? '';
    const normalized = normalizeAssetName(name);

    if (kind === 'star') {
        const color = body?.starColor ?? '#ffe880';
        if (normalized === 'soleil' || normalized === 'sun' || body?.isSolar) {
            return {
                variant: 'star',
                texture: `${STAR_TEXTURE_BASE}/soleil.jpg`,
                glowColor: color,
                starBackground: [
                    'repeating-radial-gradient(circle at 50% 50%, rgba(255,245,210,0.08) 0 3px, rgba(255,170,60,0.05) 3px 7px, rgba(0,0,0,0) 7px 11px)',
                    'radial-gradient(circle at 48% 46%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 28%)',
                ].join(', '),
            };
        }
        return {
            variant: 'star',
            glowColor: color,
            starBackground: [
                'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10) 0 3px, rgba(255,255,255,0) 3px 11px)',
                'radial-gradient(circle at 42% 38%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 32%)',
                `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(0,0,0,0.88) 120%)`,
            ].join(', '),
            background: `radial-gradient(circle at 45% 45%, ${color} 0%, rgba(0,0,0,0.84) 120%)`,
        };
    }

    if (kind === 'moon') {
        const tone = getMoonCatalogTone(body);
        return {
            variant: 'moon',
            texture: `${MOON_TEXTURE_BASE}/${normalized}.jpg`,
            glowColor: tone.glow,
            tintColor: tone.tint,
        };
    }

    const visualType = body?.visualType ?? body?.bodyType ?? 'Planet';
    const ringData = SOLAR_RING_DATA[normalized] ?? null;
    const color = body?.color ?? '#4488cc';
    const texture = body?.isSolar || body?.bodyType === 'Planet'
        ? `${PLANET_TEXTURE_BASE}/${normalized}.jpg`
        : null;

    if (texture) {
        return { variant: 'planet', texture, ringData, glowColor: color };
    }

    return {
        variant: 'planet',
        ringData,
        glowColor: color,
        background: [
            ...(EXO_TYPE_BACKGROUNDS[visualType] ?? EXO_TYPE_BACKGROUNDS.rocky),
            `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(0,0,0,0.8) 120%)`,
        ].join(', '),
    };
}

const SPECTRAL_LABELS = {
    M: 'Naine rouge',
    K: 'Naine orange',
    G: 'Naine jaune',
    F: 'Étoile jaune-blanc',
    A: 'Étoile blanche',
    B: 'Géante bleue',
    O: 'Supergéante bleue',
};

function getSpectralClass(teff) {
    if (!teff) return '';
    if (teff < 3500) return 'M';
    if (teff < 5000) return 'K';
    if (teff < 6000) return 'G';
    if (teff < 7500) return 'F';
    if (teff < 10000) return 'A';
    if (teff < 30000) return 'B';
    return 'O';
}

// ── Génération de texture canvas (même algo que la vue orbitale) ──────────

function _rng32(a) {
    let s = a >>> 0;
    return () => {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hexToRgbObj(hex) {
    if (!hex || hex.length < 7) return { r: 0.5, g: 0.5, b: 0.5 };
    return {
        r: parseInt(hex.slice(1, 3), 16) / 255,
        g: parseInt(hex.slice(3, 5), 16) / 255,
        b: parseInt(hex.slice(5, 7), 16) / 255,
    };
}

function _rgba(col, a) {
    return `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${a.toFixed(3)})`;
}

function _shift(col, factor) {
    return { r: Math.min(1, col.r * factor), g: Math.min(1, col.g * factor), b: Math.min(1, col.b * factor) };
}

function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h);
}

function drawExoPlanetCanvas(ctx, visualType, baseColor, seed, size) {
    const rng = _rng32(seed);
    const c = hexToRgbObj(baseColor);
    const shifted = (f) => _shift(c, f);
    const addSoftBlob = (x, y, r, col, alpha = 0.18) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, _rgba(col, alpha));
        grad.addColorStop(0.55, _rgba(col, alpha * 0.45));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    };

    ctx.fillStyle = _rgba(c, 1);
    ctx.fillRect(0, 0, size, size);

    if (visualType === 'gas-giant') {
        const numBands = 9 + Math.floor(rng() * 7);
        for (let b = 0; b < numBands; b++) {
            const yFrac = b / numBands;
            const bandH = (size / numBands) * (0.65 + rng() * 0.7);
            const col   = shifted(0.72 + rng() * 0.58);
            const amp   = 5 + rng() * 12;
            const freq  = 1.5 + rng() * 4.5;
            const phase = rng() * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, yFrac * size);
            for (let x = 0; x <= size; x += 2) {
                const drift = Math.sin((x / size) * freq * Math.PI * 2 + phase) * amp;
                const wobble = Math.sin((x / size) * (freq * 0.45) * Math.PI * 2 + phase * 0.7) * (amp * 0.45);
                ctx.lineTo(x, yFrac * size + drift + wobble);
            }
            for (let x = size; x >= 0; x -= 2) {
                const drift = Math.sin((x / size) * freq * Math.PI * 2 + phase + 0.5) * amp;
                const wobble = Math.sin((x / size) * (freq * 0.45) * Math.PI * 2 + phase * 0.9) * (amp * 0.45);
                ctx.lineTo(x, yFrac * size + bandH + drift + wobble);
            }
            ctx.closePath();
            ctx.fillStyle = _rgba(col, 0.45 + rng() * 0.35);
            ctx.fill();
        }
        for (let i = 0; i < 14; i++) {
            addSoftBlob(
                rng() * size,
                (0.12 + rng() * 0.76) * size,
                10 + rng() * 34,
                shifted(0.8 + rng() * 0.5),
                0.08 + rng() * 0.12
            );
        }
        if (rng() > 0.35) {
            const sx = rng() * size, sy = (0.25 + rng() * 0.5) * size;
            const rx = 14 + rng() * 26, ry = rx * (0.35 + rng() * 0.35);
            const spotCol = shifted(rng() > 0.5 ? 0.5 : 1.55);
            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx);
            grad.addColorStop(0, _rgba(spotCol, 0.7));
            grad.addColorStop(0.6, _rgba(spotCol, 0.35));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < 18; i++) {
            const y = rng() * size;
            const h = 4 + rng() * 18;
            const alpha = 0.03 + rng() * 0.06;
            const tone = shifted(0.78 + rng() * 0.5);
            const grad = ctx.createLinearGradient(0, y, 0, y + h);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.5, _rgba(tone, alpha));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, y, size, h);
        }
    }

    if (visualType === 'lava-world') {
        const drawCrack = (x, y, angle, length, depth) => {
            if (depth <= 0 || length < 3) return;
            const ex = x + Math.cos(angle) * length, ey = y + Math.sin(angle) * length;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey);
            ctx.strokeStyle = `rgba(255,${80 + depth * 20},0,${0.45 + depth * 0.12})`;
            ctx.lineWidth = Math.max(0.4, depth * 0.7); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey);
            ctx.strokeStyle = `rgba(255,60,0,${0.08 * depth})`;
            ctx.lineWidth = depth * 3; ctx.stroke();
            const branches = 1 + Math.floor(rng() * 2);
            for (let i = 0; i < branches; i++)
                drawCrack(ex, ey, angle + (rng() - 0.5) * 1.3, length * (0.45 + rng() * 0.38), depth - 1);
        };
        for (let i = 0; i < 4 + Math.floor(rng() * 6); i++)
            drawCrack(rng() * size, rng() * size, rng() * Math.PI * 2, 22 + rng() * 42, 4);
        for (let i = 0; i < 2 + Math.floor(rng() * 5); i++) {
            const px = rng() * size, py = rng() * size, pr = 2 + rng() * 9;
            const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
            grad.addColorStop(0, 'rgba(255,200,60,0.95)');
            grad.addColorStop(0.4, 'rgba(255,80,0,0.65)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
        }
    }

    if (visualType === 'ice-world') {
        ctx.fillStyle = 'rgba(210,235,255,0.25)'; ctx.fillRect(0, 0, size, size);
        const iceBlue = hexToRgbObj('#4488bb');
        for (let i = 0; i < 14 + Math.floor(rng() * 16); i++) {
            const x1 = rng() * size, y1 = rng() * size, x2 = rng() * size, y2 = rng() * size;
            const cpx = (x1 + x2) / 2 + (rng() - 0.5) * 50, cpy = (y1 + y2) / 2 + (rng() - 0.5) * 50;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cpx, cpy, x2, y2);
            ctx.strokeStyle = _rgba(iceBlue, 0.08 + rng() * 0.18);
            ctx.lineWidth = 0.5 + rng() * 2; ctx.stroke();
        }
        for (let i = 0; i < 35; i++) {
            const x = rng() * size, y = rng() * size, r = 6 + rng() * 28;
            const col = _shift(c, rng() > 0.5 ? 1.18 : 0.88);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, _rgba(col, 0.22)); grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
    }

    if (visualType === 'temperate') {
        const landColor   = hexToRgbObj('#4a7830');
        const desertColor = hexToRgbObj('#c8a060');
        const drawOrganicLandmass = (cx, cy, baseR, col, isDesert) => {
            const nPts = 10 + Math.floor(rng() * 8);
            const points = [];
            for (let pi = 0; pi < nPts; pi++) {
                const angle = (pi / nPts) * Math.PI * 2;
                const longWave = 0.86 + Math.sin(angle * (1.2 + rng() * 0.5) + rng() * Math.PI * 2) * 0.12;
                const midWave = 1 + Math.sin(angle * (2.2 + rng() * 1.4) + rng() * Math.PI * 2) * 0.16;
                const noise = 0.78 + rng() * 0.48;
                const r = baseR * longWave * midWave * noise;
                points.push({
                    x: cx + Math.cos(angle) * r,
                    y: cy + Math.sin(angle) * r,
                });
            }

            ctx.beginPath();
            for (let i = 0; i < points.length; i++) {
                const prev = points[(i - 1 + points.length) % points.length];
                const curr = points[i];
                const next = points[(i + 1) % points.length];
                const cp1x = curr.x + (next.x - prev.x) * 0.16;
                const cp1y = curr.y + (next.y - prev.y) * 0.16;
                const midX = (curr.x + next.x) / 2;
                const midY = (curr.y + next.y) / 2;
                if (i === 0) ctx.moveTo(midX, midY);
                ctx.quadraticCurveTo(cp1x, cp1y, midX, midY);
            }
            ctx.closePath();
            ctx.fillStyle = _rgba(col, 0.92);
            ctx.fill();

            ctx.save();
            ctx.clip();
            for (let i = 0; i < 8; i++) {
                const rx = cx + (rng() - 0.5) * baseR * 1.1;
                const ry = cy + (rng() - 0.5) * baseR * 1.1;
                const rr = baseR * (0.16 + rng() * 0.22);
                addSoftBlob(
                    rx,
                    ry,
                    rr,
                    hexToRgbObj(isDesert ? '#efd39a' : '#6ea24b'),
                    0.09 + rng() * 0.08
                );
            }
            ctx.restore();

            ctx.strokeStyle = _rgba(hexToRgbObj(isDesert ? '#efd8aa' : '#8fcf7a'), 0.16);
            ctx.lineWidth = Math.max(1.2, baseR * 0.045);
            ctx.stroke();

            for (let i = 0; i < 4; i++) {
                const coastX = cx + (rng() - 0.5) * baseR * 1.5;
                const coastY = cy + (rng() - 0.5) * baseR * 1.5;
                addSoftBlob(
                    coastX,
                    coastY,
                    baseR * (0.14 + rng() * 0.12),
                    hexToRgbObj('#d9eef7'),
                    0.035 + rng() * 0.025
                );
            }
        };

        for (let cont = 0; cont < 2 + Math.floor(rng() * 4); cont++) {
            const cx = rng() * size, cy = rng() * size;
            const baseR = 18 + rng() * 48;
            const isDesert = rng() > 0.7;
            const col = isDesert ? desertColor : landColor;
            drawOrganicLandmass(cx, cy, baseR, col, isDesert);
        }
        for (let i = 0; i < 10; i++) {
            addSoftBlob(
                rng() * size,
                rng() * size,
                12 + rng() * 26,
                hexToRgbObj('#d9eef7'),
                0.06 + rng() * 0.08
            );
        }
        const icePole = hexToRgbObj('#e8f4ff');
        [[0, 1], [size, -1]].forEach(([yEdge, dir]) => {
            const poleH = 14 + rng() * 22;
            const grad = ctx.createLinearGradient(0, yEdge, 0, yEdge + dir * poleH);
            grad.addColorStop(0, _rgba(icePole, 0.85)); grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, dir > 0 ? 0 : size - poleH, size, poleH);
        });
        for (let i = 0; i < 14; i++) {
            const cx = rng() * size;
            const cy = rng() * size;
            const rx = 10 + rng() * 34;
            const ry = rx * (0.28 + rng() * 0.35);
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
            grad.addColorStop(0, 'rgba(255,255,255,0.10)');
            grad.addColorStop(0.45, 'rgba(255,255,255,0.05)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((rng() - 0.5) * 1.2);
            ctx.scale(1, ry / rx);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, rx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    if (visualType === 'rocky') {
        for (let i = 0; i < 6 + Math.floor(rng() * 14); i++) {
            const cx = rng() * size, cy = rng() * size, cr = 3 + rng() * 22;
            const rimGrad = ctx.createRadialGradient(cx, cy, cr * 0.72, cx, cy, cr * 1.12);
            rimGrad.addColorStop(0, _rgba(shifted(1.18), 0.55)); rimGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rimGrad; ctx.beginPath(); ctx.arc(cx, cy, cr * 1.12, 0, Math.PI * 2); ctx.fill();
            const dGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 0.9);
            dGrad.addColorStop(0, _rgba(shifted(0.55), 0.72));
            dGrad.addColorStop(0.7, _rgba(shifted(0.72), 0.45));
            dGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = dGrad; ctx.beginPath(); ctx.arc(cx, cy, cr * 0.9, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < 18; i++) {
            const x = rng() * size, y = rng() * size, r = 6 + rng() * 18;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, _rgba(shifted(0.82 + rng() * 0.36), 0.22)); grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < 12; i++) {
            const x = rng() * size;
            const y = rng() * size;
            const r = 10 + rng() * 30;
            const tone = shifted(0.65 + rng() * 0.55);
            addSoftBlob(x, y, r, tone, 0.06 + rng() * 0.08);
        }
    }

    for (let i = 0; i < 24; i++) {
        addSoftBlob(
            rng() * size,
            rng() * size,
            4 + rng() * 14,
            shifted(0.7 + rng() * 0.7),
            0.03 + rng() * 0.05
        );
    }

    // Assombrissement au limbe
    const half = size / 2;
    const lGrad = ctx.createRadialGradient(half, half, half * 0.22, half, half, half * 0.99);
    lGrad.addColorStop(0, 'rgba(0,0,0,0)');
    lGrad.addColorStop(0.65, 'rgba(0,0,0,0.05)');
    lGrad.addColorStop(0.88, 'rgba(0,0,0,0.28)');
    lGrad.addColorStop(1.0, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = lGrad; ctx.fillRect(0, 0, size, size);

}

const EXO_VISUAL_TYPES = new Set(['gas-giant', 'lava-world', 'ice-world', 'temperate', 'rocky']);

function ExoPlanetSphere({ visualType, color, name, size }) {
    const canvasRef = React.useRef(null);
    const seed = React.useMemo(() => hashStr(name ?? 'unknown'), [name]);
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        drawExoPlanetCanvas(canvas.getContext('2d'), visualType, color ?? '#888', seed, size);
    }, [visualType, color, seed, size]);
    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ borderRadius: '50%', width: size, height: size, display: 'block', boxShadow: 'inset -6px -10px 18px rgba(0,0,0,0.54), inset 6px 6px 14px rgba(255,255,255,0.06)' }}
        />
    );
}

// ── Anneaux canvas — rendu identique à la vue orbitale ────────────────────

function _buildImgGradient(ctx, img, innerR, outerR, opacity) {
    const N = 64;
    const tmp = document.createElement('canvas');
    tmp.width = N; tmp.height = 1;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(img, 0, 0, N, 1);
    const px = tctx.getImageData(0, 0, N, 1).data;
    // U=0 → bord interne, U=1 → bord externe (même convention que les UVs 3D)
    const grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
    for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const a = (px[i * 4 + 3] / 255) * (opacity ?? 0.75);
        grad.addColorStop(t, `rgba(${px[i * 4]},${px[i * 4 + 1]},${px[i * 4 + 2]},${a})`);
    }
    return grad;
}

function _drawRingHalf(ctx, canvasSize, sphereR, rd, half, img) {
    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const innerR = sphereR * rd.innerScale;
    const outerR = sphereR * rd.outerScale;
    const tiltRad = ((rd.tilt ?? 0) * Math.PI) / 180;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.save();

    // Centrer, appliquer le tilt axial, puis aplatir en ellipse via scale(1, RING_TILT).
    // Le gradient et la géométrie sont définis en espace circulaire — le scale
    // les projette en ellipse exactement comme le fait la perspective 3D.
    ctx.translate(cx, cy);
    ctx.rotate(tiltRad);
    ctx.scale(1, RING_TILT);

    // Clip dans l'espace local des anneaux pour que la séparation avant/arrière
    // suive bien l'orientation des anneaux et n'introduise pas de couture écran.
    ctx.beginPath();
    if (half === 'back') {
        ctx.rect(-outerR * 2, 0, outerR * 4, outerR * 2);
    } else {
        ctx.rect(-outerR * 2, -outerR * 2, outerR * 4, outerR * 2);
    }
    ctx.clip();

    const col = hexToRgbObj(rd.color);
    if (img?.complete && img.naturalWidth > 0) {
        ctx.fillStyle = _buildImgGradient(ctx, img, innerR, outerR, rd.opacity);
    } else if (rd.banded) {
        const grad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
        grad.addColorStop(0,    _rgba(col, 0.1));
        grad.addColorStop(0.06, _rgba(_shift(col, 0.72), rd.opacity * 0.85));
        grad.addColorStop(0.18, _rgba(col, rd.opacity));
        grad.addColorStop(0.32, _rgba(_shift(col, 1.18), rd.opacity * 0.9));
        grad.addColorStop(0.48, _rgba(_shift(col, 0.88), rd.opacity * 0.95));
        grad.addColorStop(0.62, _rgba(_shift(col, 1.12), rd.opacity));
        grad.addColorStop(0.78, _rgba(_shift(col, 0.78), rd.opacity * 0.85));
        grad.addColorStop(0.92, _rgba(col, rd.opacity * 0.6));
        grad.addColorStop(1,    _rgba(col, 0.05));
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = _rgba(col, rd.opacity);
    }

    // Dessiner des cercles en espace circulaire — le scale(1, RING_TILT) les aplatit en ellipses
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2);
    ctx.arc(0, 0, innerR, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.restore();
}

function RingCanvas({ sphereSize, ringData }) {
    const backRef = React.useRef(null);
    const frontRef = React.useRef(null);
    const imgRef = React.useRef(null);
    const sphereR = sphereSize / 2;
    const canvasSize = Math.ceil(ringData.outerScale * sphereSize * 1.08);

    React.useEffect(() => {
        const back  = backRef.current;
        const front = frontRef.current;
        if (!back || !front) return;

        const draw = (img) => {
            _drawRingHalf(back.getContext('2d'),  canvasSize, sphereR, ringData, 'back',  img);
            _drawRingHalf(front.getContext('2d'), canvasSize, sphereR, ringData, 'front', img);
        };

        if (ringData.texturePath) {
            const cached = imgRef.current;
            if (cached && cached.dataset.src === ringData.texturePath) {
                if (cached.complete && cached.naturalWidth > 0) draw(cached);
                else cached.addEventListener('load', () => draw(cached), { once: true });
            } else {
                const img = new Image();
                img.dataset.src = ringData.texturePath;
                imgRef.current = img;
                img.addEventListener('load', () => draw(img), { once: true });
                img.src = ringData.texturePath;
            }
        } else {
            draw(null);
        }
    }, [canvasSize, sphereR, ringData]);

    const pos = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        width: canvasSize,
        height: canvasSize,
    };

    return (
        <>
            <canvas ref={backRef}  width={canvasSize} height={canvasSize} style={{ ...pos, zIndex: 1 }} />
            <canvas ref={frontRef} width={canvasSize} height={canvasSize} style={{ ...pos, zIndex: 3 }} />
        </>
    );
}

// ── Composants visuels ────────────────────────────────────────────────────

function BodyVisual({ body, kind = 'planet', size = 64, className = '' }) {
    const visual = getBodyVisual(body, kind);
    const [textureOk, setTextureOk] = React.useState(true);
    React.useEffect(() => { setTextureOk(true); }, [visual.texture]);
    const useTexture = !!visual.texture && textureOk;
    const hasRings = !!visual.ringData;
    const moonStretch = kind === 'moon' ? getMoonStretch(body) : null;
    const shapeStyle = moonStretch ? {
        transform: `scale(${moonStretch.x}, ${moonStretch.y})`,
        transformOrigin: 'center center',
    } : undefined;

    // Exoplanètes : canvas génératif identique à la vue orbitale
    const isExo = kind === 'planet' && !visual.texture && EXO_VISUAL_TYPES.has(body?.visualType);
    if (isExo) {
        return (
            <div
                className={[styles.sphere, className, hasRings ? styles.sphereWithRings : ''].filter(Boolean).join(' ')}
                style={{ width: size, height: size, '--glow': `${visual.glowColor}88`, ...shapeStyle }}
            >
                <ExoPlanetSphere
                    visualType={body.visualType}
                    color={body.color ?? visual.glowColor}
                    name={body.name ?? body.englishName ?? body.id ?? 'unknown'}
                    size={size}
                />
                {hasRings && <RingCanvas sphereSize={size} ringData={visual.ringData} />}
            </div>
        );
    }

    const fallbackBg = `radial-gradient(circle at 42% 36%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 28%), radial-gradient(circle at 50% 50%, ${visual.glowColor ?? '#888'}cc 0%, rgba(0,0,0,0.85) 120%)`;
    return (
        <div
            className={[
                styles.sphere,
                className,
                visual.variant === 'star' ? styles.sphereStar : '',
                visual.variant === 'moon' ? styles.sphereMoon : '',
                hasRings ? styles.sphereWithRings : '',
            ].filter(Boolean).join(' ')}
            style={{
                width: size,
                height: size,
                '--glow': `${visual.glowColor}88`,
                ...shapeStyle,
            }}
        >
            {visual.texture && (
                <img
                    key={visual.texture}
                    src={visual.texture}
                    alt=""
                    aria-hidden="true"
                    onError={() => setTextureOk(false)}
                    style={{ display: 'none' }}
                />
            )}
            {visual.variant === 'star' && visual.starBackground && (
                <div
                    className={styles.starCore}
                    style={{ background: visual.starBackground }}
                />
            )}
            <div
                className={`${styles.sphereSurface} ${useTexture ? styles.sphereSurfaceImage : styles.sphereSurfaceGradient}`}
                style={useTexture ? { backgroundImage: `url(${visual.texture})` } : { background: visual.background ?? fallbackBg }}
            />
            {visual.variant === 'moon' && visual.tintColor && (
                <div
                    className={styles.sphereTint}
                    style={{ background: visual.tintColor }}
                />
            )}
            {hasRings && <RingCanvas sphereSize={size} ringData={visual.ringData} />}
        </div>
    );
}

function GalaxyVisual({ galaxy }) {
    const imageSrc = galaxy.image ?? null;
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);
    const showLoader = imageSrc && !loaded && !errored;
    const showPlaceholder = !imageSrc || errored;
    return (
        <div className={styles.galaxyHero}>
            {showPlaceholder ? (
                <div
                    className={styles.galaxyHeroImage}
                    aria-label={galaxy.name}
                    style={{
                        background:
                            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.28) 0%, rgba(120,170,255,0.12) 18%, rgba(16,26,56,0.94) 52%, rgba(5,8,18,1) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                />
            ) : (
                <>
                    {showLoader && (
                        <div className={styles.galaxyHeroLoader}>
                            <InfinityLoader size={40} />
                        </div>
                    )}
                    <img
                        className={styles.galaxyHeroImage}
                        src={imageSrc}
                        alt={galaxy.name}
                        loading="lazy"
                        style={loaded ? {} : { opacity: 0 }}
                        onLoad={() => setLoaded(true)}
                        onError={() => setErrored(true)}
                    />
                </>
            )}
            <div className={styles.galaxyHeroOverlay} />
        </div>
    );
}

function getComparativeScale(value, referenceValue, minScale = 0.12, maxScale = 8, exponent = 0.5) {
    if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(referenceValue) || referenceValue <= 0) {
        return 1;
    }
    const ratio = value / referenceValue;
    return Math.max(minScale, Math.min(maxScale, Math.pow(ratio, exponent)));
}

function safeSize(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function mixScale(from, to, weight) {
    const t = Math.max(0, Math.min(1, weight));
    return from + (to - from) * t;
}

function getNiceScaleKm(rawKm) {
    if (!Number.isFinite(rawKm) || rawKm <= 0) return null;
    const exponent = Math.floor(Math.log10(rawKm));
    const base = Math.pow(10, exponent);
    const normalized = rawKm / base;

    let niceNormalized = 1;
    if (normalized >= 5) niceNormalized = 5;
    else if (normalized >= 2) niceNormalized = 2;
    else niceNormalized = 1;

    return niceNormalized * base;
}

function formatGalaxyAngularSize(galaxy) {
    const major = galaxy?.majorAxisDeg;
    if (!Number.isFinite(major) || major <= 0) return null;
    // La Lune pleine mesure ~0,5° de diamètre apparent
    const moonRatio = major / 0.5;
    if (moonRatio >= 0.1) {
        return `${moonRatio.toFixed(1)}× la Lune pleine dans le ciel`;
    }
    return `${(major * 60).toFixed(1)}′ (plus petit que la Lune)`;
}

function formatGalaxyStarCount(galaxy) {
    const n = galaxy?.starCount ?? galaxy?.numberOfStars;
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n >= 1e12) return `${(n / 1e12).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} billion d'étoiles`;
    if (n >= 1e9)  return `${Math.round(n / 1e9).toLocaleString('fr-FR')} milliard${n >= 2e9 ? 's' : ''} d'étoiles`;
    if (n >= 1e6)  return `${Math.round(n / 1e6).toLocaleString('fr-FR')} million${n >= 2e6 ? 's' : ''} d'étoiles`;
    return `${n.toLocaleString('fr-FR')} étoiles`;
}

function formatGalaxySizeKly(galaxy) {
    const kly = galaxy?.sizeKly;
    if (!Number.isFinite(kly) || kly <= 0) return null;
    const ly = kly * 1000;
    if (ly >= 1e6) return `${(ly / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} millions d'années-lumière`;
    return `${Math.round(ly / 1000).toLocaleString('fr-FR')} milliers d'années-lumière`;
}

function formatGalaxyDistance(galaxy) {
    const mly = galaxy?.distanceMly;
    if (!Number.isFinite(mly) || mly <= 0) return null;
    if (mly >= 1000) return `à ${(mly / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} milliards d'années-lumière`;
    return `à ${mly.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} millions d'années-lumière`;
}

function formatScaleExponent(value) {
    if (!Number.isFinite(value) || value <= 0) return null;
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    const roundedMantissa = mantissa >= 9.95 ? 10 : Math.round(mantissa * 10) / 10;
    if (roundedMantissa === 10) {
        return '10^' + (exponent + 1);
    }
    if (Math.abs(roundedMantissa - 1) < 0.05) {
        return '10^' + exponent;
    }
    return `${String(roundedMantissa).replace('.', ',')} × 10^${exponent}`;
}

function getStarRelativeScale(sys, centeredKey, sortedSystems) {
    const getRadius = (s) => s?.starInfo?.meanRadius ?? (s?.isSolar ? 695700 : 695700);
    const focusedSys = sortedSystems.find(s => String(s.id) === String(centeredKey)) ?? sys;
    return getComparativeScale(getRadius(sys), getRadius(focusedSys), 0.1, 5, 0.4);
}

function getPlanetRelativeScale(planet, centeredKey, sortedPlanets) {
    const sizeRatio = planet.size ?? (planet.meanRadius ? planet.meanRadius / 6371 : 0);
    const focusedPlanet = sortedPlanets.find((candidate) => (
        (candidate.name ?? candidate.englishName ?? candidate.id) === centeredKey
    )) ?? planet;
    const focusedSize = focusedPlanet.size ?? (focusedPlanet.meanRadius ? focusedPlanet.meanRadius / 6371 : 0);
    return getComparativeScale(sizeRatio, focusedSize, 0.08, 24, 1);
}

function getMoonRelativeScale(moon, centeredKey, visibleMoons) {
    const focusedMoon = visibleMoons.find((candidate) => (
        String(candidate.id ?? candidate.englishName ?? candidate.name) === centeredKey
    )) ?? moon;
    return getComparativeScale(
        moon.meanRadius ?? 0,
        focusedMoon.meanRadius ?? 0,
        0.06,
        20,
        1
    );
}

function getAdaptivePairGap(sizeA, sizeB, baseGap) {
    void sizeA;
    void sizeB;
    return baseGap;
}

function CarouselRow({
    items,
    getKey,
    activeKey = null,
    onFocusItem,
    onSelect,
    renderItem,
    getRenderedSize,
    getPhysicalDiameterKm,
    getItemFootprintSize,
    focusDiameter = 280,
    visibleRadius = CAROUSEL_VISIBLE_RADIUS_DEFAULT,
    edgeGap = CAROUSEL_STEP_GAP,
    centerShift = 0,
    shellClassName = '',
}) {
    const shellRef = useRef(null);
    const wheelLockRef = useRef(false);
    const wheelUnlockTimerRef = useRef(null);
    const [centeredKey, setCenteredKey] = useState(activeKey ?? (items[0] ? getKey(items[0]) : null));
    const centeredIndex = Math.max(0, items.findIndex((item) => String(getKey(item)) === String(centeredKey)));

    useEffect(() => {
        if (items.length === 0) {
            setCenteredKey(null);
            return;
        }
        setCenteredKey((current) => {
            if (current && items.some((item) => getKey(item) === current)) return current;
            if (activeKey && items.some((item) => getKey(item) === activeKey)) return activeKey;
            return getKey(items[0]);
        });
    }, [items, getKey, activeKey]);

    useEffect(() => () => {
        if (wheelUnlockTimerRef.current) window.clearTimeout(wheelUnlockTimerRef.current);
    }, []);

    useEffect(() => {
        const shell = shellRef.current;
        if (!shell) return undefined;

        const onNativeWheel = (event) => {
            const absX = Math.abs(event.deltaX);
            const absY = Math.abs(event.deltaY);
            if (absY < 4 || absY < absX) return;
            event.preventDefault();
            moveByStep(event.deltaY > 0 ? 1 : -1);
        };

        shell.addEventListener('wheel', onNativeWheel, { passive: false });
        return () => {
            shell.removeEventListener('wheel', onNativeWheel);
        };
    }, [centeredIndex, items]);

    useEffect(() => {
        const shell = shellRef.current;
        if (!shell) return undefined;
        let startX = 0;
        let startY = 0;
        let swiping = false;
        const onTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            swiping = false;
        };
        const onTouchMove = (e) => {
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            if (!swiping && Math.abs(dy) > Math.abs(dx)) return; // scroll vertical
            swiping = true;
            e.preventDefault(); // bloquer le scroll de page
        };
        const onTouchEnd = (e) => {
            if (!swiping) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) moveByStep(dx < 0 ? 1 : -1);
        };
        shell.addEventListener('touchstart', onTouchStart, { passive: true });
        shell.addEventListener('touchmove', onTouchMove, { passive: false });
        shell.addEventListener('touchend', onTouchEnd);
        return () => {
            shell.removeEventListener('touchstart', onTouchStart);
            shell.removeEventListener('touchmove', onTouchMove);
            shell.removeEventListener('touchend', onTouchEnd);
        };
    }, [centeredIndex, items]); // mêmes deps que le useEffect wheel

    const onFocusItemRef = useRef(onFocusItem);
    onFocusItemRef.current = onFocusItem;

    // Sync initiale : rapporte l'élément centré au montage (sauf si activeKey déjà connu)
    useEffect(() => {
        if (activeKey) return;
        const item = items[centeredIndex];
        if (item) onFocusItemRef.current?.(item);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const skipFocusRef = useRef(false);
    useEffect(() => {
        if (!activeKey) return;
        skipFocusRef.current = true;
        setCenteredKey(activeKey);
    }, [activeKey]);

    useEffect(() => {
        if (skipFocusRef.current) {
            skipFocusRef.current = false;
            return;
        }
        const centeredItem = items[centeredIndex];
        if (centeredItem) onFocusItemRef.current?.(centeredItem);
    }, [centeredKey]); // eslint-disable-line react-hooks/exhaustive-deps

    function goToIndex(nextIndex) {
        const boundedIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
        if (boundedIndex === centeredIndex) return;
        const nextItem = items[boundedIndex];
        setCenteredKey(getKey(nextItem));
    }

    function moveByStep(direction) {
        if (wheelLockRef.current) return;
        const nextIndex = Math.max(0, Math.min(items.length - 1, centeredIndex + direction));
        if (nextIndex === centeredIndex) return;
        wheelLockRef.current = true;
        goToIndex(nextIndex);
        if (wheelUnlockTimerRef.current) window.clearTimeout(wheelUnlockTimerRef.current);
        wheelUnlockTimerRef.current = window.setTimeout(() => {
            wheelLockRef.current = false;
        }, 280);
    }

    const renderedSizes = useMemo(() => (
        items.map((item, index) => safeSize(
            getRenderedSize?.(item, centeredKey, {
                isCentered: index === centeredIndex,
                index,
                centeredIndex,
                distanceFromCenter: Math.abs(index - centeredIndex),
            }) ?? focusDiameter,
            focusDiameter
        ))
    ), [items, getRenderedSize, centeredKey, centeredIndex, focusDiameter]);

    const footprintSizes = useMemo(() => (
        items.map((item, index) => {
            const renderedSize = renderedSizes[index] ?? focusDiameter;
            return safeSize(
                getItemFootprintSize?.(item, renderedSize) ?? renderedSize,
                renderedSize
            );
        })
    ), [items, renderedSizes, focusDiameter, getItemFootprintSize]);

    const visibleIndices = useMemo(() => {
        if (centeredIndex < 0) return [];
        const list = [];
        for (let offset = -visibleRadius; offset <= visibleRadius; offset += 1) {
            const index = centeredIndex + offset;
            if (index >= 0 && index < items.length) {
                list.push(index);
            }
        }
        return list;
    }, [centeredIndex, items.length, visibleRadius]);

    const centeredScale = useMemo(() => {
        if (centeredIndex < 0 || !items[centeredIndex]) return null;
        const centeredItem = items[centeredIndex];
        const renderedSize = renderedSizes[centeredIndex] ?? focusDiameter;
        const physicalDiameterKm = getPhysicalDiameterKm?.(centeredItem);
        if (!Number.isFinite(physicalDiameterKm) || physicalDiameterKm <= 0 || !Number.isFinite(renderedSize) || renderedSize <= 0) {
            return null;
        }

        const kmPerPx = physicalDiameterKm / renderedSize;
        const targetPx = 128;
        const targetKm = kmPerPx * targetPx;
        const niceKm = getNiceScaleKm(targetKm);
        if (!Number.isFinite(niceKm) || niceKm <= 0) return null;
        const rulerPx = 128;
        const subdivisions = niceKm >= Math.pow(10, Math.floor(Math.log10(niceKm))) * 5 ? 5 : 4;
        return {
            rulerPx: Math.round(rulerPx),
            rulerKm: niceKm,
            kmPerPx,
            subdivisions,
            exponentLabel: formatScaleExponent(niceKm),
        };
    }, [centeredIndex, items, renderedSizes, focusDiameter, getPhysicalDiameterKm]);

    return (
        <div
            ref={shellRef}
            className={[styles.carouselShell, shellClassName].filter(Boolean).join(' ')}
            style={{
                '--carousel-focus-diameter': `${focusDiameter}px`,
                '--carousel-edge-gap': `${edgeGap}px`,
                '--carousel-center-shift': `${centerShift}px`,
            }}
        >
            <div className={styles.carouselStage}>
                {visibleIndices.map((index) => {
                    const item = items[index];
                    const key = String(getKey(item));
                    const isCentered = centeredKey === key;
                    const isActive = activeKey != null && String(activeKey) === key;
                    const renderedSize = renderedSizes[index] ?? focusDiameter;
                    const footprintSize = footprintSizes[index] ?? renderedSize;
                    const direction = index - centeredIndex;
                    let offsetX = 0;

                    if (direction !== 0) {
                        const step = direction > 0 ? 1 : -1;
                        let previousSize = footprintSizes[centeredIndex] ?? focusDiameter;

                        for (let cursor = centeredIndex + step; step > 0 ? cursor <= index : cursor >= index; cursor += step) {
                            const currentSize = footprintSizes[cursor] ?? (renderedSizes[cursor] ?? focusDiameter);
                            const pairGap = getAdaptivePairGap(previousSize, currentSize, edgeGap);
                            offsetX += step * (((previousSize + currentSize) / 2) + pairGap);
                            previousSize = currentSize;
                        }
                    }
                    return (
                        <div
                            key={key}
                            role="button"
                            tabIndex={0}
                            data-carousel-key={key}
                            className={[
                                styles.carouselItem,
                                isCentered ? styles.carouselItemCentered : '',
                                isActive ? styles.carouselItemActive : '',
                            ].filter(Boolean).join(' ')}
                            style={{
                                width: `${Math.max(footprintSize, 180)}px`,
                                '--item-size': `${renderedSize}px`,
                                '--item-offset-x': `${offsetX}px`,
                            }}
                            onClick={() => {
                                if (isCentered) {
                                    onFocusItem?.(item);
                                    onSelect?.(item);
                                    return;
                                }
                                setCenteredKey(key);
                                onFocusItem?.(item);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (isCentered) { onFocusItem?.(item); onSelect?.(item); }
                                    else { setCenteredKey(key); onFocusItem?.(item); }
                                }
                            }}
                        >
                            {renderItem(item, { isCentered, isActive, centeredKey, renderedSize, index, centeredIndex })}
                        </div>
                    );
                })}
            </div>
            {centeredScale && (
                <div className={styles.carouselScale}>
                    <div className={styles.carouselScaleRule}>
                        <div
                            className={styles.carouselScaleLine}
                            style={{ width: `${centeredScale.rulerPx}px` }}
                        >
                            {Array.from({ length: centeredScale.subdivisions + 1 }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`${styles.carouselScaleTick} ${index === 0 || index === centeredScale.subdivisions ? styles.carouselScaleTickMajor : ''}`}
                                    style={{ left: `${(index / centeredScale.subdivisions) * 100}%` }}
                                />
                            ))}
                        </div>
                        <div className={styles.carouselScaleReadout}>
                            {Math.round(centeredScale.rulerKm).toLocaleString('fr-FR')} km
                        </div>
                        <div className={styles.carouselScalePower}>
                            {centeredScale.exponentLabel}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Composant principal ───────────────────────────────────────────────────

export default function CatalogView({
    allExtraSystems,
    galaxies = [],
    infos = null,
    solarPlanets,
    moons,
    selectedMilkyWay,
    selectedPlanet,
    selectedMoon,
    focusMilkyWay,
    focusCatalogGalaxy,
    focusStarSystem,
    focusOnSolarSystem,
    focusPlanet,
    focusMoon,
}) {
    const overlayRef = useRef(null);
    const skipMilkyWaySyncRef = useRef(false);
    const skipPlanetSyncRef   = useRef(null);
    const skipGalaxyFallbackRef = useRef(false);
    const skipMoonsLevelRevertRef = useRef(false);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 720px)');
        setIsMobile(mq.matches);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const [level, setLevel]               = useState('galaxies');
    const [activeSystemId, setActiveSystemId] = useState(null);
    const [activePlanetName, setActivePlanetName] = useState(null);
    const [sort, setSort]                 = useState('distance'); // distance | size | mass
    const [sortDir, setSortDir]           = useState('asc');
    const [starSort, setStarSort]         = useState('temperature'); // temperature | size | planets | name
    const [starSortDir, setStarSortDir]   = useState('asc');

    const [searchQuery, setSearchQuery]       = useState('');
    const [filterSpectral, setFilterSpectral] = useState(''); // 'O'|'B'|'A'|'F'|'G'|'K'|'M'|''
    const [filterHZ, setFilterHZ]             = useState(false);
    const [filterPlanetsMin, setFilterPlanetsMin] = useState(0);
    const [moonDetails, setMoonDetails] = useState({});

    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('spaceodyssey_favorites') ?? '[]'); }
        catch { return []; }
    });
    const catalogGalaxies = useMemo(() => {
        const knownIds = new Set(GALAXIES.map((galaxy) => galaxy.id));
        return [
            ...GALAXIES,
            ...galaxies.filter((galaxy) => !knownIds.has(galaxy.id)),
        ];
    }, [galaxies]);
    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
            localStorage.setItem('spaceodyssey_favorites', JSON.stringify(next));
            return next;
        });
    };

    // ── Reset filtres étoiles quand on quitte le niveau stars ───────────

    useEffect(() => {
        if (level !== 'stars') {
            setSearchQuery('');
            setFilterSpectral('');
            setFilterHZ(false);
            setFilterPlanetsMin(0);
        }
    }, [level]);

    // ── solarMoonMap — doit être avant les useEffect de sync ────────────

    const solarMoonMap = useMemo(() => Object.fromEntries(
        solarPlanets.map((planet) => [
            planet.englishName ?? planet.id,
            getMoonStubsFromPlanet(planet),
        ])
    ), [solarPlanets]);

    // ── Sync depuis la nav bar ───────────────────────────────────────────

    useEffect(() => {
        if (!selectedMilkyWay) return;
        if (skipMilkyWaySyncRef.current) { skipMilkyWaySyncRef.current = false; return; }
        if (String(selectedMilkyWay).startsWith('galaxy:')) {
            setActiveSystemId(null);
            setActivePlanetName(null);
            setLevel('galaxies');
            return;
        }
        if (selectedMilkyWay === 'Solar System') {
            setActiveSystemId('solar');
            setActivePlanetName(null);
            setLevel('stars');
        } else {
            const sys = allExtraSystems.find(s => s.milkyWayKey === selectedMilkyWay);
            if (sys) {
                setActiveSystemId(sys.id);
                setActivePlanetName(null);
                setLevel('stars');
            }
        }
    }, [selectedMilkyWay, allExtraSystems]);

    useEffect(() => {
        if (!selectedPlanet) return;
        if (skipPlanetSyncRef.current && skipPlanetSyncRef.current === selectedPlanet) {
            skipPlanetSyncRef.current = null;
            return;
        }
        const exoSys = allExtraSystems.find(sys => sys.planets.some(p => p.name === selectedPlanet));
        const solarPlanet = solarPlanets.find((planet) => (
            planet.id === selectedPlanet
            || planet.englishName === selectedPlanet
            || planet.name === selectedPlanet
        ));
        setActiveSystemId(exoSys ? exoSys.id : 'solar');
        setActivePlanetName(
            exoSys
                ? selectedPlanet
                : (solarPlanet?.englishName ?? solarPlanet?.name ?? solarPlanet?.id ?? selectedPlanet)
        );
        setLevel('planets');
    }, [selectedPlanet, allExtraSystems, solarPlanets]);

    useEffect(() => {
        if (!selectedMoon) return;
        setLevel('moons');
        setActiveSystemId('solar');
        const entry = Object.entries(solarMoonMap).find(([, moons]) =>
            moons.some(m => (m.id ?? m.englishName) === selectedMoon)
        );
        if (entry) setActivePlanetName(entry[0]);
    }, [selectedMoon, solarMoonMap]);

    useEffect(() => {
        if (selectedMoon) return;

        if (selectedPlanet) {
            if (skipMoonsLevelRevertRef.current) {
                skipMoonsLevelRevertRef.current = false;
                return;
            }
            setLevel('planets');
            return;
        }

        if (selectedMilkyWay && !isGalaxyOverviewSelection(selectedMilkyWay)) {
            setLevel('stars');
            setActivePlanetName(null);
            return;
        }

        if (skipGalaxyFallbackRef.current) {
            skipGalaxyFallbackRef.current = false;
            setLevel('stars');
            setActivePlanetName(null);
            return;
        }

        setLevel('galaxies');
        setActiveSystemId(null);
        setActivePlanetName(null);
    }, [selectedMilkyWay, selectedPlanet, selectedMoon]);

    // ── Système actif ────────────────────────────────────────────────────

    const activeSystem = useMemo(() => {
        if (!activeSystemId) return null;
        if (activeSystemId === 'solar') {
            return {
                id: 'solar',
                name: 'Soleil',
                planets: solarPlanets.map(p => ({
                    name: p.englishName,
                    id: p.id,
                    color: SOLAR_COLORS[p.id] ?? SOLAR_COLORS[p.englishName?.toLowerCase()] ?? '#888',
                    size: p.meanRadius ? p.meanRadius / 6371 : 1,
                    meanRadius: p.meanRadius,
                    avgTemp: p.avgTemp,
                    bodyType: 'Planet',
                    visualType: p.bodyType ?? 'Planet',
                    massEarth: p.mass ? (p.mass.massValue * Math.pow(10, p.mass.massExponent) / 5.972e24) : 0,
                    sideralOrbit: p.sideralOrbit,
                })),
            };
        }
        return allExtraSystems.find(s => s.id === activeSystemId) ?? null;
    }, [activeSystemId, allExtraSystems, solarPlanets]);

    // ── Planètes triées ──────────────────────────────────────────────────

    const sortedPlanets = useMemo(() => {
        const list = activeSystem?.planets ?? [];
        const copy = [...list];
        if (sort === 'size') copy.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
        else if (sort === 'mass') copy.sort((a, b) => (a.massEarth ?? 0) - (b.massEarth ?? 0));
        else copy.sort((a, b) => (a.r ?? 0) - (b.r ?? 0));
        if (sortDir === 'desc') copy.reverse();
        return copy;
    }, [activeSystem, sort, sortDir]);

    // ── Étoiles filtrées ─────────────────────────────────────────────────

    const allSystems = useMemo(() => [
        { id: 'solar', name: 'Soleil', starColor: '#ffe880', isSolar: true, planets: solarPlanets },
        ...allExtraSystems,
    ], [allExtraSystems, solarPlanets]);

    const sortedSystems = useMemo(() => {
        const systems = [...allSystems];
        const getTemp = (system) => system?.starInfo?.avgTemp ?? (system.isSolar ? 5778 : -Infinity);
        const getRadius = (system) => system?.starInfo?.meanRadius ?? (system.isSolar ? 695700 : -Infinity);
        const getPlanets = (system) => system?.planets?.length ?? 0;

        if (starSort === 'size') {
            systems.sort((a, b) => getRadius(a) - getRadius(b));
        } else if (starSort === 'planets') {
            systems.sort((a, b) => getPlanets(a) - getPlanets(b));
        } else if (starSort === 'name') {
            systems.sort((a, b) => String(a.name).localeCompare(String(b.name), 'fr', { sensitivity: 'base' }));
        } else {
            systems.sort((a, b) => getTemp(a) - getTemp(b));
        }
        if (starSortDir === 'desc') systems.reverse();

        let result = systems;
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(s => s.name?.toLowerCase().includes(q));
        }
        if (filterSpectral) {
            result = result.filter(s => {
                const teff = s?.starInfo?.avgTemp ?? (s.isSolar ? 5778 : null);
                return getSpectralClass(teff) === filterSpectral;
            });
        }
        if (filterHZ) {
            result = result.filter(s => s.habitableZone ?? s.isSolar);
        }
        if (filterPlanetsMin > 0) {
            result = result.filter(s => (s.planets?.length ?? 0) >= filterPlanetsMin);
        }
        return result;
    }, [allSystems, starSort, starSortDir, searchQuery, filterSpectral, filterHZ, filterPlanetsMin]);

    const visibleMoons = useMemo(() => {
        if (activeSystemId !== 'solar' || !activePlanetName) return [];
        return solarMoonMap[activePlanetName] ?? [];
    }, [activeSystemId, activePlanetName, solarMoonMap]);

    const visibleMoonsDetailed = useMemo(() => (
        visibleMoons.map((moon) => ({
            ...moon,
            ...(moonDetails[moon.id] ?? {}),
        }))
    ), [visibleMoons, moonDetails]);

    useEffect(() => {
        if (level !== 'moons' || visibleMoons.length === 0) return;
        let cancelled = false;
        const missingIds = visibleMoons
            .map((moon) => moon.id)
            .filter((id) => id && !moonDetails[id]);
        if (missingIds.length === 0) return;

        Promise.allSettled(missingIds.map((id) => fetchBody(id)))
            .then((results) => {
                if (cancelled) return;
                setMoonDetails((current) => {
                    const next = { ...current };
                    results.forEach((result, index) => {
                        if (result.status === 'fulfilled' && result.value) {
                            next[missingIds[index]] = result.value;
                        }
                    });
                    return next;
                });
            });

        return () => {
            cancelled = true;
        };
    }, [level, visibleMoons, moonDetails]);

    const activePlanetCarouselKey = useMemo(() => {
        const match = sortedPlanets.find((planet) => (
            selectedPlanet === planet.id
            || selectedPlanet === planet.name
            || selectedPlanet === planet.englishName
        ));
        return match ? (match.name ?? match.englishName ?? match.id) : null;
    }, [sortedPlanets, selectedPlanet]);

    function getPlanetSelectionValue(planet) {
        if (activeSystemId === 'solar') {
            return planet.id ?? planet.englishName ?? planet.name;
        }
        return planet.name ?? planet.englishName ?? planet.id;
    }

    // ── Handlers ─────────────────────────────────────────────────────────

    function focusGalaxyOnly(galaxy) {
        if (galaxy.id === 'milkyway') focusMilkyWay?.();
        else focusCatalogGalaxy?.(galaxy);
        setLevel('galaxies');
        setActiveSystemId(null);
        setActivePlanetName(null);
    }

    function goGalaxy(galaxy) {
        focusGalaxyOnly(galaxy);
        if (galaxy.hasStars) {
            skipGalaxyFallbackRef.current = true;
            setLevel('stars');
        }
    }

    function goStar(sys) {
        skipMilkyWaySyncRef.current = true;
        setActiveSystemId(sys.id);
        setLevel('planets');
        if (sys.id === 'solar') focusOnSolarSystem?.();
        else focusStarSystem?.(sys.id);
    }

    function focusStarOnly(sys) {
        setActiveSystemId(sys.id);
        if (sys.id === 'solar') focusOnSolarSystem?.();
        else focusStarSystem?.(sys.id);
    }

    function goPlanet(planet) {
        const name = planet.name ?? planet.englishName ?? planet.id;
        const selectionValue = getPlanetSelectionValue(planet);
        setActivePlanetName(name);
        if (activeSystemId === 'solar') {
            const planetMoons = solarMoonMap[name] ?? [];
            if (planetMoons.length > 0) {
                skipPlanetSyncRef.current = selectionValue;
                skipMoonsLevelRevertRef.current = true;
                setLevel('moons');
                if (activePlanetCarouselKey !== name) focusPlanet?.(selectionValue, activeSystemId);
                const firstMoon = planetMoons[0];
                focusMoon?.(firstMoon.id ?? firstMoon.englishName, name);
                return;
            }
        }
        if (activePlanetCarouselKey !== name) focusPlanet?.(selectionValue, activeSystemId);
    }

    function focusPlanetOnly(planet) {
        const name = planet.name ?? planet.englishName ?? planet.id;
        const selectionValue = getPlanetSelectionValue(planet);
        setActivePlanetName(name);
        if (activePlanetCarouselKey !== name) {
            focusPlanet?.(selectionValue, activeSystemId);
        }
    }

    function goMoon(moon) {
        focusMoon?.(moon.id ?? moon.englishName, activePlanetName);
    }

    // Bloquer tout scroll de page quand le catalogue est ouvert
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return undefined;

        const blockScroll = (event) => {
            event.preventDefault();
        };

        overlay.addEventListener('wheel', blockScroll, { passive: false });
        return () => {
            overlay.removeEventListener('wheel', blockScroll);
        };
    }, []);

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div ref={overlayRef} className={styles.overlay}>

            {/* ── Galaxies ── */}
            {level === 'galaxies' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Galaxies</span>
                        <span className={styles.count}>{catalogGalaxies.length} répertoriées</span>
                    </div>
                    <CarouselRow
                        items={catalogGalaxies}
                        getKey={(galaxy) => galaxy.id}
                        activeKey={infos?.bodyType === 'Galaxy' ? infos.id : 'milkyway'}
                        onFocusItem={focusGalaxyOnly}
                        onSelect={goGalaxy}
                        shellClassName={styles.galaxyCarouselShell}
                        getPhysicalDiameterKm={(galaxy) => galaxy?.id === 'milkyway' ? 946073047258080 : 2081172703967776}
                        focusDiameter={isMobile ? 200 : 360}
                        getRenderedSize={() => isMobile ? 200 : 360}
                        renderItem={(galaxy, { isCentered }) => (
                            <>
                                <div className={styles.carouselCaption}>
                                    <GalaxyVisual galaxy={galaxy} />
                                    <div className={styles.carouselTitle}>{galaxy.name}</div>
                                    <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                        <div className={styles.carouselMeta}>{galaxy.subtitle}</div>
                                        <div className={styles.carouselAccent}>{galaxy.accent}</div>
                                        {formatGalaxyStarCount(galaxy) && (
                                            <div className={styles.carouselMeta}>{formatGalaxyStarCount(galaxy)}</div>
                                        )}
                                        {formatGalaxySizeKly(galaxy) && (
                                            <div className={styles.carouselMeta}>{formatGalaxySizeKly(galaxy)} de diamètre</div>
                                        )}
                                        {formatGalaxyDistance(galaxy) && (
                                            <div className={styles.carouselMeta}>Distante {formatGalaxyDistance(galaxy)}</div>
                                        )}
                                        {formatGalaxyAngularSize(galaxy) && (
                                            <div className={styles.carouselMeta}>{formatGalaxyAngularSize(galaxy)}</div>
                                        )}
                                        <div className={styles.carouselMeta}>{galaxy.meta}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </>
            )}

            {/* ── Étoiles ── */}
            {level === 'stars' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Étoiles</span>
                        <span className={styles.count}>{sortedSystems.length} systèmes</span>
                        <div className={styles.sortControls}>
                            {[['temperature', 'Froid → chaud'], ['size', 'Taille'], ['planets', 'Planètes'], ['name', 'Nom']].map(([key, label]) => (
                                <button
                                    key={key}
                                    className={`${styles.sortBtn} ${starSort === key ? styles.sortBtnActive : ''}`}
                                    onClick={() => {
                                        if (starSort === key) setStarSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                        else { setStarSort(key); setStarSortDir('asc'); }
                                    }}
                                    type="button"
                                    aria-label={`Trier par ${label}`}
                                >
                                    {label}{starSort === key ? (starSortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filtersBar}>
                        <input
                            className={styles.searchInput}
                            type="text"
                            placeholder="Rechercher…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            aria-label="Rechercher un système"
                        />
                        <div className={styles.filterChips}>
                            {['M','K','G','F','A','B','O'].map(cls => (
                                <button
                                    key={cls}
                                    type="button"
                                    className={`${styles.filterChip} ${filterSpectral === cls ? styles.filterChipActive : ''}`}
                                    onClick={() => setFilterSpectral(v => v === cls ? '' : cls)}
                                    aria-label={`Type spectral ${cls}`}
                                >
                                    {cls}
                                </button>
                            ))}
                            <button
                                type="button"
                                className={`${styles.filterChip} ${filterHZ ? styles.filterChipActive : ''}`}
                                onClick={() => setFilterHZ(v => !v)}
                                aria-label="Zone habitable"
                            >
                                HZ
                            </button>
                            {[2, 5, 8].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`${styles.filterChip} ${filterPlanetsMin === n ? styles.filterChipActive : ''}`}
                                    onClick={() => setFilterPlanetsMin(v => v === n ? 0 : n)}
                                    aria-label={`Au moins ${n} planètes`}
                                >
                                    {n}+ ♁
                                </button>
                            ))}
                        </div>
                    </div>
                    <CarouselRow
                        items={sortedSystems}
                        getKey={(sys) => sys.id}
                        activeKey={activeSystemId}
                        onFocusItem={focusStarOnly}
                        onSelect={goStar}
                        getPhysicalDiameterKm={(sys) => {
                            const radiusKm = sys?.starInfo?.meanRadius ?? (sys?.isSolar ? 695700 : null);
                            return Number.isFinite(radiusKm) ? radiusKm * 2 : null;
                        }}
                        focusDiameter={300}
                        visibleRadius={CAROUSEL_VISIBLE_RADIUS_STARS}
                        edgeGap={120}
                        getRenderedSize={(sys, centeredKey, ctx) => {
                            const relativeScale = getStarRelativeScale(sys, centeredKey, sortedSystems);
                            const distance = ctx?.distanceFromCenter ?? 0;
                            if (distance === 0) return 300;
                            // Étoiles adjacentes : taille relative au focus, plafonnée
                            const scaled = 300 * Math.min(Math.max(relativeScale, 0.2), 0.6);
                            return Math.max(Math.round(scaled), 100);
                        }}
                        renderItem={(sys, { isCentered, renderedSize }) => {
                            const temp = sys.starInfo?.avgTemp ?? (sys.isSolar ? 5778 : null);
                            const spectralClass = getSpectralClass(temp);
                            const nbPlanetes = sys.planets?.length ?? 0;
                            const radiusKm = sys.starInfo?.meanRadius ?? (sys.isSolar ? 695700 : null);
                            const radiusSol = radiusKm ? radiusKm / 695700 : null;
                            const distLy = sys.sy_dist ? Math.round(sys.sy_dist * 3.2616) : null;
                            const tempC = temp ? Math.round(temp - 273.15) : null;
                            return (
                                <>
                                    <div className={styles.carouselVisualStage}>
                                        <StarCanvas sys={sys} size={Math.round(renderedSize)} />
                                    </div>
                                    <div className={styles.carouselCaption}>
                                        <div className={styles.carouselTitle}>{sys.name}</div>
                                        <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                            <div className={styles.carouselMeta}>{SPECTRAL_LABELS[spectralClass] || 'Étoile'} · {nbPlanetes} planète{nbPlanetes !== 1 ? 's' : ''}</div>
                                            {tempC != null && (
                                                <div className={styles.carouselAccent}>
                                                    {tempC.toLocaleString('fr-FR')} °C
                                                </div>
                                            )}
                                            {radiusSol != null && (
                                                <div className={styles.carouselMeta}>{radiusSol.toFixed(2)}× le Soleil</div>
                                            )}
                                            {distLy && (
                                                <div className={styles.carouselMeta}>à {distLy.toLocaleString('fr-FR')} années-lumière</div>
                                            )}
                                        </div>
                                        {isCentered && (
                                            <button
                                                type="button"
                                                className={`${styles.favBtn} ${favorites.includes(sys.id) ? styles.favBtnActive : ''}`}
                                                onClick={e => { e.stopPropagation(); toggleFavorite(sys.id); }}
                                                aria-label={favorites.includes(sys.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                            >
                                                {favorites.includes(sys.id) ? '★' : '☆'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            );
                        }}
                    />
                </>
            )}

            {/* ── Planètes ── */}
            {level === 'planets' && activeSystem && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Planètes de {activeSystem.name}</span>
                        <span className={styles.count}>{sortedPlanets.length}</span>
                        <div className={styles.sortControls}>
                            {[['distance', 'Distance'], ['size', 'Taille'], ['mass', 'Masse']].map(([key, label]) => (
                                <button
                                    key={key}
                                    className={`${styles.sortBtn} ${sort === key ? styles.sortBtnActive : ''}`}
                                    onClick={() => {
                                        if (sort === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                        else { setSort(key); setSortDir('asc'); }
                                    }}
                                    type="button"
                                    aria-label={`Trier par ${label}`}
                                >
                                    {label}{sort === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                    <CarouselRow
                        items={sortedPlanets}
                        getKey={(planet) => planet.name ?? planet.englishName ?? planet.id}
                        activeKey={activePlanetCarouselKey}
                        onFocusItem={focusPlanetOnly}
                        onSelect={goPlanet}
                        getPhysicalDiameterKm={(planet) => (
                            Number.isFinite(planet?.meanRadius) ? planet.meanRadius * 2 : null
                        )}
                        getItemFootprintSize={(planet, renderedSize) => {
                            const ringData = getBodyVisual(planet, 'planet')?.ringData;
                            if (!ringData) return renderedSize;
                            return (renderedSize * ringData.outerScale) + 36;
                        }}
                        focusDiameter={280}
                        edgeGap={72}
                        getRenderedSize={(planet, centeredKey, ctx) => {
                            const relativeScale = getPlanetRelativeScale(planet, centeredKey, sortedPlanets);
                            const distance = ctx?.distanceFromCenter ?? 0;
                            if (distance === 0) return 280;
                            const falloff = distance === 1 ? 1 : distance === 2 ? 0.88 : 0.74;
                            return safeSize(280 * relativeScale * falloff, 280);
                        }}
                        renderItem={(planet, { isCentered, renderedSize }) => {
                            const name = planet.name ?? planet.englishName ?? planet.id;
                            const tempC = planet.avgTemp != null ? `${(planet.avgTemp - 273.15).toFixed(0)} °C` : null;
                            const typeLabel = VISUAL_TYPE_LABELS[planet.visualType] ?? VISUAL_TYPE_LABELS[planet.bodyType] ?? 'Planète';
                            const sizeRatio = planet.size ?? (planet.meanRadius ? planet.meanRadius / 6371 : 0);
                            const massLabel = planet.massEarth > 0 ? `${planet.massEarth.toFixed(2)}× la masse de la Terre` : null;
                            const orbitLabel = (() => {
                                const v = planet.sideralOrbit;
                                if (!v) return null;
                                return v >= 730 ? `${(v / 365.25).toFixed(1)} ans` : `${v.toFixed(0)} j`;
                            })();
                            return (
                                <>
                                    <div className={styles.carouselVisualStage}>
                                        <BodyVisual body={planet} kind="planet" size={renderedSize} />
                                    </div>
                                    <div className={styles.carouselCaption}>
                                        <div className={styles.carouselTitle}>{name}</div>
                                        <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                            <div className={styles.carouselMeta}>{typeLabel}</div>
                                            {sizeRatio > 0 && (
                                                <div className={styles.carouselAccent}>{sizeRatio.toFixed(2)}× Terre</div>
                                            )}
                                            {massLabel && <div className={styles.carouselMeta}>{massLabel}</div>}
                                            {tempC && <div className={styles.carouselMeta}>{tempC}</div>}
                                            {orbitLabel && <div className={styles.carouselMeta}>{orbitLabel}</div>}
                                        </div>
                                        {isCentered && (
                                            <button
                                                type="button"
                                                className={`${styles.favBtn} ${favorites.includes(planet.name ?? planet.id) ? styles.favBtnActive : ''}`}
                                                onClick={e => { e.stopPropagation(); toggleFavorite(planet.name ?? planet.id); }}
                                                aria-label={favorites.includes(planet.name ?? planet.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                            >
                                                {favorites.includes(planet.name ?? planet.id) ? '★' : '☆'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            );
                        }}
                    />
                </>
            )}

            {/* ── Lunes ── */}
            {level === 'moons' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Lunes de {activePlanetName}</span>
                        <span className={styles.count}>{visibleMoonsDetailed.length}</span>
                    </div>
                    {visibleMoonsDetailed.length === 0 ? (
                        <div className={styles.empty}>Aucune lune répertoriée pour cette planète.</div>
                    ) : (
                        <CarouselRow
                            items={visibleMoonsDetailed}
                            getKey={(moon) => moon.id ?? moon.englishName ?? moon.name}
                            onFocusItem={goMoon}
                            onSelect={goMoon}
                            getPhysicalDiameterKm={(moon) => (
                                Number.isFinite(moon?.meanRadius) ? moon.meanRadius * 2 : null
                            )}
                            focusDiameter={250}
                            getRenderedSize={(moon, centeredKey, ctx) => {
                                const relativeScale = getMoonRelativeScale(moon, centeredKey, visibleMoonsDetailed);
                                const distance = ctx?.distanceFromCenter ?? 0;
                                if (distance === 0) return 250;
                                const falloff = distance === 1 ? 1 : distance === 2 ? 0.88 : 0.74;
                                return safeSize(250 * relativeScale * falloff, 250);
                            }}
                            renderItem={(moon, { isCentered, renderedSize }) => {
                                const mName = moon.englishName ?? moon.name ?? moon.id;
                                const sizeRatio = moon.meanRadius ? (moon.meanRadius / 6371).toFixed(3) : null;
                                return (
                                    <>
                                        <div className={styles.carouselVisualStage}>
                                            <BodyVisual body={moon} kind="moon" size={renderedSize} />
                                        </div>
                                        <div className={styles.carouselCaption}>
                                            <div className={styles.carouselTitle}>{mName}</div>
                                            <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                                <div className={styles.carouselMeta}>Lune</div>
                                                {sizeRatio && (
                                                    <div className={styles.carouselAccent}>{sizeRatio}× Terre</div>
                                                )}
                                                {moon.meanRadius && (
                                                    <div className={styles.carouselMeta}>{moon.meanRadius.toLocaleString('fr-FR')} km</div>
                                                )}
                                                {moon.discoveredBy && (
                                                    <div className={styles.carouselMeta}>Déc. {moon.discoveredBy}</div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                );
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
