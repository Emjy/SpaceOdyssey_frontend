// Constantes pour l'échelle réelle du système solaire
// Distances en millions de km (demi-grand axe de l'orbite)

export const REAL_DISTANCES = {
    mercury: 57.9,      // Mercure
    venus: 108.2,       // Vénus
    earth: 149.6,       // Terre (1 UA)
    mars: 227.9,        // Mars
    jupiter: 778.5,     // Jupiter
    saturn: 1432,       // Saturne
    uranus: 2867,       // Uranus
    neptune: 4515,      // Neptune
    pluto: 5906,        // Pluton
};

// Échelle logarithmique pour affichage
// Formule : log10(distance) * facteur pour avoir des distances visuelles agréables
export const VISUAL_SCALE_FACTOR = 15; // Facteur d'ajustement pour l'affichage

export const calculateVisualDistance = (realDistance) => {
    // Échelle logarithmique pour compresser les grandes distances
    return Math.log10(realDistance) * VISUAL_SCALE_FACTOR;
};

// Distances visuelles pré-calculées (en vh)
export const VISUAL_DISTANCES = {
    mercury: calculateVisualDistance(REAL_DISTANCES.mercury),    // ~26vh
    venus: calculateVisualDistance(REAL_DISTANCES.venus),        // ~30vh
    earth: calculateVisualDistance(REAL_DISTANCES.earth),        // ~33vh
    mars: calculateVisualDistance(REAL_DISTANCES.mars),          // ~35vh
    jupiter: calculateVisualDistance(REAL_DISTANCES.jupiter),    // ~43vh
    saturn: calculateVisualDistance(REAL_DISTANCES.saturn),      // ~47vh
    uranus: calculateVisualDistance(REAL_DISTANCES.uranus),      // ~51vh
    neptune: calculateVisualDistance(REAL_DISTANCES.neptune),    // ~54vh
    pluto: calculateVisualDistance(REAL_DISTANCES.pluto),        // ~56vh
};

// Limites de zoom
export const ZOOM_LIMITS = {
    MIN: 0.3,    // Zoom minimum (vue d'ensemble)
    MAX: 5,      // Zoom maximum (vue rapprochée)
    DEFAULT: 1,  // Zoom par défaut
    STEP: 0.1,   // Pas d'incrémentation du zoom
};

// Configuration de la rotation 3D
export const ROTATION_3D = {
    MIN_ANGLE: -75,  // Angle minimum (vue du dessus = -90°, on limite à -75° pour la lisibilité)
    MAX_ANGLE: 75,   // Angle maximum (vue du dessous = 90°, on limite à 75°)
    DEFAULT_ANGLE: -60, // Angle par défaut (légère inclinaison)
    SENSITIVITY: 0.5, // Sensibilité de la souris (degrés par pixel)
};

// Tailles relatives des planètes (échelle visuelle, pas réelle)
export const PLANET_VISUAL_SIZES = {
    sun: 20,
    mercury: 1.5,
    venus: 2,
    earth: 2,
    mars: 1.5,
    jupiter: 5,
    saturn: 4.5,
    uranus: 3.5,
    neptune: 3.5,
    pluto: 1,
};
