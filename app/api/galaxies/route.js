import { NextResponse } from 'next/server';
import { KNOWN_GALAXY_FALLBACKS } from '../../../data/galaxies';

export const revalidate = 60 * 15;

const OPENNGC_TAP_URL = 'https://dc.g-vo.org/tap/sync';
const NASA_IMAGES_URL = 'https://images-api.nasa.gov/search';
const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const MAX_GALAXIES = 50;

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

function toGalaxyObject(row) {
    const commonName = pickCommonName(row);
    const messier = row.messier_nr ? `M${row.messier_nr}` : null;
    const ngcName = row.name?.trim() || null;
    const displayName = commonName || messier || ngcName;
    if (!displayName || !ngcName) return null;

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
        majorAxisDeg: parseNumber(row.maj_ax_deg),
        minorAxisDeg: parseNumber(row.min_ax_deg),
        hubbleType: row.hubble_type?.trim() || null,
        messierNr: row.messier_nr ? Number.parseInt(row.messier_nr, 10) : null,
        comname: row.comname?.trim() || null,
        image: null,
        orbitalImage: null,
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

async function fetchWikipediaImage(galaxy) {
    for (const title of buildWikipediaTitles(galaxy)) {
        try {
            const url = `${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(title)}`;
            const res = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });
            if (!res.ok) continue;
            const data = await res.json();
            const source = data?.thumbnail?.source ?? data?.originalimage?.source ?? null;
            if (source) return source;
        } catch {
            continue;
        }
    }
    return null;
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
        orbitalImage: null,
    }));
}

export async function GET() {
    const query = `
        SELECT TOP 250
            name, obj_type, constellation, maj_ax_deg, min_ax_deg, mag_v,
            hubble_type, messier_nr, comname
        FROM openngc.data
        WHERE obj_type='G'
          AND (messier_nr IS NOT NULL OR comname IS NOT NULL)
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
        });

        if (res.ok) {
            const rows = parseTsv(await res.text());
            galaxies = rows
                .map(toGalaxyObject)
                .filter(Boolean)
                .filter((galaxy) => !/androm/i.test(galaxy.name))
                .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
                .slice(0, MAX_GALAXIES);
        }
    } catch {
        galaxies = [];
    }

    if (galaxies.length < 10) {
        galaxies = buildFallbackGalaxies();
    }

    const withImages = await Promise.all(
        galaxies.map(async (galaxy) => {
            const image = await fetchNasaImage(galaxy) ?? await fetchWikipediaImage(galaxy);
            return {
                ...galaxy,
                image,
                orbitalImage: image,
            };
        })
    );

    return NextResponse.json(withImages);
}
