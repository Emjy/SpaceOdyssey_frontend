import { parseExoplanetSystems } from '../../../lib/exoplanetUtils';

const NASA_TAP = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

// 5000 lignes triées par hostname → ~300-400 systèmes multi-planètes
const SQL = `select top 5000
pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,pl_orbsmax,pl_eqt,
st_teff,st_rad,st_mass,st_lum,st_spectype,sy_dist,st_age,st_rotp
from pscomppars
where pl_rade is not null and st_teff is not null and pl_orbsmax is not null
order by hostname asc`;

// Cache mémoire : évite de re-fetcher la NASA à chaque requête en dev
let memCache = null;
let memCacheAt = 0;
const MEM_TTL = 24 * 60 * 60 * 1000; // 24h

export async function GET() {
    // Retour du cache mémoire si frais
    if (memCache && Date.now() - memCacheAt < MEM_TTL) {
        return Response.json(memCache, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
        });
    }

    try {
        const url = `${NASA_TAP}?query=${encodeURIComponent(SQL)}&format=json`;
        const res = await fetch(url, {
            cache: 'no-store',
            headers: { 'Accept': 'application/json' },
        });

        if (!res.ok) throw new Error(`NASA TAP ${res.status}`);

        const raw = await res.json();
        const rows = Array.isArray(raw) ? raw : (raw.data ?? raw.rows ?? []);
        const systems = parseExoplanetSystems(rows);

        // Mise en cache mémoire
        memCache = systems;
        memCacheAt = Date.now();

        return Response.json(systems, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
        });
    } catch (err) {
        console.error('Exoplanet API error:', err.message);
        // Retourne le cache périmé plutôt que vide si disponible
        if (memCache) return Response.json(memCache, { status: 200 });
        return Response.json([], { status: 200 });
    }
}
