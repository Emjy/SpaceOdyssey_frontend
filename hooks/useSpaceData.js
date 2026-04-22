'use client';

import { useState, useEffect } from 'react';
import { getAsteroids, getPlanets } from '../data/celestialData';

/**
 * Hook personnalisé pour récupérer les données des planètes et astéroïdes
 * @returns {Object} { planets, asteroids, loading, error }
 */
export default function useSpaceData() {
    const [planets, setPlanets] = useState([]);
    const [asteroids, setAsteroids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                setPlanets(getPlanets());
                setAsteroids(getAsteroids());
            } catch (err) {
                console.error('Erreur lors de la récupération des données:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { planets, asteroids, loading, error };
}
