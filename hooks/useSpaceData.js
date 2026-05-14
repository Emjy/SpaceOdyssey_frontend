'use client';

import { useState, useEffect } from 'react';
import { fetchPlanets, fetchAsteroids } from '../lib/solarApi';

async function fetchExoplanetSystems() {
    const res = await fetch('/api/exoplanets');
    if (!res.ok) throw new Error(`Erreur exoplanètes: ${res.status}`);
    return res.json();
}

export default function useSpaceData() {
    const [planets, setPlanets] = useState([]);
    const [asteroids, setAsteroids] = useState([]);
    const [exoplanetSystems, setExoplanetSystems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fetchPlanets(), fetchAsteroids(), fetchExoplanetSystems()])
            .then(([planetData, asteroidData, exoData]) => {
                setPlanets(planetData);
                setAsteroids(asteroidData);
                setExoplanetSystems(Array.isArray(exoData) ? exoData : []);
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { planets, asteroids, exoplanetSystems, loading, error };
}
