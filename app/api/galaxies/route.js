import { NextResponse } from 'next/server';
import { KNOWN_GALAXY_FALLBACKS } from '../../../data/galaxies';

export const revalidate = 60 * 15;

const OPENNGC_TAP_URL = 'https://dc.g-vo.org/tap/sync';
const NASA_IMAGES_URL = 'https://images-api.nasa.gov/search';
const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const NED_URL = 'https://ned.ipac.caltech.edu/api/get_summary';
const MAX_GALAXIES = 500;

function parseTsv(text) {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split('\t');

    return lines.slice(1).map((line) => {
        const values = line.split('\t');
        return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    });
}

function parseNumber(value) {
    const num = Number.parseFloat(value);
    return Number.isFinite(num) ? num : null;
}

function pickCommonName(row) {
    const raw = row.comname?.trim();
    if (!raw) return null;
    return raw.split(/[,;/|]/).map((part) => part.trim()).find(Boolean) ?? raw;
}

function computePhysicalSizeKly(majorAxisDeg, distMly) {
    if (!Number.isFinite(majorAxisDeg) || !Number.isFinite(distMly) || distMly <= 0) return null;
    // Loi des petits angles : taille = 2 * sin(θ/2) * d ≈ θ_rad * d
    return majorAxisDeg * (Math.PI / 180) * distMly * 1000;
}

