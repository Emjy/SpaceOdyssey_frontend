/**
 * Configurations de vue pour différents états de focus dans l'application
 */

// Configuration vide (tout masqué)
const EMPTY_STATE = {
    milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
    sunSize: 0, indexSun: 0, sunOrbit: 0,
    mercuryOrbit: 0, mercurySize: 0, mercuryIndex: 0,
    venusOrbit: 0, venusSize: 0, venusIndex: 0,
    earthOrbit: 0, earthSize: 0, earthIndex: 0,
    marsOrbit: 0, marsSize: 0, marsIndex: 0,
    jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: 0,
    saturnOrbit: 0, saturnSize: 0, saturnIndexIndex: 0,
    uranusOrbit: 0, uranusSize: 0, uranusIndex: 0,
    neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 0,
    plutoOrbit: 0, plutoSize: 0, plutoIndex: 0,
};

// Vue Milky Way
export const MILKY_WAY_VIEW = {
    milkyWaySize: 80, sagittarusA: 16, indexSa: 10,
    sunSize: 1.6, indexSun: 10, sunOrbit: 21,
    ...EMPTY_STATE,
    milkyWaySize: 80, sagittarusA: 16, indexSa: 10,
    sunSize: 1.6, indexSun: 10, sunOrbit: 21,
};

// Vue Sagittarius A
export const SAGITTARIUS_VIEW = {
    ...EMPTY_STATE,
    sagittarusA: 800,
    indexSa: 10,
};

// Vue Solar System
export const SOLAR_SYSTEM_VIEW = {
    milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
    sunSize: 10, indexSun: 10, sunOrbit: 0,
    mercuryOrbit: 16, mercurySize: 1.5, mercuryIndex: 9,
    venusOrbit: 24, venusSize: 1.5, venusIndex: 8,
    earthOrbit: 32, earthSize: 2, earthIndex: 7,
    marsOrbit: 40, marsSize: 2, marsIndex: 6,
    jupiterOrbit: 56, jupiterSize: 4, jupiterIndex: 5,
    saturnOrbit: 68, saturnSize: 4, saturnIndex: 4,
    uranusOrbit: 80, uranusSize: 4, uranusIndex: 3,
    neptuneOrbit: 92, neptuneSize: 4, neptuneIndex: 2,
    plutoOrbit: 104, plutoSize: 1.5, plutoIndex: 1,
};

// Vue ceinture d'astéroïdes
export const ASTEROID_BELT_VIEW = {
    milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
    sunSize: 2, indexSun: 100, sunOrbit: 0,
    mercuryOrbit: 5, mercurySize: 1, mercuryIndex: 0,
    venusOrbit: 10, venusSize: 1, venusIndex: 0,
    earthOrbit: 15, earthSize: 1, earthIndex: 0,
    marsOrbit: 20, marsSize: 1, marsIndex: 0,
    jupiterOrbit: 90, jupiterSize: 10, jupiterIndex: 0,
    saturnOrbit: 0, saturnSize: 0, saturnIndexIndex: 0,
    uranusOrbit: 0, uranusSize: 0, uranusIndex: 0,
    neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 0,
    plutoOrbit: 0, plutoSize: 0, plutoIndex: 0,
};

/**
 * Génère une configuration de vue pour une planète spécifique
 * @param {string} planetName - Nom de la planète
 * @param {boolean} zoomed - Si true, zoom proche sur la planète
 * @returns {Object} Configuration de vue
 */
