const PLANETS = [
    {
        id: 'mercure',
        name: 'Mercure',
        englishName: 'Mercury',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 2439.7,
        gravity: 3.7,
        density: 5.43,
        avgTemp: 440,
        sideralOrbit: 88,
        mass: { massValue: 3.301, massExponent: 23 },
    },
    {
        id: 'venus',
        name: 'Venus',
        englishName: 'Venus',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 6051.8,
        gravity: 8.87,
        density: 5.24,
        avgTemp: 737,
        sideralOrbit: 225,
        mass: { massValue: 4.867, massExponent: 24 },
    },
    {
        id: 'terre',
        name: 'Terre',
        englishName: 'Earth',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 6371,
        gravity: 9.81,
        density: 5.51,
        avgTemp: 288,
        sideralOrbit: 365.25,
        mass: { massValue: 5.972, massExponent: 24 },
    },
    {
        id: 'mars',
        name: 'Mars',
        englishName: 'Mars',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 3389.5,
        gravity: 3.71,
        density: 3.93,
        avgTemp: 210,
        sideralOrbit: 687,
        mass: { massValue: 6.39, massExponent: 23 },
    },
    {
        id: 'jupiter',
        name: 'Jupiter',
        englishName: 'Jupiter',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 69911,
        gravity: 24.79,
        density: 1.33,
        avgTemp: 165,
        sideralOrbit: 4333,
        mass: { massValue: 1.898, massExponent: 27 },
    },
    {
        id: 'saturne',
        name: 'Saturne',
        englishName: 'Saturn',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 58232,
        gravity: 10.44,
        density: 0.69,
        avgTemp: 134,
        sideralOrbit: 10759,
        mass: { massValue: 5.683, massExponent: 26 },
    },
    {
        id: 'uranus',
        name: 'Uranus',
        englishName: 'Uranus',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 25362,
        gravity: 8.69,
        density: 1.27,
        avgTemp: 76,
        sideralOrbit: 30687,
        mass: { massValue: 8.681, massExponent: 25 },
    },
    {
        id: 'neptune',
        name: 'Neptune',
        englishName: 'Neptune',
        bodyType: 'Planet',
        isPlanet: true,
        meanRadius: 24622,
        gravity: 11.15,
        density: 1.64,
        avgTemp: 72,
        sideralOrbit: 60190,
        mass: { massValue: 1.024, massExponent: 26 },
    },
    {
        id: 'pluton',
        name: 'Pluton',
        englishName: 'Pluto',
        bodyType: 'Dwarf Planet',
        isPlanet: false,
        meanRadius: 1188.3,
        gravity: 0.62,
        density: 1.86,
        avgTemp: 44,
        sideralOrbit: 90560,
        mass: { massValue: 1.309, massExponent: 22 },
    },
];

