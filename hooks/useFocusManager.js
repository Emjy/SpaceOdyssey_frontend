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
        setPlanetStates(SAGITTARIUS_VIEW);
        infoObjet('sagittariusA', setInfos);
    }, [setPlanetStates]);

    // Focus sur le Système Solaire
    const focusOnSolarSystem = useCallback(() => {
        setSelectedSolarSystem('Planets');
        setSelectedPlanet(null);
        setSelectedMilkyWay('Solar System');
        setPlanetStates(SOLAR_SYSTEM_VIEW);
        infoObjet('soleil', setInfos);
        setFocusOnPlanet(false);
        setFocusOneMoon(false);
        setMoons([]);
        setNbMoons(4);
        setSelectedMoon(null);
    }, [setPlanetStates]);

    // Focus sur une planète
    // - 1er clic : vue système solaire centrée sur la planète (zoom moyen)
    // - 2ème clic sur la même planète : zoom rapproché + lunes visibles
    const focusPlanet = useCallback(async (planetName) => {
        const isAlreadySelected = selectedPlanet === planetName;
        const isZoomedIn = isAlreadySelected && focusOnPlanet;

        setSelectedPlanet(planetName);
        setSelectedMoon(null);
        setFocusOneMoon(false);

        await fetchMoons(planetName, setMoons);

        if (isZoomedIn) {
            // 2ème clic : retour vue système solaire
            setFocusOnPlanet(false);
            setNbMoons(4);
            setPlanetStates(SOLAR_SYSTEM_VIEW);
        } else if (isAlreadySelected) {
            // planète déjà sélectionnée → zoom rapproché
            setFocusOnPlanet(true);
            setNbMoons(8);
            setPlanetStates(getPlanetView(planetName, true));
        } else {
            // Nouvelle planète → vue rapprochée directe
            setFocusOnPlanet(true);
            setNbMoons(8);
            setPlanetStates(getPlanetView(planetName, true));
        }

        infoObjet(planetName, setInfos);
    }, [selectedPlanet, focusOnPlanet, setPlanetStates]);

    // Focus sur un astéroïde
    const focusAsteroid = useCallback(async (asteroidName) => {
        setNbMoons(0);
        setSelectedAsteroid(asteroidName);

        if (!asteroidName) {
            // Vue ceinture complète
            setPlanetStates(ASTEROID_BELT_VIEW);
            setFocusOnAsteroid(false);
        } else if (focusOnAsteroid && selectedAsteroid === asteroidName) {
            // Déjà zoomé sur cet astéroïde → retour ceinture
            setFocusOnAsteroid(false);
            setSelectedAsteroid('');
            setPlanetStates(ASTEROID_BELT_VIEW);
        } else {
            // Zoom sur l'astéroïde sélectionné
            setFocusOnAsteroid(true);
            setPlanetStates({
                ...ASTEROID_BELT_VIEW,
                milkyWaySize: 0,
                sagittarusA: 0,
                sunSize: 0,
                indexSun: 0
            });
            infoObjet(asteroidName, setInfos);
        }
    }, [focusOnAsteroid, selectedAsteroid, setPlanetStates]);

    // Focus sur une lune
    const focusMoon = useCallback((moonName, planetName) => {
        const isAlreadySelected = selectedMoon === moonName;

        if (isAlreadySelected && focusOneMoon) {
            // Déjà zoomé sur cette lune → retour vue planète
            setSelectedMoon(null);
            setFocusOneMoon(false);
            setNbMoons(8);
            setPlanetStates(getMoonView(planetName, false));
        } else {
            // Zoom sur la lune
            setSelectedMoon(moonName);
            setFocusOneMoon(true);
            setNbMoons(1);
            setPlanetStates(getMoonView(planetName, true));
            infoObjet(moonName, setInfos);
        }
    }, [selectedMoon, focusOneMoon, setPlanetStates]);

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