function toGalaxyObject(row) {
    const commonName = pickCommonName(row);
    const messier = row.messier_nr ? `M${row.messier_nr}` : null;
    const ngcName = row.name?.trim() || null;
    const displayName = commonName || messier || ngcName;
    if (!displayName || !ngcName) return null;

    const majorAxisDeg = parseNumber(row.maj_ax_deg);
    const distMly = parseNumber(row.dist);
    const sizeKly = computePhysicalSizeKly(majorAxisDeg, distMly);

    return {
        id: `openngc-${ngcName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        sourceId: ngcName,
        name: displayName,
        englishName: displayName,
        bodyType: 'Galaxy',
        selectionValue: null,
        hasStars: false,
        subtitle: row.hubble_type?.trim() || 'Galaxie',
        accent: messier || ngcName,
        meta: row.constellation ? `Constellation ${row.constellation}` : null,
        magnitudeV: parseNumber(row.mag_v),
        majorAxisDeg,
        minorAxisDeg: parseNumber(row.min_ax_deg),
        distanceMly: distMly,
        sizeKly,
        hubbleType: row.hubble_type?.trim() || null,
        messierNr: row.messier_nr ? Number.parseInt(row.messier_nr, 10) : null,
        comname: row.comname?.trim() || null,
        starCount: null,
        image: null,
    };
}

function getPopularityScore(galaxy) {
    let score = 0;
    if (galaxy.messierNr) score += 1000 - galaxy.messierNr;
    if (galaxy.comname) score += 350;
    if (galaxy.magnitudeV != null) score += Math.max(0, 120 - galaxy.magnitudeV * 10);
    if (galaxy.majorAxisDeg != null) score += Math.min(200, galaxy.majorAxisDeg * 120);
    return score;
}

function pickNasaQuery(galaxy) {
    if (galaxy.comname) return `${galaxy.comname} galaxy`;
    if (galaxy.messierNr) return `Messier ${galaxy.messierNr} galaxy`;
    return `${galaxy.sourceId} galaxy`;
}

function buildNasaQueries(galaxy) {
    const candidates = [
        galaxy.sourceId ? `${galaxy.sourceId} galaxy` : null,
        galaxy.sourceId || null,
        galaxy.messierNr ? `M${galaxy.messierNr} galaxy` : null,
        galaxy.messierNr ? `Messier ${galaxy.messierNr}` : null,
        pickNasaQuery(galaxy),
        galaxy.comname ? `${galaxy.comname}` : null,
        galaxy.name ? `${galaxy.name} galaxy` : null,
        galaxy.name || null,
    ].filter(Boolean);

    return [...new Set(candidates)];
}

function scoreNasaItem(item, galaxy) {
    const title = String(item?.data?.[0]?.title ?? '').toLowerCase();
    const description = String(item?.data?.[0]?.description ?? '').toLowerCase();
    const haystack = `${title} ${description}`;
    const normalizedSourceId = String(galaxy.sourceId ?? '').toLowerCase();
    const normalizedName = String(galaxy.name ?? '').toLowerCase();
    const normalizedComname = String(galaxy.comname ?? '').toLowerCase();
    let score = 0;

    if (normalizedSourceId && haystack.includes(normalizedSourceId)) score += 8;
    if (normalizedComname && haystack.includes(normalizedComname)) score += 6;
    if (normalizedName && haystack.includes(normalizedName)) score += 4;
    if (haystack.includes('galaxy')) score += 2;
    if (haystack.includes('hubble')) score += 1;

    return score;
}

function hasStrongGalaxyMatch(item, galaxy) {
    return scoreNasaItem(item, galaxy) >= 6;
}

async function fetchNasaImage(galaxy) {
    for (const query of buildNasaQueries(galaxy)) {
        try {
            const url = `${NASA_IMAGES_URL}?q=${encodeURIComponent(query)}&media_type=image`;
            const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
            if (!res.ok) continue;

            const data = await res.json();
            const items = data?.collection?.items ?? [];
            if (!items.length) continue;

            const sorted = [...items].sort((a, b) => scoreNasaItem(b, galaxy) - scoreNasaItem(a, galaxy));
            const picked = sorted.find((item) => (
                hasStrongGalaxyMatch(item, galaxy) && Array.isArray(item?.links) && item.links.length > 0
            )) ?? null;
            if (!picked) continue;
            const thumb = picked?.links?.find((link) => link.render === 'image')?.href ?? picked?.links?.[0]?.href ?? null;
            if (thumb) return thumb;
        } catch {
            continue;
        }
    }

    return null;
}

function buildWikipediaTitles(galaxy) {
    const titles = [];

    if (galaxy.messierNr) {
        titles.push(`Messier ${galaxy.messierNr}`);
    }
    if (galaxy.sourceId) {
        titles.push(galaxy.sourceId);
    }
    if (galaxy.comname) {
        titles.push(galaxy.comname);
    }
    if (galaxy.name) {
        titles.push(galaxy.name);
    }

    return [...new Set(titles.filter(Boolean))];
}

function extractStarCount(summary) {
    if (!summary) return null;
    const m = summary.match(/(\d[\d,.]*)[\s ]*(trillion|billion|million)\s*stars?/i);
    if (!m) return null;
    const n = parseFloat(m[1].replace(/,/g, ''));
    const mult = /trillion/i.test(m[2]) ? 1e12 : /billion/i.test(m[2]) ? 1e9 : 1e6;
    return Math.round(n * mult);
}

async function fetchWikipediaData(galaxy) {
    for (const title of buildWikipediaTitles(galaxy)) {
        try {
            const url = `${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(title)}`;
            const res = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });
            if (!res.ok) continue;
            const data = await res.json();
            const originalImage = data?.originalimage?.source ?? null;
            const thumbnail = data?.thumbnail?.source ?? null;
            const starCount = extractStarCount(data?.extract ?? data?.description);
            if (originalImage || thumbnail || starCount) return { originalImage, thumbnail, starCount };
        } catch {
            continue;
        }
    }
    return { originalImage: null, thumbnail: null, starCount: null };
}

async function fetchNEDData(galaxy) {
    const names = [
        galaxy.messierNr ? `M${galaxy.messierNr}` : null,
        galaxy.sourceId ?? null,
        galaxy.comname ?? null,
    ].filter(Boolean);

    for (const name of names) {
        try {
            const url = `${NED_URL}?name=${encodeURIComponent(name)}`;
            const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });
            if (!res.ok) continue;
            const data = await res.json();
            const result = Array.isArray(data?.result) ? data.result[0] : data?.result ?? data;
            if (!result) continue;

            // Distance en Mpc → Mly (1 Mpc = 3.26156 Mly)
            const distMpc = result.distance_metric ?? result.distance ?? null;
            const distanceMly = distMpc != null ? distMpc * 3.26156 : null;

            // Masse stellaire en masses solaires
            const massSolarMasses = result.stellar_mass ?? result.mass ?? null;

            if (distanceMly != null || massSolarMasses != null) {
                return { distanceMly, massSolarMasses };
            }
        } catch {
            continue;
        }
    }
    return { distanceMly: null, massSolarMasses: null };
}

function buildFallbackGalaxies() {
    return KNOWN_GALAXY_FALLBACKS.slice(0, MAX_GALAXIES).map((galaxy) => ({
        id: `openngc-${galaxy.sourceId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        sourceId: galaxy.sourceId,
        name: galaxy.name,
        englishName: galaxy.name,
        bodyType: 'Galaxy',
        selectionValue: null,
        hasStars: false,
        subtitle: galaxy.subtitle,
        accent: galaxy.sourceId,
        meta: galaxy.meta,
        magnitudeV: null,
        majorAxisDeg: null,
        minorAxisDeg: null,
        hubbleType: null,
        messierNr: galaxy.sourceId.startsWith('M') ? Number.parseInt(galaxy.sourceId.slice(1), 10) : null,
        comname: galaxy.name,
        image: null,
    }));
}

