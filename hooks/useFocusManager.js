'use client';

import { useState, useCallback } from 'react';
import { fetchBody, getMoonStubsFromPlanet } from '../lib/solarApi';

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

export default function useFocusManager(planets = []) {
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
        setSelectedMilkyWay(null);
        setFocusOneMoon(false);
        setSelectedPlanet(null);
        setMoons([]);
    }, []);

    const focusSagittarusA = useCallback(() => {
        setInfos(SPECIAL_OBJECTS.sagittariusA);
    }, []);

    const focusOnSolarSystem = useCallback(() => {
        setSelectedSolarSystem('Planets');
        setSelectedPlanet(null);
        setSelectedMilkyWay('Solar System');
        setInfos(SPECIAL_OBJECTS.soleil);
        setFocusOnPlanet(false);
        setFocusOneMoon(false);
        setMoons([]);
        setNbMoons(4);
        setSelectedMoon(null);
    }, []);

    const focusPlanet = useCallback(async (planetName) => {
        const isAlreadySelected = selectedPlanet === planetName;
        const isZoomedIn = isAlreadySelected && focusOnPlanet;

        setSelectedPlanet(planetName);
        setSelectedMoon(null);
        setFocusOneMoon(false);
        setSelectedMilkyWay('Solar System');
        setSelectedSolarSystem('Planets');

        const planetData = planets.find(p => p.id === planetName);
        if (planetData) setInfos(planetData);

        if (isZoomedIn) {
            setFocusOnPlanet(false);
            setNbMoons(4);
        } else {
            setFocusOnPlanet(true);
            setNbMoons(8);
            setMoons(planetData ? getMoonStubsFromPlanet(planetData) : []);
        }
    }, [selectedPlanet, focusOnPlanet, planets]);

    const focusAsteroid = useCallback(async (asteroidName) => {
        setNbMoons(0);
        setSelectedAsteroid(asteroidName);

        if (!asteroidName || (focusOnAsteroid && selectedAsteroid === asteroidName)) {
            setFocusOnAsteroid(false);
            setSelectedAsteroid('');
        } else {
            setFocusOnAsteroid(true);
        }
    }, [focusOnAsteroid, selectedAsteroid]);

    const focusMoon = useCallback(async (moonName, planetName) => {
        const isAlreadySelected = selectedMoon === moonName;

        if (isAlreadySelected && focusOneMoon) {
            setSelectedMoon(null);
            setFocusOneMoon(false);
            setNbMoons(8);
        } else {
            setSelectedMoon(moonName);
            setFocusOneMoon(true);
            setNbMoons(1);
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
        focusPlanet,
        focusAsteroid,
        focusMoon,
    };
}
