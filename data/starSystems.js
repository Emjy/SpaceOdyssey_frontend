// Données statiques des systèmes stellaires supplémentaires.
// Le système solaire utilise l'API le-systeme-solaire.net ; les autres sont fictifs.

export const KEPLER_SYSTEM = {
    id: 'kepler',
    name: 'Kepler',
    milkyWayKey: 'Kepler',
    starColor: '#ffb870',
    starEmissive: '#ff7722',
    starRadius: 4.2,
    galaxyArmIndex: 2,   // bras spiral n°2 (index dans armDefinitions)
    galaxyOrbitRadius: 52,
    planets: [
        { name: 'kepler-b', r: 10, size: 0.20, color: '#c47a45', emissive: '#5a2a10', speed: 0.14,  tilt:  8, rotDir:  1 },
        { name: 'kepler-c', r: 18, size: 0.50, color: '#7ab0d4', emissive: '#1a3a5a', speed: 0.065, tilt: 15, rotDir:  1 },
        { name: 'kepler-d', r: 28, size: 1.10, color: '#d4a870', emissive: '#5a3a10', speed: 0.022, tilt:  6, rotDir:  1 },
    ],
};

// Tous les systèmes supplémentaires (Solar System est géré séparément via l'API)
export const EXTRA_STAR_SYSTEMS = [KEPLER_SYSTEM];
