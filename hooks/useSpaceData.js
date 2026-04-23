'use client';

import { useState, useEffect } from 'react';
import { fetchPlanets } from '../lib/solarApi';

const ASTEROIDS = [
    { id: 'ceres',    englishName: 'Ceres',    bodyType: 'Asteroid', meanRadius: 473,  sideralOrbit: 1680 },
    { id: 'vesta',    englishName: 'Vesta',    bodyType: 'Asteroid', meanRadius: 263,  sideralOrbit: 1325 },
    { id: 'pallas',   englishName: 'Pallas',   bodyType: 'Asteroid', meanRadius: 256,  sideralOrbit: 1686 },
    { id: 'hygie',    englishName: 'Hygiea',   bodyType: 'Asteroid', meanRadius: 215,  sideralOrbit: 2031 },
    { id: 'eugenia',  englishName: 'Eugenia',  bodyType: 'Asteroid', meanRadius: 107,  sideralOrbit: 1565 },
    { id: 'junon',    englishName: 'Juno',     bodyType: 'Asteroid', meanRadius: 117,  sideralOrbit: 1593 },
    { id: 'iris',     englishName: 'Iris',     bodyType: 'Asteroid', meanRadius: 100,  sideralOrbit: 1346 },
    { id: 'hebe',     englishName: 'Hebe',     bodyType: 'Asteroid', meanRadius: 93,   sideralOrbit: 1380 },
    { id: 'eros',     englishName: 'Eros',     bodyType: 'Asteroid', meanRadius: 8,    sideralOrbit: 643  },
    { id: 'mathilde', englishName: 'Mathilde', bodyType: 'Asteroid', meanRadius: 26,   sideralOrbit: 1572 },
    { id: 'kleopatra',englishName: 'Kleopatra',bodyType: 'Asteroid', meanRadius: 67,   sideralOrbit: 1771 },
    { id: 'sylvia',   englishName: 'Sylvia',   bodyType: 'Asteroid', meanRadius: 135,  sideralOrbit: 2375 },
];

export default function useSpaceData() {
    const [planets, setPlanets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlanets()
            .then(setPlanets)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { planets, asteroids: ASTEROIDS, loading, error };
}