const ASTEROIDS = [
    { id: 'ceres', englishName: 'Ceres', bodyType: 'Asteroid', meanRadius: 473, sideralOrbit: 1680, discoveredBy: 'Giuseppe Piazzi', discoveryDate: '1801' },
    { id: 'vesta', englishName: 'Vesta', bodyType: 'Asteroid', meanRadius: 263, sideralOrbit: 1325, discoveredBy: 'Heinrich Olbers', discoveryDate: '1807' },
    { id: 'pallas', englishName: 'Pallas', bodyType: 'Asteroid', meanRadius: 256, sideralOrbit: 1686, discoveredBy: 'Heinrich Olbers', discoveryDate: '1802' },
    { id: 'hygie', englishName: 'Hygiea', bodyType: 'Asteroid', meanRadius: 215, sideralOrbit: 2031, discoveredBy: 'Annibale de Gasparis', discoveryDate: '1849' },
    { id: 'eugenia', englishName: 'Eugenia', bodyType: 'Asteroid', meanRadius: 107, sideralOrbit: 1565, discoveredBy: 'Hermann Goldschmidt', discoveryDate: '1857' },
    { id: 'junon', englishName: 'Juno', bodyType: 'Asteroid', meanRadius: 117, sideralOrbit: 1593, discoveredBy: 'Karl Harding', discoveryDate: '1804' },
    { id: 'iris', englishName: 'Iris', bodyType: 'Asteroid', meanRadius: 100, sideralOrbit: 1346, discoveredBy: 'John Russell Hind', discoveryDate: '1847' },
    { id: 'hebe', englishName: 'Hebe', bodyType: 'Asteroid', meanRadius: 93, sideralOrbit: 1380, discoveredBy: 'Karl Hencke', discoveryDate: '1847' },
    { id: 'ida', englishName: 'Ida', bodyType: 'Asteroid', meanRadius: 15, sideralOrbit: 1640 },
    { id: 'gaspra', englishName: 'Gaspra', bodyType: 'Asteroid', meanRadius: 6, sideralOrbit: 1190 },
    { id: 'eros', englishName: 'Eros', bodyType: 'Asteroid', meanRadius: 8, sideralOrbit: 643, discoveredBy: 'Carl Gustav Witt', discoveryDate: '1898' },
    { id: 'itokawa', englishName: 'Itokawa', bodyType: 'Asteroid', meanRadius: 0.17, sideralOrbit: 556 },
    { id: 'steins', englishName: 'Steins', bodyType: 'Asteroid', meanRadius: 2.6, sideralOrbit: 1226 },
    { id: 'lutetia', englishName: 'Lutetia', bodyType: 'Asteroid', meanRadius: 50, sideralOrbit: 1424 },
    { id: 'mathilde', englishName: 'Mathilde', bodyType: 'Asteroid', meanRadius: 26, sideralOrbit: 1572 },
    { id: 'kleopatra', englishName: 'Kleopatra', bodyType: 'Asteroid', meanRadius: 67, sideralOrbit: 1771 },
    { id: 'toutatis', englishName: 'Toutatis', bodyType: 'Asteroid', meanRadius: 2.3, sideralOrbit: 1460 },
    { id: 'castalia', englishName: 'Castalia', bodyType: 'Asteroid', meanRadius: 0.7, sideralOrbit: 1096 },
    { id: 'cruithne', englishName: 'Cruithne', bodyType: 'Asteroid', meanRadius: 2.5, sideralOrbit: 364 },
    { id: 'flore', englishName: 'Flora', bodyType: 'Asteroid', meanRadius: 68, sideralOrbit: 1194 },
    { id: 'sylvia', englishName: 'Sylvia', bodyType: 'Asteroid', meanRadius: 135, sideralOrbit: 2375 },
    { id: 'astree', englishName: 'Astraea', bodyType: 'Asteroid', meanRadius: 60, sideralOrbit: 1511 },
    { id: 'benou', englishName: 'Bennu', bodyType: 'Asteroid', meanRadius: 0.26, sideralOrbit: 436 },
    { id: '9metis', englishName: 'Metis', bodyType: 'Asteroid', meanRadius: 95, sideralOrbit: 1345 },
    { id: 'pulcova', englishName: 'Pulcova', bodyType: 'Asteroid', meanRadius: 68, sideralOrbit: 1658 },
];

