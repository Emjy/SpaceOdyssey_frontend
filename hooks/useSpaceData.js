'use client';

import { useState, useEffect } from 'react';
import { fetchPlanets, fetchAsteroids } from '../lib/solarApi';

export default function useSpaceData() {
    const [planets, setPlanets] = useState([]);
    const [asteroids, setAsteroids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fetchPlanets(), fetchAsteroids()])
            .then(([planetData, asteroidData]) => {
                setPlanets(planetData);
                setAsteroids(asteroidData);
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { planets, asteroids, loading, error };
}
