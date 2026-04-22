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
    zoom,
    rotationX,
    onWheel,
    onMouseDown,
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
                viewTilt={rotationX}
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

    // Astéroïdes — orbites entre Mars (18vh) et Jupiter (85vh) dans la ceinture
    const mapAsteroids = useMemo(() =>
        asteroids.map((item, index) => {
            let orbitSize, size;

            if (selectedAsteroid === '') {
                // Ceinture entre ~22vh et ~80vh (entre Mars et Jupiter)
                orbitSize = 22 + (index / (asteroids.length - 1)) * 58;
                size = Math.max(0.3, Math.min(2, item.meanRadius / 150));
            } else if (selectedAsteroid === item.id) {
                orbitSize = 1;
                size = 30;
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
                    nOrb={(index % 25) + 1}
                    asteroidSize={size}
                    vitesse={item.sideralOrbit / 10}
                    viewTilt={rotationX}
                    setSelectedAsteroid={setSelectedAsteroid}
                    focusAsteroid={focusAsteroid}
                    setFocusOnAsteroid={setFocusOnAsteroid}
                />
            );
        }),
        [asteroids, selectedAsteroid, rotationX, focusAsteroid, setSelectedAsteroid, setFocusOnAsteroid]
    );

    return (
        <div className={styles.container} onWheel={onWheel} onMouseDown={onMouseDown}>
            <div className={styles.sceneBackdrop}></div>
            <div
                className={styles.scene}
                style={{ transform: `perspective(900px) scale(${zoom}) rotateX(${rotationX}deg)` }}
            >
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
                    viewTilt={rotationX}
                    focusSolarSystem={focusOnSolarSystem}
                    setFocusSolarSystem={setFocusSolarSystem}
                />

                {(selectedSolarSystem === 'Planets' || selectedSolarSystem === 'Asteroid Belt') && mapPlanets}
                {selectedMilkyWay === 'Solar System' && selectedSolarSystem === 'Asteroid Belt' && mapAsteroids}
            </div>

            <div className={styles.sceneHud}>
                <div className={styles.sceneHudItem}>Drag to tilt</div>
                <div className={styles.sceneHudItem}>Wheel to zoom</div>
                <div className={styles.sceneHudItem}>
                    {selectedMilkyWay === 'Solar System' ? 'Solar System online' : 'Galaxy overview'}
                </div>
            </div>
        </div>
    );
});

SpaceViewer.displayName = 'SpaceViewer';

export default SpaceViewer;
