'use client';

import { useState, useEffect } from 'react';
import { fetchPlanets, fetchAsteroids } from '../lib/solarApi';

async function fetchExoplanetSystems() {
    const res = await fetch('/api/exoplanets');
    if (!res.ok) throw new Error(`Erreur exoplanètes: ${res.status}`);
    return res.json();
}

async function fetchGalaxies() {
    const res = await fetch('/api/galaxies');
    if (!res.ok) throw new Error(`Erreur galaxies: ${res.status}`);
    return res.json();
}

export default function useSpaceData() {
    const [planets, setPlanets] = useState([]);
    const [asteroids, setAsteroids] = useState([]);
    const [exoplanetSystems, setExoplanetSystems] = useState([]);
    const [galaxies, setGalaxies] = useState([]);
    const [loadingPlanets, setLoadingPlanets] = useState(true);
    const [loadingExo, setLoadingExo] = useState(true);
    const [loadingGalaxies, setLoadingGalaxies] = useState(true);

    useEffect(() => {
        fetchPlanets()
            .then(setPlanets)
            .catch(console.error)
            .finally(() => setLoadingPlanets(false));

        fetchAsteroids()
            .then(setAsteroids)
            .catch(console.error);

        fetchExoplanetSystems()
            .then((data) => setExoplanetSystems(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoadingExo(false));

        fetchGalaxies()
            .then((data) => setGalaxies(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoadingGalaxies(false));
    }, []);

    const loading = loadingPlanets || loadingExo || loadingGalaxies;

    return { planets, asteroids, exoplanetSystems, galaxies, loading, error: null };
}
