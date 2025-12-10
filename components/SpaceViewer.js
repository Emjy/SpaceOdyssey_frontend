'use client';

import React, { memo, useMemo } from 'react';
import MilkyWay from './MilkyWay';
import SagittarusA from './SagittarusA';
import Sun from './Sun';
import Planet from './Planet';
import Asteroid from './Asteroid';
import styles from '../styles/HomePage.module.css';

/**
 * Composant qui affiche la vue 3D de l'espace
 */
const SpaceViewer = memo(({
    planetStates,
    planets,
    asteroids,
    selectedSolarSystem,
    selectedMilkyWay,
    selectedAsteroid,
    selectedPlanet,
    selectedMoon,
    nbMoons,
    focusOneMoon,
    focusSagittarusA,
    focusOnSolarSystem,
    focusPlanet,
    focusMoon,
    focusAsteroid,
    setFocusSA,
    setFocusSolarSystem,
    setFocusOnPlanet,
    setFocusOnMoon,
    setSelectedMoon,
    setSelectedAsteroid,
    setFocusOnAsteroid,
}) => {
    // Planètes
    const mapPlanets = useMemo(() =>
        planets.map((item, index) => (
            <Planet
                key={item.id}
                name={item.id}
                orbitSize={planetStates[`${item.englishName.toLowerCase()}Orbit`]}
                index={planetStates[`${item.englishName.toLowerCase()}Index`]}
                nOrb={index + 1}
                planetSize={planetStates[`${item.englishName.toLowerCase()}Size`]}
                vitesse={item.sideralOrbit}
                nbMoons={nbMoons}
                focus={focusOneMoon}
                focusPlanet={focusPlanet}
                focusMoon={focusMoon}
                setFocusOnPlanet={setFocusOnPlanet}
                setFocusOnMoon={setFocusOnMoon}
                selectedMoon={selectedMoon}
                selectedPlanet={selectedPlanet}
                setSelectedMoon={setSelectedMoon}
            />
        )),
        [
            planets,
            planetStates,
            nbMoons,
            focusOneMoon,
            focusPlanet,
            focusMoon,
            setFocusOnPlanet,
            setFocusOnMoon,
            selectedMoon,
            selectedPlanet,
            setSelectedMoon
        ]
    );

    // Astéroïdes
    const mapAsteroids = useMemo(() =>
        asteroids.map((item, index) => {
            let orbitSize, size;

            if (selectedAsteroid === '') {
                orbitSize = 55 + index / 3;
                size = item.meanRadius / 130;
            } else if (selectedAsteroid === item.id) {
                orbitSize = 1;
                size = 50;
            } else {
                return null;
            }

            return (
                <Asteroid
                    key={item.id}
                    name={item.id}
                    englishName={item.englishName}
                    orbitSize={orbitSize}
                    index={index + 1}
                    nOrb={index + 1}
                    asteroidSize={size}
                    vitesse={item.sideralOrbit / 10}
                    setSelectedAsteroid={setSelectedAsteroid}
                    focusAsteroid={focusAsteroid}
                    setFocusOnAsteroid={setFocusOnAsteroid}
                />
            );
        }),
        [asteroids, selectedAsteroid, focusAsteroid, setSelectedAsteroid, setFocusOnAsteroid]
    );

    return (
        <div className={styles.container}>
            <MilkyWay size={planetStates.milkyWaySize} />

            <SagittarusA
                size={planetStates.sagittarusA}
                opacity={planetStates.sagittarusA}
                indexSa={planetStates.indexSa}
                focusSagittarusA={focusSagittarusA}
                setFocusSA={setFocusSA}
            />

            <Sun
                sunSize={planetStates.sunSize}
                indexSun={planetStates.indexSun}
                orbit={planetStates.sunOrbit}
                focusSolarSystem={focusOnSolarSystem}
                setFocusSolarSystem={setFocusSolarSystem}
            />

            {(selectedSolarSystem === 'Planets' || selectedSolarSystem === 'Asteroid Belt') && mapPlanets}
            {selectedMilkyWay === 'Solar System' && selectedSolarSystem === 'Asteroid Belt' && mapAsteroids}
        </div>
    );
});

SpaceViewer.displayName = 'SpaceViewer';

export default SpaceViewer;
