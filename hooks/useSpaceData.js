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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fetchPlanets(), fetchAsteroids(), fetchExoplanetSystems(), fetchGalaxies()])
            .then(([planetData, asteroidData, exoData, galaxyData]) => {
                setPlanets(planetData);
                setAsteroids(asteroidData);
                setExoplanetSystems(Array.isArray(exoData) ? exoData : []);
                setGalaxies(Array.isArray(galaxyData) ? galaxyData : []);
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { planets, asteroids, exoplanetSystems, galaxies, loading, error };
}