const MOONS_BY_PLANET = {
    mercure: [],
    venus: [],
    terre: [
        { id: 'lune', name: 'Lune', englishName: 'Moon', bodyType: 'Moon', meanRadius: 1737.4, gravity: 1.62, density: 3.34, sideralOrbit: 27.3 },
    ],
    mars: [
        { id: 'phobos', name: 'Phobos', englishName: 'Phobos', bodyType: 'Moon', meanRadius: 11.27, gravity: 0.0057, density: 1.88, sideralOrbit: 0.32 },
        { id: 'deimos', name: 'Deimos', englishName: 'Deimos', bodyType: 'Moon', meanRadius: 6.2, gravity: 0.003, density: 1.47, sideralOrbit: 1.26 },
    ],
    jupiter: [
        { id: 'io', name: 'Io', englishName: 'Io', bodyType: 'Moon', meanRadius: 1821.6, gravity: 1.8, density: 3.53, sideralOrbit: 1.77 },
        { id: 'europe', name: 'Europe', englishName: 'Europa', bodyType: 'Moon', meanRadius: 1560.8, gravity: 1.31, density: 3.01, sideralOrbit: 3.55 },
        { id: 'ganymede', name: 'Ganymede', englishName: 'Ganymede', bodyType: 'Moon', meanRadius: 2634.1, gravity: 1.43, density: 1.94, sideralOrbit: 7.15 },
        { id: 'callisto', name: 'Callisto', englishName: 'Callisto', bodyType: 'Moon', meanRadius: 2410.3, gravity: 1.24, density: 1.83, sideralOrbit: 16.69 },
        { id: 'amalthee', name: 'Amalthee', englishName: 'Amalthea', bodyType: 'Moon', meanRadius: 83.5, sideralOrbit: 0.5 },
        { id: 'himalia', name: 'Himalia', englishName: 'Himalia', bodyType: 'Moon', meanRadius: 69.8, sideralOrbit: 250.57 },
        { id: 'elara', name: 'Elara', englishName: 'Elara', bodyType: 'Moon', meanRadius: 43, sideralOrbit: 259.64 },
        { id: 'pasiphae', name: 'Pasiphae', englishName: 'Pasiphae', bodyType: 'Moon', meanRadius: 28.9, sideralOrbit: 735 },
    ],
    saturne: [
        { id: 'titan', name: 'Titan', englishName: 'Titan', bodyType: 'Moon', meanRadius: 2574.7, gravity: 1.35, density: 1.88, sideralOrbit: 15.95 },
        { id: 'rhea', name: 'Rhea', englishName: 'Rhea', bodyType: 'Moon', meanRadius: 763.8, sideralOrbit: 4.52 },
        { id: 'japet', name: 'Japet', englishName: 'Iapetus', bodyType: 'Moon', meanRadius: 734.5, sideralOrbit: 79.32 },
        { id: 'dione', name: 'Dione', englishName: 'Dione', bodyType: 'Moon', meanRadius: 561.4, sideralOrbit: 2.74 },
        { id: 'tethys', name: 'Tethys', englishName: 'Tethys', bodyType: 'Moon', meanRadius: 531.1, sideralOrbit: 1.89 },
        { id: 'encelade', name: 'Encelade', englishName: 'Enceladus', bodyType: 'Moon', meanRadius: 252.1, sideralOrbit: 1.37 },
        { id: 'mimas', name: 'Mimas', englishName: 'Mimas', bodyType: 'Moon', meanRadius: 198.2, sideralOrbit: 0.94 },
        { id: 'hyperion', name: 'Hyperion', englishName: 'Hyperion', bodyType: 'Moon', meanRadius: 135, sideralOrbit: 21.28 },
    ],
    uranus: [
        { id: 'titania', name: 'Titania', englishName: 'Titania', bodyType: 'Moon', meanRadius: 788.9, sideralOrbit: 8.71 },
        { id: 'oberon', name: 'Oberon', englishName: 'Oberon', bodyType: 'Moon', meanRadius: 761.4, sideralOrbit: 13.46 },
        { id: 'umbriel', name: 'Umbriel', englishName: 'Umbriel', bodyType: 'Moon', meanRadius: 584.7, sideralOrbit: 4.14 },
        { id: 'ariel', name: 'Ariel', englishName: 'Ariel', bodyType: 'Moon', meanRadius: 578.9, sideralOrbit: 2.52 },
        { id: 'miranda', name: 'Miranda', englishName: 'Miranda', bodyType: 'Moon', meanRadius: 235.8, sideralOrbit: 1.41 },
        { id: 'puck', name: 'Puck', englishName: 'Puck', bodyType: 'Moon', meanRadius: 81, sideralOrbit: 0.76 },
        { id: 'sycorax', name: 'Sycorax', englishName: 'Sycorax', bodyType: 'Moon', meanRadius: 75, sideralOrbit: 1283 },
        { id: 'francisco', name: 'Francisco', englishName: 'Francisco', bodyType: 'Moon', meanRadius: 11, sideralOrbit: 266 },
    ],
    neptune: [
        { id: 'triton', name: 'Triton', englishName: 'Triton', bodyType: 'Moon', meanRadius: 1353.4, gravity: 0.78, density: 2.06, sideralOrbit: 5.88 },
        { id: 'nereide', name: 'Nereide', englishName: 'Nereid', bodyType: 'Moon', meanRadius: 170, sideralOrbit: 360 },
        { id: 'protee', name: 'Protee', englishName: 'Proteus', bodyType: 'Moon', meanRadius: 210, sideralOrbit: 1.12 },
        { id: 'larissa', name: 'Larissa', englishName: 'Larissa', bodyType: 'Moon', meanRadius: 97, sideralOrbit: 0.56 },
        { id: 'despina', name: 'Despina', englishName: 'Despina', bodyType: 'Moon', meanRadius: 74, sideralOrbit: 0.33 },
        { id: 'galatee', name: 'Galatee', englishName: 'Galatea', bodyType: 'Moon', meanRadius: 88, sideralOrbit: 0.43 },
        { id: 'thalassa', name: 'Thalassa', englishName: 'Thalassa', bodyType: 'Moon', meanRadius: 41, sideralOrbit: 0.31 },
        { id: 'naiade', name: 'Naiade', englishName: 'Naiad', bodyType: 'Moon', meanRadius: 33, sideralOrbit: 0.29 },
    ],
    pluton: [
        { id: 'charon', name: 'Charon', englishName: 'Charon', bodyType: 'Moon', meanRadius: 606, gravity: 0.29, density: 1.7, sideralOrbit: 6.39 },
        { id: 'nix', name: 'Nix', englishName: 'Nix', bodyType: 'Moon', meanRadius: 25, sideralOrbit: 24.85 },
        { id: 'hydra', name: 'Hydra', englishName: 'Hydra', bodyType: 'Moon', meanRadius: 30.5, sideralOrbit: 38.2 },
        { id: 'styx', name: 'Styx', englishName: 'Styx', bodyType: 'Moon', meanRadius: 5, sideralOrbit: 20.16 },
        { id: 'kerberos', name: 'Kerberos', englishName: 'Kerberos', bodyType: 'Moon', meanRadius: 9.5, sideralOrbit: 32.17 },
    ],
};

