'use client';

import React from 'react';

// Styles
import styles from '../styles/HomePage.module.css';

// Hooks personnalisés
import usePlanetStates from '../hooks/usePlanetStates';
import useSpaceData from '../hooks/useSpaceData';
import useFocusManager from '../hooks/useFocusManager';

// Composants
import NavigationMenu from './NavigationMenu';
import SpaceViewer from './SpaceViewer';
import Informations from './Informations';

/**
 * Page principale de l'application SpaceOdyssey
 * Composant principal optimisé et modulaire
 */
export default function HomePage() {
    // Hook pour les états des planètes (tailles, positions, etc.)
    const { planetStates, setPlanetStates } = usePlanetStates();

    // Hook pour récupérer les données depuis l'API
    const { planets, asteroids, loading } = useSpaceData();

    // Hook pour gérer tous les états de focus et la navigation
    const {
        // Setters nécessaires
        setFocusSA,
        setFocusSolarSystem,
        setFocusOnPlanet,
        setFocusOnMoon,
        setFocusOnAsteroid,

        // États utilisés
        focusOneMoon,
        selectedMilkyWay,
        setSelectedMilkyWay,
        selectedSolarSystem,
        setSelectedSolarSystem,
        selectedPlanet,
        selectedAsteroid,
        setSelectedAsteroid,
        selectedMoon,
        infos,
        moons,
        setMoons,
        nbMoons,

        // Fonctions
        focusMilkyWay,
        focusSagittarusA,
        focusOnSolarSystem,
        focusPlanet,
        focusAsteroid,
        focusMoon,
    } = useFocusManager(setPlanetStates);

    // Affichage de chargement
    if (loading) {
        return (
            <div className={styles.pageBackground}>
                <div className={styles.container}>
                    <p style={{ color: 'white', textAlign: 'center' }}>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageBackground}>
            {/* Menu de navigation */}
            <NavigationMenu
                // Données
                planets={planets}
                asteroids={asteroids}
                moons={moons}

                // États de sélection
                selectedMilkyWay={selectedMilkyWay}
                selectedSolarSystem={selectedSolarSystem}
                selectedPlanet={selectedPlanet}
                selectedAsteroid={selectedAsteroid}
                selectedMoon={selectedMoon}

                // Fonctions de focus
                focusMilkyWay={focusMilkyWay}
                focusSagittarusA={focusSagittarusA}
                focusOnSolarSystem={focusOnSolarSystem}
                focusPlanet={focusPlanet}
                focusAsteroid={focusAsteroid}
                focusMoon={focusMoon}

                // Setters
                setFocusSA={setFocusSA}
                setFocusSolarSystem={setFocusSolarSystem}
                setFocusOnPlanet={setFocusOnPlanet}
                setFocusOnAsteroid={setFocusOnAsteroid}
                setFocusOnMoon={setFocusOnMoon}
                setSelectedMilkyWay={setSelectedMilkyWay}
                setSelectedSolarSystem={setSelectedSolarSystem}
                setSelectedAsteroid={setSelectedAsteroid}
                setMoons={setMoons}
            />

            {/* Visualisation 3D de l'espace */}
            <SpaceViewer
                planetStates={planetStates}
                planets={planets}
                asteroids={asteroids}
                selectedSolarSystem={selectedSolarSystem}
                selectedMilkyWay={selectedMilkyWay}
                selectedAsteroid={selectedAsteroid}
                selectedPlanet={selectedPlanet}
                selectedMoon={selectedMoon}
                nbMoons={nbMoons}
                focusOneMoon={focusOneMoon}
                focusSagittarusA={focusSagittarusA}
                focusOnSolarSystem={focusOnSolarSystem}
                focusPlanet={focusPlanet}
                focusMoon={focusMoon}
                focusAsteroid={focusAsteroid}
                setFocusSA={setFocusSA}
                setFocusSolarSystem={setFocusSolarSystem}
                setFocusOnPlanet={setFocusOnPlanet}
                setFocusOnMoon={setFocusOnMoon}
                setSelectedMoon={() => {}} // Géré par useFocusManager
                setSelectedAsteroid={setSelectedAsteroid}
                setFocusOnAsteroid={setFocusOnAsteroid}
            />

            {/* Panneau d'informations */}
            {infos && (
                <div className={styles.rightContainer}>
                    <Informations infos={infos} />
                </div>
            )}
        </div>
    );
}
