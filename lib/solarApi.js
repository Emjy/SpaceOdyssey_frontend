// Toutes les données passent par les API routes Next.js (proxy serveur → pas de CORS).
// Planètes : 1 seule requête au démarrage, mise en cache 1h.
// Lune      : 1 requête au clic (lazy), mise en cache 1h.

export async function fetchPlanets() {
    const res = await fetch('/api/planets');
    if (!res.ok) throw new Error(`Erreur chargement planètes: ${res.status}`);
    return res.json();
}

export async function fetchBody(id) {
    const res = await fetch(`/api/bodies/${id}`);
    if (!res.ok) throw new Error(`Erreur chargement corps ${id}: ${res.status}`);
    return res.json();
}

// L'API retourne { moon: "Nom affiché", rel: ".../bodies/<id>" }
export function getMoonStubsFromPlanet(planet) {
    return (planet?.moons ?? [])
        .filter(m => !m.moon.startsWith('S/'))
        .map(m => ({
            id: m.rel.split('/').pop(),
            englishName: m.moon,
        }));
}
