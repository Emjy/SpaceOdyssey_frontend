'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://space-odyssey-backend.vercel.app';

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
                // Récupération des planètes
                const planetsResponse = await fetch(`${API_BASE_URL}/bodies/planets`);
                const planetsData = await planetsResponse.json();
                if (planetsData.result) {
                    setPlanets(planetsData.planets);
                }

                // Récupération des astéroïdes
                const asteroidsResponse = await fetch(`${API_BASE_URL}/bodies/asteroids`);
                const asteroidsData = await asteroidsResponse.json();
                if (asteroidsData.result) {
                    setAsteroids(asteroidsData.asteroids);
                }
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
