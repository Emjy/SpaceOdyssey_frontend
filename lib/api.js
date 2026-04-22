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
