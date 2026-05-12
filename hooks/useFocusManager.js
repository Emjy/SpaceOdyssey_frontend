'use client';

import { useState, useCallback } from 'react';
import { fetchBody, getMoonStubsFromPlanet } from '../lib/solarApi';
import { EXTRA_STAR_SYSTEMS } from '../data/starSystems';

const STAR_SYSTEM_MILKY_WAY_KEY = {
    solar: 'Solar System',
    ...Object.fromEntries(EXTRA_STAR_SYSTEMS.map((system) => [system.id, system.milkyWayKey])),
};

const EXTRA_STAR_OBJECTS = Object.fromEntries(
    EXTRA_STAR_SYSTEMS.map((system) => [
        system.id,
        {
            id: system.id,
            englishName: system.name,
            ...(system.starInfo ?? { bodyType: 'Star' }),
        },
    ])
);

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
    ...EXTRA_STAR_OBJECTS,
};

export default function useFocusManager(planets = [], asteroids = []) {
    const getPlanetSystemId = useCallback((planetName, preferredSystemId = null) => {
        if (preferredSystemId && STAR_SYSTEM_MILKY_WAY_KEY[preferredSystemId]) {
            return preferredSystemId;
        }

        if (planets.some((planet) => planet.id === planetName)) {
            return 'solar';
        }

        const extraSystem = EXTRA_STAR_SYSTEMS.find((system) =>
            system.planets.some((planet) => planet.name === planetName)
        );

        return extraSystem?.id ?? 'solar';
    }, [planets]);

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
        const milkyWayKey = STAR_SYSTEM_MILKY_WAY_KEY[systemId] ?? 'Solar System';
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
            : EXTRA_STAR_SYSTEMS
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
    }, [focusOnPlanet, getPlanetSystemId, planets, selectedPlanet]);

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
                const asteroidData = asteroids.find(a => a.id === asteroidName);
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

    // focusStarSystem : entre dans le système demandé et centre l'expérience sur son étoile.
    const focusStarSystem = useCallback((systemId) => {
        const milkyWayKey = STAR_SYSTEM_MILKY_WAY_KEY[systemId];
        if (!milkyWayKey) return;

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
        setInfos(SPECIAL_OBJECTS[systemId] || SPECIAL_OBJECTS.soleil);
    }, []);

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

        focusMilkyWay,
        focusSagittarusA,
        focusOnSolarSystem,
        focusStarSystem,
        focusPlanet,
        focusAsteroid,
        focusMoon,
    };
}