export async function GET() {
    const query = `
        SELECT TOP 500
            name, obj_type, constellation, maj_ax_deg, min_ax_deg, mag_v,
            hubble_type, messier_nr, comname, dist
        FROM openngc.data
        WHERE obj_type='G'
    `.replace(/\s+/g, ' ').trim();

    const body = new URLSearchParams({
        REQUEST: 'doQuery',
        LANG: 'ADQL',
        FORMAT: 'tsv',
        QUERY: query,
    });

    let galaxies = [];

    try {
        const res = await fetch(OPENNGC_TAP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            next: { revalidate: 60 * 60 * 24 },
            signal: AbortSignal.timeout(12000),
        });

        if (res.ok) {
            const rows = parseTsv(await res.text());
            galaxies = rows
                .map(toGalaxyObject)
                .filter(Boolean)
                .filter((galaxy) => !/androm/i.test(galaxy.name))
                .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
                .slice(0, MAX_GALAXIES);
            console.log(`[galaxies] OpenNGC: ${galaxies.length} galaxies chargées`);
        } else {
            console.warn(`[galaxies] OpenNGC HTTP ${res.status}`);
        }
    } catch (err) {
        console.warn(`[galaxies] OpenNGC fetch échoué:`, err?.message ?? err);
        galaxies = [];
    }

    if (galaxies.length < 10) {
        galaxies = buildFallbackGalaxies();
    }

    // Enrichissement (image + données externes) limité aux TOP_ENRICHED les plus populaires
    // pour éviter le timeout de 500 × 3 fetches simultanés
    const TOP_ENRICHED = 120;
    const withImages = await Promise.all(
        galaxies.map(async (galaxy, i) => {
            if (i >= TOP_ENRICHED) return galaxy;
            const [wikiData, nasaImage, nedData] = await Promise.all([
                fetchWikipediaData(galaxy),
                fetchNasaImage(galaxy),
                fetchNEDData(galaxy),
            ]);
            const image = wikiData.originalImage ?? nasaImage ?? wikiData.thumbnail ?? null;
            const distanceMly = nedData.distanceMly ?? galaxy.distanceMly ?? null;
            const sizeKly = computePhysicalSizeKly(galaxy.majorAxisDeg, distanceMly);
            return {
                ...galaxy,
                image,
                distanceMly,
                sizeKly,
                starCount: wikiData.starCount ?? galaxy.starCount ?? null,
                massSolarMasses: nedData.massSolarMasses ?? null,
            };
        })
    );

    return NextResponse.json(withImages);
}
