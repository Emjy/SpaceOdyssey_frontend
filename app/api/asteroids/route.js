const ASTEROID_IDS = ['ceres', 'vesta', 'pallas', 'hygie', 'eugenia', 'junon', 'iris', 'hebe', 'eros', 'mathilde', 'kleopatra', 'sylvia'];
const BASE = 'https://api.le-systeme-solaire.net/rest/bodies';
const KEY = process.env.SOLAR_API_KEY;

export async function GET() {
    const asteroids = await Promise.all(
        ASTEROID_IDS.map(id =>
            fetch(`${BASE}/${id}`, {
                headers: { Authorization: `Bearer ${KEY}` },
                next: { revalidate: 3600 },
            }).then(r => r.json())
        )
    );

    return Response.json(asteroids, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
}
