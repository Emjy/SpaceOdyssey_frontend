'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MdMenu, MdClose, MdInfo, MdInfoOutline } from 'react-icons/md';

import styles from '../styles/HomePage.module.css';

import useSpaceData    from '../hooks/useSpaceData';
import useFocusManager from '../hooks/useFocusManager';

import NavigationMenu from './NavigationMenu';
import Informations   from './Informations';

const SolarSystemScene = dynamic(() => import('./SolarSystemScene'), { ssr: false });

export default function HomePage() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    } = useFocusManager(planets);

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
                    selectedPlanet={selectedPlanet}
                    selectedMoon={selectedMoon}
                    moons={moons}
                    nbMoons={nbMoons}
                    focusPlanet={focusPlanet}
                    focusMoon={focusMoon}
                    setFocusOnPlanet={setFocusOnPlanet}
                    setFocusOnMoon={setFocusOnMoon}
                />
            </div>

            <header className={`${styles.panel} ${styles.topBar}`}>
                <div className={styles.topBarTitleGroup}>
                    <div className={styles.eyebrow}>Orbital Atlas</div>
                    <h1 className={styles.heroTitle}>Space Odyssey</h1>
                    <p className={styles.heroCopy}>
                        Drag pour pivoter · cliquez sur une planète pour la sélectionner
                    </p>
                </div>
                <div className={styles.stageMeta}>
                    <div className={styles.footerChip}>
                        Vue : {selectedSolarSystem || 'Système solaire'}
                    </div>
                    <div className={styles.footerChip}>
                        Cible : {selectedPlanet || selectedMoon || '—'}
                    </div>
                    <div className={styles.footerChip}>
                        {planets.length + asteroids.length} corps célestes
                    </div>
                </div>
            </header>

            <aside className={`${styles.leftDock} ${!mobileNavOpen ? styles.leftDockHidden : ''}`}>
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
                />
            </aside>

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
                className={styles.mobileMenuFab}
                onClick={() => { setMobileNavOpen(v => !v); setMobileInfoOpen(false); }}
                type="button"
                aria-label="Menu de navigation"
            >
                {mobileNavOpen ? <MdClose /> : <MdMenu />}
            </button>
            <button
                className={styles.mobileInfoFab}
                onClick={() => { setMobileInfoOpen(v => !v); setMobileNavOpen(false); }}
                type="button"
                aria-label="Informations"
            >
                {mobileInfoOpen ? <MdInfo /> : <MdInfoOutline />}
            </button>

        </div>
    );
}
