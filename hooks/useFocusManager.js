'use client';

import { useState, useCallback, useMemo } from 'react';
import { fetchBody, getMoonStubsFromPlanet } from '../lib/solarApi';
import { EXTRA_STAR_SYSTEMS } from '../data/starSystems';

const SPECIAL_OBJECTS = {
    milkyWay: {
        id: 'milkyWay',
        englishName: 'Milky Way',
        bodyType: 'Galaxy',
        numberOfStars: 100000000000,
        numberOfPlanets: 100000000000,
    },
    sagittariusA: {
        id: 'sagittariusA',
        englishName: 'Sagittarius A*',
        bodyType: 'Black Hole',
        mass: { massValue: 4.154, massExponent: 6 },
        discoveredBy: 'National Radio Astronomy Observatory',
        discoveryDate: '1974',
    },
    soleil: {
        id: 'soleil',
        englishName: 'Sun',
        bodyType: 'Star',
        meanRadius: 696340,
        gravity: 274,
        density: 1.41,
        avgTemp: 5778,
        mass: { massValue: 1.989, massExponent: 30 },
    },
};

export default function useFocusManager(planets = [], asteroids = [], exoplanetSystems = []) {
    // Combine systèmes statiques + exoplanètes dynamiques
    const allExtraSystems = useMemo(
        () => [...EXTRA_STAR_SYSTEMS, ...exoplanetSystems],
        [exoplanetSystems]
    );

    const starSystemMilkyWayKey = useMemo(() => ({
        solar: 'Solar System',
        ...Object.fromEntries(allExtraSystems.map((s) => [s.id, s.milkyWayKey])),
    }), [allExtraSystems]);

    const extraStarObjects = useMemo(() => Object.fromEntries(
        allExtraSystems.map((s) => [
            s.id,
            { id: s.id, englishName: s.name, ...(s.starInfo ?? { bodyType: 'Star' }) },
        ])
    ), [allExtraSystems]);

    const getPlanetSystemId = useCallback((planetName, preferredSystemId = null) => {
        if (preferredSystemId && starSystemMilkyWayKey[preferredSystemId]) {
            return preferredSystemId;
        }
        if (planets.some((planet) => planet.id === planetName)) {
            return 'solar';
        }
        const extraSystem = allExtraSystems.find((system) =>
            system.planets.some((planet) => planet.name === planetName)
        );
        return extraSystem?.id ?? 'solar';
    }, [planets, allExtraSystems, starSystemMilkyWayKey]);

    const [focusStarNonce, setFocusStarNonce] = useState(0);
    const [focusOnPlanet, setFocusOnPlanet] = useState(false);
    const [focusOnMoon, setFocusOnMoon] = useState(true);
    const [focusOnAsteroid, setFocusOnAsteroid] = useState(false);
    const [focusOneMoon, setFocusOneMoon] = useState(false);
    const [focusSA, setFocusSA] = useState(true);
    const [focusSolarSystem, setFocusSolarSystem] = useState(true);

    const [selectedMilkyWay, setSelectedMilkyWay] = useState(null);
    const [selectedSolarSystem, setSelectedSolarSystem] = useState(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [selectedAsteroid, setSelectedAsteroid] = useState(null);
    const [selectedMoon, setSelectedMoon] = useState(null);

    const [infos, setInfos] = useState(false);
    const [moons, setMoons] = useState([]);
    const [nbMoons, setNbMoons] = useState(4);

    const focusMilkyWay = useCallback(() => {
        setInfos(SPECIAL_OBJECTS.milkyWay);
        setSelectedMoon(null);
        setFocusOnPlanet(false);
        setFocusOnAsteroid(false);
        setSelectedMilkyWay(null);
        setFocusOneMoon(false);
        setSelectedPlanet(null);
        setSelectedAsteroid(null);
        setMoons([]);
    }, []);

    const focusSagittarusA = useCallback(() => {
        setSelectedPlanet(null);
        setSelectedAsteroid(null);
        setSelectedMoon(null);
        setFocusOnPlanet(false);
        setFocusOnAsteroid(false);
        setFocusOneMoon(false);
        setInfos(SPECIAL_OBJECTS.sagittariusA);
    }, []);

    const focusOnSolarSystem = useCallback(() => {
        setSelectedSolarSystem('Planets');
        setSelectedPlanet(null);
        setSelectedAsteroid(null);
        setSelectedMilkyWay('Solar System');
        setInfos(SPECIAL_OBJECTS.soleil);
        setFocusOnPlanet(false);
        setFocusOnAsteroid(false);
        setFocusOneMoon(false);
        setMoons([]);
        setNbMoons(4);
        setSelectedMoon(null);
    }, []);

    const focusPlanet = useCallback(async (planetName, preferredSystemId = null) => {
        const systemId = getPlanetSystemId(planetName, preferredSystemId);
        const milkyWayKey = starSystemMilkyWayKey[systemId] ?? 'Solar System';
        const isSolarSystem = systemId === 'solar';
        const isAlreadySelected = selectedPlanet === planetName;
        const isZoomedIn = isAlreadySelected && focusOnPlanet;

        setSelectedPlanet(planetName);
        setSelectedAsteroid(null);
        setSelectedMoon(null);
        setFocusOneMoon(false);
        setSelectedMilkyWay(milkyWayKey);
        setSelectedSolarSystem('Planets');
        setFocusOnAsteroid(false);

        const planetData = isSolarSystem
            ? planets.find((planet) => planet.id === planetName)
            : allExtraSystems
                .find((system) => system.id === systemId)
                ?.planets.find((planet) => planet.name === planetName);
        if (planetData) setInfos(planetData);

        if (isZoomedIn) {
            setFocusOnPlanet(false);
            setNbMoons(isSolarSystem ? 4 : 0);
        } else {
            setFocusOnPlanet(true);
            setNbMoons(isSolarSystem ? 8 : 0);
            setMoons(isSolarSystem && planetData ? getMoonStubsFromPlanet(planetData) : []);
        }
    }, [focusOnPlanet, getPlanetSystemId, planets, selectedPlanet, allExtraSystems, starSystemMilkyWayKey]);

    const focusAsteroid = useCallback(async (asteroidName) => {
        setNbMoons(0);
        setSelectedPlanet(null);
        setSelectedMoon(null);
        setFocusOnPlanet(false);
        setFocusOneMoon(false);
        setMoons([]);
        setSelectedMilkyWay('Solar System');
        setSelectedSolarSystem('Asteroid Belt');
        setSelectedAsteroid(asteroidName);

        if (!asteroidName || (focusOnAsteroid && selectedAsteroid === asteroidName)) {
            setFocusOnAsteroid(false);
            setSelectedAsteroid('');
            setInfos(SPECIAL_OBJECTS.soleil);
        } else {
            setFocusOnAsteroid(true);
            try {
                const asteroidData = asteroids.find((a) => a.id === asteroidName);
                if (asteroidData) {
                    setInfos(asteroidData);
                } else {
                    const body = await fetchBody(asteroidName);
                    setInfos(body);
                }
            } catch {
                setInfos({ id: asteroidName, englishName: asteroidName, bodyType: 'Asteroid' });
            }
        }
    }, [focusOnAsteroid, selectedAsteroid, asteroids]);

    const focusStarSystem = useCallback((systemId) => {
        const milkyWayKey = starSystemMilkyWayKey[systemId];
        if (!milkyWayKey) return;

        setFocusStarNonce(n => n + 1);
        setSelectedSolarSystem('Planets');
        setSelectedMilkyWay(milkyWayKey);
        setSelectedPlanet(null);
        setSelectedAsteroid(null);
        setSelectedMoon(null);
        setFocusOnPlanet(false);
        setFocusOnAsteroid(false);
        setFocusOneMoon(false);
        setMoons([]);
        setNbMoons(4);
        setInfos(extraStarObjects[systemId] ?? SPECIAL_OBJECTS.soleil);
    }, [starSystemMilkyWayKey, extraStarObjects]);

    const focusMoon = useCallback(async (moonName, _planetName) => {
        const isAlreadySelected = selectedMoon === moonName;

        if (isAlreadySelected && focusOneMoon) {
            setSelectedMoon(null);
            setFocusOneMoon(false);
            setNbMoons(8);
        } else {
            setSelectedMoon(moonName);
            setFocusOneMoon(true);
            setNbMoons(8);
            try {
                const moonBody = await fetchBody(moonName);
                setInfos(moonBody);
            } catch {
                setInfos({ id: moonName, englishName: moonName, bodyType: 'Moon' });
            }
        }
    }, [selectedMoon, focusOneMoon]);

    return {
        focusStarNonce,
        focusSA, setFocusSA,
        focusSolarSystem, setFocusSolarSystem,
        focusOnPlanet, setFocusOnPlanet,
        focusOnMoon, setFocusOnMoon,
        focusOnAsteroid, setFocusOnAsteroid,
        focusOneMoon,
        selectedMilkyWay, setSelectedMilkyWay,
        selectedSolarSystem, setSelectedSolarSystem,
        selectedPlanet,
        selectedAsteroid, setSelectedAsteroid,
        selectedMoon,
        infos,
        moons, setMoons,
        nbMoons,
        allExtraSystems,

        focusMilkyWay,
        focusSagittarusA,
        focusOnSolarSystem,
        focusStarSystem,
        focusPlanet,
        focusAsteroid,
        focusMoon,
    };
}