export const getPlanetView = (planetName, zoomed = false) => {
    const size = zoomed ? 20 : 2;
    const orbitSize = zoomed ? 1 : 60;
    const sunSize = zoomed ? 0 : 25;
    const sunIndex = zoomed ? 0 : 11;

    // Pour les géantes gazeuses
    const isGiant = ['jupiter', 'saturne', 'uranus', 'neptune', 'pluton'].includes(planetName);
    const finalOrbit = isGiant && !zoomed ? 70 : orbitSize;
    const finalSize = isGiant && !zoomed ? 4 : size;

    return {
        milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
        sunSize, indexSun: sunIndex, sunOrbit: 0,
        mercuryOrbit: planetName === 'mercure' ? finalOrbit : 0,
        mercurySize: planetName === 'mercure' ? finalSize : 0,
        mercuryIndex: planetName === 'mercure' ? 10 : 0,
        venusOrbit: planetName === 'venus' ? finalOrbit : 0,
        venusSize: planetName === 'venus' ? finalSize : 0,
        venusIndex: planetName === 'venus' ? 10 : 0,
        earthOrbit: planetName === 'terre' ? finalOrbit : 0,
        earthSize: planetName === 'terre' ? finalSize : 0,
        earthIndex: planetName === 'terre' ? 10 : 0,
        marsOrbit: planetName === 'mars' ? finalOrbit : 0,
        marsSize: planetName === 'mars' ? finalSize : 0,
        marsIndex: planetName === 'mars' ? 10 : 0,
        jupiterOrbit: planetName === 'jupiter' ? finalOrbit : 0,
        jupiterSize: planetName === 'jupiter' ? finalSize : 0,
        jupiterIndex: planetName === 'jupiter' ? 10 : 0,
        saturnOrbit: planetName === 'saturne' ? finalOrbit : 0,
        saturnSize: planetName === 'saturne' ? finalSize : 0,
        saturnIndex: planetName === 'saturne' ? 10 : 0,
        uranusOrbit: planetName === 'uranus' ? finalOrbit : 0,
        uranusSize: planetName === 'uranus' ? finalSize : 0,
        uranusIndex: planetName === 'uranus' ? 10 : 0,
        neptuneOrbit: planetName === 'neptune' ? finalOrbit : 0,
        neptuneSize: planetName === 'neptune' ? finalSize : 0,
        neptuneIndex: planetName === 'neptune' ? 10 : 0,
        plutoOrbit: planetName === 'pluton' ? finalOrbit : 0,
        plutoSize: planetName === 'pluton' ? finalSize : 0,
        plutoIndex: planetName === 'pluton' ? 10 : 0,
    };
};

/**
 * Génère une configuration de vue pour une lune spécifique
 * @param {string} planetName - Nom de la planète parent
 * @param {boolean} focusedOnMoon - Si true, zoom sur la lune
 * @returns {Object} Configuration de vue
 */
export const getMoonView = (planetName, focusedOnMoon = false) => {
    if (focusedOnMoon) {
        return {
            milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
            sunSize: 0, indexSun: 0, sunOrbit: 0,
            mercuryOrbit: 0, mercurySize: 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
            venusOrbit: 0, venusSize: 0, venusIndex: planetName === 'venus' ? 10 : 0,
            earthOrbit: 1, earthSize: 0, earthIndex: planetName === 'terre' ? 10 : 0,
            marsOrbit: 0, marsSize: 0, marsIndex: planetName === 'mars' ? 10 : 0,
            jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
            saturnOrbit: 0, saturnSize: 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
            uranusOrbit: 0, uranusSize: 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
            neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: planetName === 'neptune' ? 10 : 0,
            plutoOrbit: 0, plutoSize: 0, plutoIndex: planetName === 'pluton' ? 10 : 0,
        };
    }

    return {
        milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
        sunSize: 0, indexSun: 0, sunOrbit: 0,
        mercuryOrbit: planetName === 'mercure' ? 1 : 0,
        mercurySize: planetName === 'mercure' ? 40 : 0,
        mercuryIndex: planetName === 'mercure' ? 10 : 0,
        venusOrbit: planetName === 'venus' ? 1 : 0,
        venusSize: planetName === 'venus' ? 40 : 0,
        venusIndex: planetName === 'venus' ? 10 : 0,
        earthOrbit: planetName === 'terre' ? 1 : 0,
        earthSize: planetName === 'terre' ? 40 : 0,
        earthIndex: planetName === 'terre' ? 10 : 0,
        marsOrbit: planetName === 'mars' ? 1 : 0,
        marsSize: planetName === 'mars' ? 40 : 0,
        marsIndex: planetName === 'mars' ? 10 : 0,
        jupiterOrbit: planetName === 'jupiter' ? 1 : 0,
        jupiterSize: planetName === 'jupiter' ? 40 : 0,
        jupiterIndex: planetName === 'jupiter' ? 10 : 0,
        saturnOrbit: planetName === 'saturne' ? 1 : 0,
        saturnSize: planetName === 'saturne' ? 40 : 0,
        saturnIndex: planetName === 'saturne' ? 10 : 0,
        uranusOrbit: planetName === 'uranus' ? 1 : 0,
        uranusSize: planetName === 'uranus' ? 40 : 0,
        uranusIndex: planetName === 'uranus' ? 10 : 0,
        neptuneOrbit: planetName === 'neptune' ? 1 : 0,
        neptuneSize: planetName === 'neptune' ? 40 : 0,
        neptuneIndex: planetName === 'neptune' ? 10 : 0,
        plutoOrbit: planetName === 'pluton' ? 1 : 0,
        plutoSize: planetName === 'pluton' ? 40 : 0,
        plutoIndex: planetName === 'pluton' ? 10 : 0,
    };
};