const SPECIAL_OBJECTS = {
    milkyWay: {
        id: 'milkyWay',
        englishName: 'Milky Way',
        bodyType: 'Galaxy',
        numberOfStars: 100000000000,
        numberOfPlanets: 100000000000,
    },
    sagittariusA: {
        id: 'sagittariusA',
        englishName: 'Sagittarius A*',
        bodyType: 'Black Hole',
        mass: { massValue: 4.154, massExponent: 6 },
        discoveredBy: 'National Radio Astronomy Observatory',
        discoveryDate: '1974',
    },
    soleil: {
        id: 'soleil',
        englishName: 'Sun',
        bodyType: 'Star',
        meanRadius: 696340,
        gravity: 274,
        density: 1.41,
        avgTemp: 5778,
        mass: { massValue: 1.989, massExponent: 30 },
    },
};

const PLANETS_WITH_MOONS = PLANETS.map((planet) => ({
    ...planet,
    moons: (MOONS_BY_PLANET[planet.id] || []).map((moon) => ({ rel: `bodies/${moon.id}` })),
}));

const MOON_LIST = Object.values(MOONS_BY_PLANET).flat();

const OBJECTS = [...PLANETS_WITH_MOONS, ...ASTEROIDS, ...MOON_LIST];

const OBJECTS_BY_ID = OBJECTS.reduce((acc, object) => {
    acc[object.id] = object;
    return acc;
}, { ...SPECIAL_OBJECTS });

export const SOLAR_SYSTEM_DATA = {
    planets: PLANETS_WITH_MOONS,
    asteroids: ASTEROIDS,
    moonsByPlanet: MOONS_BY_PLANET,
    objectsById: OBJECTS_BY_ID,
};

export function getPlanets() {
    return SOLAR_SYSTEM_DATA.planets;
}

export function getAsteroids() {
    return SOLAR_SYSTEM_DATA.asteroids;
}

export function getMoonsForPlanet(planetName) {
    return SOLAR_SYSTEM_DATA.moonsByPlanet[planetName] || [];
}

export function getObjectInfo(objectName) {
    return SOLAR_SYSTEM_DATA.objectsById[objectName] || null;
}
