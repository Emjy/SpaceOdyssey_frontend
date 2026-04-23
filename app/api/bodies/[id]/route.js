const BASE = 'https://api.le-systeme-solaire.net/rest/bodies';
const KEY = process.env.SOLAR_API_KEY;

export async function GET(_req, { params }) {
    const { id } = await params;
    const res = await fetch(`${BASE}/${id}`, {
        headers: { Authorization: `Bearer ${KEY}` },
        next: { revalidate: 3600 },
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
}
