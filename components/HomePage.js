'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MdInfo, MdInfoOutline } from 'react-icons/md';

import styles from '../styles/HomePage.module.css';

import useSpaceData    from '../hooks/useSpaceData';
import useFocusManager from '../hooks/useFocusManager';

import NavigationMenu from './NavigationMenu';
import Informations   from './Informations';

const SolarSystemScene = dynamic(() => import('./SolarSystemScene'), { ssr: false });

export default function HomePage() {
    const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

    const { planets, asteroids, loading } = useSpaceData();

    const {
        setFocusOnPlanet,
        setFocusOnMoon,
        setFocusOnAsteroid,
        setFocusSA,
        setFocusSolarSystem,

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
    } = useFocusManager(planets, asteroids);

    if (loading) {
        return (
            <div className={styles.pageBackground}>
                <div className={styles.loadingState}>Chargement du système orbital…</div>
            </div>
        );
    }

    return (
        <div className={styles.pageBackground}>

            <div className={styles.sceneLayer}>
                <SolarSystemScene
                    planets={planets}
                    asteroids={asteroids}
                    selectedPlanet={selectedPlanet}
                    selectedAsteroid={selectedAsteroid}
                    selectedMoon={selectedMoon}
                    moons={moons}
                    nbMoons={nbMoons}
                    focusPlanet={focusPlanet}
                    focusAsteroid={focusAsteroid}
                    focusMoon={focusMoon}
                    setFocusOnPlanet={setFocusOnPlanet}
                    setFocusOnAsteroid={setFocusOnAsteroid}
                    setFocusOnMoon={setFocusOnMoon}
                />
            </div>

            <NavigationMenu
                planets={planets}
                asteroids={asteroids}
                moons={moons}
                selectedMilkyWay={selectedMilkyWay}
                selectedSolarSystem={selectedSolarSystem}
                selectedPlanet={selectedPlanet}
                selectedAsteroid={selectedAsteroid}
                selectedMoon={selectedMoon}
                focusMilkyWay={focusMilkyWay}
                focusSagittarusA={focusSagittarusA}
                focusOnSolarSystem={focusOnSolarSystem}
                focusPlanet={focusPlanet}
                focusAsteroid={focusAsteroid}
                focusMoon={focusMoon}
                setFocusSA={setFocusSA}
                setFocusSolarSystem={setFocusSolarSystem}
                setFocusOnPlanet={setFocusOnPlanet}
                setFocusOnAsteroid={setFocusOnAsteroid}
                setFocusOnMoon={setFocusOnMoon}
                setSelectedMilkyWay={setSelectedMilkyWay}
                setSelectedSolarSystem={setSelectedSolarSystem}
                setSelectedAsteroid={setSelectedAsteroid}
                setMoons={setMoons}
                bodyCount={planets.length + asteroids.length}
                currentView={selectedSolarSystem || 'Système solaire'}
                currentTarget={selectedPlanet || selectedAsteroid || selectedMoon || '—'}
            />

            <aside className={styles.rightDock}>
                <div className={styles.rightContainer}>
                    {infos ? (
                        <Informations infos={infos} />
                    ) : (
                        <div className={`${styles.panel} ${styles.emptyInfo}`}>
                            Sélectionne un objet depuis la scène ou le menu pour afficher sa fiche.
                        </div>
                    )}
                </div>
            </aside>

            <div className={`${styles.mobileInfoPanel} ${!mobileInfoOpen ? styles.mobileInfoPanelHidden : ''}`}>
                {infos ? (
                    <Informations infos={infos} />
                ) : (
                    <div className={`${styles.panel} ${styles.emptyInfo}`}>
                        Sélectionne un objet pour afficher sa fiche.
                    </div>
                )}
            </div>

            <button
                className={styles.mobileInfoFab}
                onClick={() => { setMobileInfoOpen(v => !v); }}
                type="button"
                aria-label="Informations"
            >
                {mobileInfoOpen ? <MdInfo /> : <MdInfoOutline />}
            </button>

        </div>
    );
}
