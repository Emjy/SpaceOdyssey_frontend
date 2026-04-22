'use client';

import { useState, useEffect } from 'react';
import { FALLBACK_PLANETS, fetchFromApi } from '../lib/api';

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
                try {
                    const planetsData = await fetchFromApi('/bodies/planets');
                    if (planetsData.result && Array.isArray(planetsData.planets) && planetsData.planets.length > 0) {
                        setPlanets(planetsData.planets);
                    } else {
                        setPlanets(FALLBACK_PLANETS);
                    }
                } catch (planetsError) {
                    console.error('Erreur lors de la récupération des planètes:', planetsError);
                    setPlanets(FALLBACK_PLANETS);
                }

                try {
                    const asteroidsData = await fetchFromApi('/bodies/asteroids');
                    if (asteroidsData.result && Array.isArray(asteroidsData.asteroids)) {
                        setAsteroids(asteroidsData.asteroids);
                    } else {
                        setAsteroids([]);
                    }
                } catch (asteroidsError) {
                    console.error('Erreur lors de la récupération des astéroïdes:', asteroidsError);
                    setAsteroids([]);
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
