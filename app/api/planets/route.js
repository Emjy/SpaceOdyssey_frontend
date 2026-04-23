const PLANET_IDS = ['mercure', 'venus', 'terre', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'pluton'];
const BASE = 'https://api.le-systeme-solaire.net/rest/bodies';
const KEY = process.env.SOLAR_API_KEY;

export async function GET() {
    const planets = await Promise.all(
        PLANET_IDS.map(id =>
            fetch(`${BASE}/${id}`, {
                headers: { Authorization: `Bearer ${KEY}` },
                next: { revalidate: 3600 },
            }).then(r => r.json())
        )
    );
    return Response.json(planets, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
}
