const REMOTE_API_BASE_URL = 'https://space-odyssey-backend.vercel.app';
const LOCAL_API_BASE_URL = 'http://localhost:3000';
const REQUEST_TIMEOUT_MS = 4000;

export const FALLBACK_PLANETS = [
    { id: 'mercure', englishName: 'Mercury', sideralOrbit: 88 },
    { id: 'venus', englishName: 'Venus', sideralOrbit: 225 },
    { id: 'terre', englishName: 'Earth', sideralOrbit: 365 },
    { id: 'mars', englishName: 'Mars', sideralOrbit: 687 },
    { id: 'jupiter', englishName: 'Jupiter', sideralOrbit: 4333 },
    { id: 'saturne', englishName: 'Saturn', sideralOrbit: 10759 },
    { id: 'uranus', englishName: 'Uranus', sideralOrbit: 30687 },
    { id: 'neptune', englishName: 'Neptune', sideralOrbit: 60190 },
    { id: 'pluton', englishName: 'Pluto', sideralOrbit: 90560 },
];

export const FALLBACK_ASTEROIDS = [
    { id: 'ceres', englishName: 'Ceres', meanRadius: 473, sideralOrbit: 1680 },
    { id: 'vesta', englishName: 'Vesta', meanRadius: 263, sideralOrbit: 1325 },
    { id: 'pallas', englishName: 'Pallas', meanRadius: 256, sideralOrbit: 1686 },
    { id: 'hygie', englishName: 'Hygiea', meanRadius: 215, sideralOrbit: 2031 },
    { id: 'eugenia', englishName: 'Eugenia', meanRadius: 107, sideralOrbit: 1565 },
    { id: 'junon', englishName: 'Juno', meanRadius: 117, sideralOrbit: 1593 },
    { id: 'iris', englishName: 'Iris', meanRadius: 100, sideralOrbit: 1346 },
    { id: 'hebe', englishName: 'Hebe', meanRadius: 93, sideralOrbit: 1380 },
    { id: 'ida', englishName: 'Ida', meanRadius: 15, sideralOrbit: 1640 },
    { id: 'gaspra', englishName: 'Gaspra', meanRadius: 6, sideralOrbit: 1190 },
    { id: 'eros', englishName: 'Eros', meanRadius: 8, sideralOrbit: 643 },
    { id: 'itokawa', englishName: 'Itokawa', meanRadius: 0.17, sideralOrbit: 556 },
    { id: 'steins', englishName: 'Steins', meanRadius: 2.6, sideralOrbit: 1226 },
    { id: 'lutetia', englishName: 'Lutetia', meanRadius: 50, sideralOrbit: 1424 },
    { id: 'mathilde', englishName: 'Mathilde', meanRadius: 26, sideralOrbit: 1572 },
    { id: 'kleopatra', englishName: 'Kleopatra', meanRadius: 67, sideralOrbit: 1771 },
    { id: 'toutatis', englishName: 'Toutatis', meanRadius: 2.3, sideralOrbit: 1460 },
    { id: 'castalia', englishName: 'Castalia', meanRadius: 0.7, sideralOrbit: 1096 },
    { id: 'cruithne', englishName: 'Cruithne', meanRadius: 2.5, sideralOrbit: 364 },
    { id: 'flore', englishName: 'Flora', meanRadius: 68, sideralOrbit: 1194 },
    { id: 'sylvia', englishName: 'Sylvia', meanRadius: 135, sideralOrbit: 2375 },
    { id: 'astree', englishName: 'Astraea', meanRadius: 60, sideralOrbit: 1511 },
    { id: 'benou', englishName: 'Bennu', meanRadius: 0.26, sideralOrbit: 436 },
    { id: '9metis', englishName: 'Metis', meanRadius: 95, sideralOrbit: 1345 },
    { id: 'pulcova', englishName: 'Pulcova', meanRadius: 68, sideralOrbit: 1658 },
];

