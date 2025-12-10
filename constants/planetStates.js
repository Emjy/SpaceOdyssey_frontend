// Constantes pour la gestion des états planétaires

// État initial par défaut pour tous les corps célestes
export const DEFAULT_PLANET_STATE = {
    milkyWaySize: 0,
    sagittarusA: 0,
    indexSa: 0,
    sunSize: 0,
    indexSun: 0,
    sunOrbit: 0,
    mercuryOrbit: 0,
    mercurySize: 0,
    mercuryIndex: 0,
    venusOrbit: 0,
    venusSize: 0,
    venusIndex: 0,
    earthOrbit: 0,
    earthSize: 0,
    earthIndex: 0,
    marsOrbit: 0,
    marsSize: 0,
    marsIndex: 0,
    jupiterOrbit: 0,
    jupiterSize: 0,
    jupiterIndex: 0,
    saturnOrbit: 0,
    saturnSize: 0,
    saturnIndexIndex: 0,
    uranusOrbit: 0,
    uranusSize: 0,
    uranusIndex: 0,
    neptuneOrbit: 0,
    neptuneSize: 0,
    neptuneIndex: 0,
    plutoOrbit: 0,
    plutoSize: 0,
    plutoIndex: 0,
};

// Fonction helper pour créer un état planétaire personnalisé
export const createPlanetState = (overrides = {}) => ({
    ...DEFAULT_PLANET_STATE,
    ...overrides,
});

// Configurations prédéfinies pour différentes vues
export const PLANET_STATE_CONFIGS = {
    MILKY_WAY: {
        milkyWaySize: 150,
        indexSa: 2,
    },
    SAGITTARIUS_A: {
        sagittarusA: 50,
        indexSa: 3,
    },
    SOLAR_SYSTEM: {
        sunSize: 1,
        indexSun: 2,
        sunOrbit: 15,
    },
};

// Valeurs pour les orbites et espacements
export const ORBIT_VALUES = {
    LARGE: 80,
    MEDIUM: 30,
    SMALL: 4,
};

export const SPACING_VALUES = {
    LARGE: 8,
    MEDIUM: 8,
    SMALL: 1.2,
};
