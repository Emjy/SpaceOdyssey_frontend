// Données statiques des systèmes stellaires supplémentaires.
// Le système solaire utilise l'API le-systeme-solaire.net ; les autres sont fictifs.

export const KEPLER_SYSTEM = {
    id: 'kepler',
    name: 'Kepler',
    milkyWayKey: 'Kepler',
    starColor: '#ffb870',
    starEmissive: '#ff7722',
    starRadius: 4.2,
    starInfo: {
        bodyType: 'Star',
        meanRadius: 535000,
        gravity: 244,
        density: 1.11,
        avgTemp: 5777,
        mass: { massValue: 0.97, massExponent: 30 },
    },
    galaxyArmIndex: 2,   // bras spiral n°2 (index dans armDefinitions)
    galaxyOrbitRadius: 52,
    planets: [
        { name: 'kepler-b', r: 10, size: 0.20, color: '#c47a45', emissive: '#5a2a10', speed: 0.14, tilt: 8, rotDir: 1, inclination: 3.2 },
        { name: 'kepler-c', r: 18, size: 0.50, color: '#7ab0d4', emissive: '#1a3a5a', speed: 0.065, tilt: 15, rotDir: 1, inclination: 7.5 },
        { name: 'kepler-d', r: 28, size: 1.10, color: '#d4a870', emissive: '#5a3a10', speed: 0.022, tilt: 6, rotDir: 1, inclination: 1.4, rings: { innerScale: 1.45, outerScale: 2.2, color: '#d8c9a7', opacity: 0.42 } },
        { name: 'kepler-e', r: 38, size: 0.80, color: '#a0d47a', emissive: '#1a5a10', speed: 0.012, tilt: 20, rotDir: -1, inclination: 103 },
    ],
};

export const SIRIUS_SYSTEM = {
    id: 'sirius',
    name: 'Sirius',
    milkyWayKey: 'Sirius',
    starColor: '#b5e2ff',
    starEmissive: '#6ec6ff',
    starRadius: 5.1,
    starInfo: {
        bodyType: 'Star',
        meanRadius: 1189640,
        gravity: 196,
        density: 1.71,
        avgTemp: 9940,
        mass: { massValue: 2.02, massExponent: 30 },
    },
    galaxyArmIndex: 1,
    galaxyOrbitRadius: 47,
    planets: [
        { name: 'sirius-a1', r: 12, size: 0.35, color: '#e0e0e0', emissive: '#888', speed: 0.11, tilt: 5, rotDir: 1, inclination: 1.8 },
        { name: 'sirius-b1', r: 22, size: 0.80, color: '#b0c4de', emissive: '#3a4a5a', speed: 0.045, tilt: 12, rotDir: -1, inclination: 9.5 },
        { name: 'sirius-b2', r: 32, size: 0.60, color: '#d0e4f0', emissive: '#5a7a9a', speed: 0.030, tilt: 20, rotDir: 1, inclination: 14.4 },
        { name: 'sirius-c', r: 42, size: 1.30, color: '#f0e68c', emissive: '#b0a060', speed: 0.015, tilt: 10, rotDir: -1, inclination: 4.8, rings: { innerScale: 1.34, outerScale: 2.05, color: '#d8d0a0', opacity: 0.36 } },
        { name: 'sirius-d', r: 52, size: 0.90, color: '#add8e6', emissive: '#5a9ac0', speed: 0.007, tilt: 3, rotDir: 1, inclination: 2.1 },
        { name: 'sirius-e', r: 62, size: 0.40, color: '#ffe4e1', emissive: '#c06070', speed: 0.003, tilt: 25, rotDir: -1, inclination: 18.2 },
        { name: 'sirius-f', r: 72, size: 0.70, color: '#e6e6fa', emissive: '#b0b0d0', speed: 0.001, tilt: 8, rotDir: 1, inclination: 6.3 },
        { name: 'sirius-g', r: 82, size: 0.50, color: '#c0d6e4', emissive: '#5a6a7a', speed: 0.0005, tilt: 18, rotDir: -1, inclination: 22.4 },
        { name: 'sirius-h', r: 92, size: 1.00, color: '#ffe4b5', emissive: '#bfa76a', speed: 0.0002, tilt: 12, rotDir: 1, inclination: 11.6 },
    ],
};

export const VEGA_SYSTEM = {
    id: 'vega',
    name: 'Vega',
    milkyWayKey: 'Vega',
    starColor: '#b7cfff',
    starEmissive: '#7faaff',
    starRadius: 4.7,
    starInfo: {
        bodyType: 'Star',
        meanRadius: 1643000,
        gravity: 162,
        density: 0.44,
        avgTemp: 9602,
        mass: { massValue: 2.14, massExponent: 30 },
    },
    galaxyArmIndex: 0,
    galaxyOrbitRadius: 60,
    planets: [
        { name: 'vega-i', r: 14, size: 0.28, color: '#e6e6fa', emissive: '#b0b0d0', speed: 0.13, tilt: 7, rotDir: 1, inclination: 5.1 },
        { name: 'vega-ii', r: 24, size: 0.65, color: '#c0d6e4', emissive: '#5a6a7a', speed: 0.055, tilt: 10, rotDir: 1, inclination: 12.8 },
        { name: 'vega-iii', r: 34, size: 1.00, color: '#ffe4b5', emissive: '#bfa76a', speed: 0.018, tilt: 3, rotDir: -1, inclination: 2.4, rings: { innerScale: 1.28, outerScale: 1.88, color: '#ead8b0', opacity: 0.33 } },
        { name: 'vega-iv', r: 44, size: 1.25, color: '#b0e0e6', emissive: '#5ab0b0', speed: 0.009, tilt: 2, rotDir: 1, inclination: 17.4 },
        { name: 'vega-v', r: 54, size: 0.90, color: '#deb887', emissive: '#a67c52', speed: 0.004, tilt: 6, rotDir: -1, inclination: 8.2 },
    ],
};

// Tous les systèmes supplémentaires (Solar System est géré séparément via l'API)
export const EXTRA_STAR_SYSTEMS = [KEPLER_SYSTEM, SIRIUS_SYSTEM, VEGA_SYSTEM];
