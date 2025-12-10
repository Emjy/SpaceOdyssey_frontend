'use client';

import { useState, useCallback } from 'react';
import { infoObjet, fetchMoons } from '../functions/utils';
import {
    MILKY_WAY_VIEW,
    SAGITTARIUS_VIEW,
    SOLAR_SYSTEM_VIEW,
    ASTEROID_BELT_VIEW,
    getPlanetView,
    getMoonView
} from '../constants/viewConfigurations';

/**
 * Hook personnalisé pour gérer tous les états de focus et la navigation
 * @param {Function} setPlanetStates - Fonction pour mettre à jour les états des planètes
 * @returns {Object} États et fonctions de gestion du focus
 */
export default function useFocusManager(setPlanetStates) {
    // États de focus
    const [focusSA, setFocusSA] = useState(true);
    const [focusSolarSystem, setFocusSolarSystem] = useState(true);
    const [focusOnPlanet, setFocusOnPlanet] = useState(false);
    const [focusOnMoon, setFocusOnMoon] = useState(true);
    const [focusOnAsteroid, setFocusOnAsteroid] = useState(false);
    const [focusOneMoon, setFocusOneMoon] = useState(false);

    // États de sélection
    const [selectedMilkyWay, setSelectedMilkyWay] = useState(null);
    const [selectedSolarSystem, setSelectedSolarSystem] = useState(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [selectedAsteroid, setSelectedAsteroid] = useState(null);
    const [selectedMoon, setSelectedMoon] = useState(null);

    // Données
    const [infos, setInfos] = useState(false);
    const [moons, setMoons] = useState([]);
    const [nbMoons, setNbMoons] = useState(4);

    // Focus sur la Voie Lactée
    const focusMilkyWay = useCallback(() => {
        setPlanetStates(MILKY_WAY_VIEW);
        infoObjet('milkyWay', setInfos);

        setSelectedMoon(null);
        setFocusOnPlanet(false);
        setSelectedMilkyWay(null);
        setFocusOneMoon(false);
        setSelectedPlanet(null);
        setMoons([]);
    }, [setPlanetStates]);

    // Focus sur Sagittarius A
    const focusSagittarusA = useCallback(() => {
        if (!focusSA) {
            setSelectedMilkyWay(null);
            focusMilkyWay();
        } else {
            setPlanetStates(SAGITTARIUS_VIEW);
            infoObjet('sagittariusA', setInfos);
        }
        setInfos(false);
    }, [focusSA, focusMilkyWay, setPlanetStates]);

    // Focus sur le Système Solaire
    const focusOnSolarSystem = useCallback(() => {
        setSelectedSolarSystem('Planets');
        setSelectedPlanet('Planets');
        setSelectedMilkyWay('Solar System');

        if (!focusSolarSystem && !focusOnPlanet && !focusOneMoon) {
            setInfos(null);
            focusMilkyWay();
        } else {
            setPlanetStates(SOLAR_SYSTEM_VIEW);
            infoObjet('soleil', setInfos);
        }

        setFocusOnPlanet(false);
        setFocusOneMoon(false);
        setMoons([]);
        setNbMoons(4);
        setSelectedMoon(null);
    }, [focusSolarSystem, focusOnPlanet, focusOneMoon, focusMilkyWay, setPlanetStates]);

    // Focus sur une planète
    const focusPlanet = useCallback(async (planetName) => {
        setSelectedPlanet(planetName);
        setSelectedMoon(null);
        setFocusOneMoon(false);
        setNbMoons(8);

        await fetchMoons(planetName, setMoons);

        if (!focusOnPlanet) {
            setNbMoons(5);
            setPlanetStates(getPlanetView(planetName, false));
        } else {
            setPlanetStates(getPlanetView(planetName, true));
        }

        infoObjet(planetName, setInfos);
        setInfos(false);
    }, [focusOnPlanet, setPlanetStates]);

    // Focus sur un astéroïde
    const focusAsteroid = useCallback(async (asteroidName) => {
        setNbMoons(0);
        infoObjet('', setInfos);
        setSelectedAsteroid(asteroidName);

        if (focusOnAsteroid) {
            setPlanetStates({
                ...ASTEROID_BELT_VIEW,
                milkyWaySize: 0,
                sagittarusA: 0,
                sunSize: 0,
                indexSun: 0
            });
        } else {
            setSelectedAsteroid('');
            setPlanetStates(ASTEROID_BELT_VIEW);
        }

        infoObjet(asteroidName, setInfos);
    }, [focusOnAsteroid, setPlanetStates]);

    // Focus sur une lune
    const focusMoon = useCallback((moonName, planetName) => {
        setSelectedMoon(moonName);
        setFocusOneMoon(false);
        setNbMoons(1);

        if (focusOnMoon) {
            setPlanetStates(getMoonView(planetName, false));
        } else {
            setFocusOneMoon(true);
            setPlanetStates(getMoonView(planetName, true));
        }

        infoObjet(moonName, setInfos);
    }, [focusOnMoon, setPlanetStates]);

    return {
        // États
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

        // Fonctions
        focusMilkyWay,
        focusSagittarusA,
        focusOnSolarSystem,
        focusPlanet,
        focusAsteroid,
        focusMoon,
    };
}