export const FALLBACK_MOONS = {
    mercure: [],
    venus: [],
    terre: [
        { id: 'lune', name: 'Lune', englishName: 'Moon', sideralOrbit: 27.3 },
    ],
    mars: [
        { id: 'phobos', name: 'Phobos', englishName: 'Phobos', sideralOrbit: 0.32 },
        { id: 'deimos', name: 'Deimos', englishName: 'Deimos', sideralOrbit: 1.26 },
    ],
    jupiter: [
        { id: 'io', name: 'Io', englishName: 'Io', sideralOrbit: 1.77 },
        { id: 'europe', name: 'Europe', englishName: 'Europa', sideralOrbit: 3.55 },
        { id: 'ganymede', name: 'Ganymede', englishName: 'Ganymede', sideralOrbit: 7.15 },
        { id: 'callisto', name: 'Callisto', englishName: 'Callisto', sideralOrbit: 16.69 },
        { id: 'amalthee', name: 'Amalthee', englishName: 'Amalthea', sideralOrbit: 0.5 },
        { id: 'himalia', name: 'Himalia', englishName: 'Himalia', sideralOrbit: 250.57 },
        { id: 'elara', name: 'Elara', englishName: 'Elara', sideralOrbit: 259.64 },
        { id: 'pasiphae', name: 'Pasiphae', englishName: 'Pasiphae', sideralOrbit: 735.0 },
    ],
    saturne: [
        { id: 'titan', name: 'Titan', englishName: 'Titan', sideralOrbit: 15.95 },
        { id: 'rhea', name: 'Rhea', englishName: 'Rhea', sideralOrbit: 4.52 },
        { id: 'japet', name: 'Japet', englishName: 'Iapetus', sideralOrbit: 79.32 },
        { id: 'dione', name: 'Dione', englishName: 'Dione', sideralOrbit: 2.74 },
        { id: 'tethys', name: 'Tethys', englishName: 'Tethys', sideralOrbit: 1.89 },
        { id: 'encelade', name: 'Encelade', englishName: 'Enceladus', sideralOrbit: 1.37 },
        { id: 'mimas', name: 'Mimas', englishName: 'Mimas', sideralOrbit: 0.94 },
        { id: 'hyperion', name: 'Hyperion', englishName: 'Hyperion', sideralOrbit: 21.28 },
    ],
    uranus: [
        { id: 'titania', name: 'Titania', englishName: 'Titania', sideralOrbit: 8.71 },
        { id: 'oberon', name: 'Oberon', englishName: 'Oberon', sideralOrbit: 13.46 },
        { id: 'umbriel', name: 'Umbriel', englishName: 'Umbriel', sideralOrbit: 4.14 },
        { id: 'ariel', name: 'Ariel', englishName: 'Ariel', sideralOrbit: 2.52 },
        { id: 'miranda', name: 'Miranda', englishName: 'Miranda', sideralOrbit: 1.41 },
        { id: 'puck', name: 'Puck', englishName: 'Puck', sideralOrbit: 0.76 },
        { id: 'sycorax', name: 'Sycorax', englishName: 'Sycorax', sideralOrbit: 1283.0 },
        { id: 'francisco', name: 'Francisco', englishName: 'Francisco', sideralOrbit: 266.0 },
    ],
    neptune: [
        { id: 'triton', name: 'Triton', englishName: 'Triton', sideralOrbit: 5.88 },
        { id: 'nereide', name: 'Nereide', englishName: 'Nereid', sideralOrbit: 360.0 },
        { id: 'protee', name: 'Protee', englishName: 'Proteus', sideralOrbit: 1.12 },
        { id: 'larissa', name: 'Larissa', englishName: 'Larissa', sideralOrbit: 0.56 },
        { id: 'despina', name: 'Despina', englishName: 'Despina', sideralOrbit: 0.33 },
        { id: 'galatee', name: 'Galatee', englishName: 'Galatea', sideralOrbit: 0.43 },
        { id: 'thalassa', name: 'Thalassa', englishName: 'Thalassa', sideralOrbit: 0.31 },
        { id: 'naiade', name: 'Naiade', englishName: 'Naiad', sideralOrbit: 0.29 },
    ],
    pluton: [
        { id: 'charon', name: 'Charon', englishName: 'Charon', sideralOrbit: 6.39 },
        { id: 'nix', name: 'Nix', englishName: 'Nix', sideralOrbit: 24.85 },
        { id: 'hydra', name: 'Hydra', englishName: 'Hydra', sideralOrbit: 38.2 },
        { id: 'styx', name: 'Styx', englishName: 'Styx', sideralOrbit: 20.16 },
        { id: 'kerberos', name: 'Kerberos', englishName: 'Kerberos', sideralOrbit: 32.17 },
    ],
};

const dedupeUrls = (urls) => [...new Set(urls.filter(Boolean))];

export function getApiBaseUrls() {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (typeof window === 'undefined') {
        return dedupeUrls([envUrl, REMOTE_API_BASE_URL]);
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    return dedupeUrls([
        envUrl,
        isLocalhost ? LOCAL_API_BASE_URL : null,
        REMOTE_API_BASE_URL,
    ]);
}

async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} on ${url}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function fetchFromApi(pathname) {
    const baseUrls = getApiBaseUrls();
    const errors = [];

    for (const baseUrl of baseUrls) {
        const url = `${baseUrl}${pathname}`;

        try {
            return await fetchWithTimeout(url);
        } catch (error) {
            errors.push(`${url}: ${error.message}`);
        }
    }

    throw new Error(errors.join(' | '));
}
