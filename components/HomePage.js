'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MdInfo, MdInfoOutline, MdSettings } from 'react-icons/md';

import styles from '../styles/HomePage.module.css';

import useSpaceData    from '../hooks/useSpaceData';
import useFocusManager from '../hooks/useFocusManager';

import NavigationMenu from './NavigationMenu';
import Informations   from './Informations';
import CatalogView    from './CatalogView';

const SolarSystemScene = dynamic(() => import('./SolarSystemScene'), { ssr: false });

export default function HomePage() {
    const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
    const [resetViewNonce, setResetViewNonce] = useState(0);
    const [viewMode, setViewMode] = useState('orbital'); // 'orbital' | 'catalog'
    const [showHZ, setShowHZ] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    const { planets, asteroids, exoplanetSystems, loading } = useSpaceData();

    const {
        setFocusOnPlanet,
        setFocusOnMoon,
        setFocusOnAsteroid,
        setFocusSA,
        setFocusSolarSystem,

        focusOneMoon,
        focusOnPlanet,
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
        focusStarNonce,
    } = useFocusManager(planets, asteroids, exoplanetSystems);

    useEffect(() => {
        if (!settingsOpen) return;
        function onClickOutside(e) {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setSettingsOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [settingsOpen]);

    if (loading) {
        return (
            <div className={styles.pageBackground}>
                <div className={styles.loadingState}>Chargement du système orbital…</div>
            </div>
        );
    }

    const handleResetView = () => {
        setResetViewNonce((value) => value + 1);
        setSettingsOpen(false);
    };

    const isCatalog = viewMode === 'catalog';

    return (
        <div className={styles.pageBackground}>
            <div className={styles.modeTabsShell}>
                <div className={styles.modeTabs}>
                    <button
                        type="button"
                        className={`${styles.modeTab} ${!isCatalog ? styles.modeTabActive : ''}`}
                        onClick={() => setViewMode('orbital')}
                    >
                        Vue orbitale
                    </button>
                    <button
                        type="button"
                        className={`${styles.modeTab} ${isCatalog ? styles.modeTabActive : ''}`}
                        onClick={() => setViewMode('catalog')}
                    >
                        Catalogue
                    </button>
                </div>
            </div>

            {/* Scène 3D — toujours montée, masquée en mode catalogue */}
            <div className={styles.sceneLayer} style={isCatalog ? { visibility: 'hidden' } : undefined}>
                <SolarSystemScene
                    planets={planets}
                    asteroids={asteroids}
                    exoplanetSystems={exoplanetSystems}
                    focusOnPlanet={focusOnPlanet}
                    resetViewNonce={resetViewNonce}
                    selectedMilkyWay={selectedMilkyWay}
                    selectedPlanet={selectedPlanet}
                    selectedAsteroid={selectedAsteroid}
                    selectedMoon={selectedMoon}
                    moons={moons}
                    nbMoons={nbMoons}
                    focusOnSolarSystem={focusOnSolarSystem}
                    focusStarSystem={focusStarSystem}
                    focusPlanet={focusPlanet}
                    focusAsteroid={focusAsteroid}
                    focusMoon={focusMoon}
                    focusStarNonce={focusStarNonce}
                    showHZ={showHZ}
                />
            </div>

            {/* Vue catalogue — couvre la scène 3D */}
            {isCatalog && (
                <CatalogView
                    allExtraSystems={allExtraSystems}
                    solarPlanets={planets}
                    moons={moons}
                    selectedMilkyWay={selectedMilkyWay}
                    selectedPlanet={selectedPlanet}
                    selectedMoon={selectedMoon}
                    focusMilkyWay={focusMilkyWay}
                    focusStarSystem={focusStarSystem}
                    focusOnSolarSystem={focusOnSolarSystem}
                    focusPlanet={focusPlanet}
                    focusMoon={focusMoon}
                />
            )}

            <NavigationMenu
                planets={planets}
                asteroids={asteroids}
                moons={moons}
                exoplanetSystems={exoplanetSystems}
                selectedMilkyWay={selectedMilkyWay}
                selectedSolarSystem={selectedSolarSystem}
                selectedPlanet={selectedPlanet}
                selectedAsteroid={selectedAsteroid}
                selectedMoon={selectedMoon}
                focusMilkyWay={focusMilkyWay}
                focusSagittarusA={focusSagittarusA}
                focusOnSolarSystem={focusOnSolarSystem}
                focusStarSystem={focusStarSystem}
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
                currentView={selectedSolarSystem || 'Soleil'}
                currentTarget={selectedPlanet || selectedAsteroid || selectedMoon || '—'}
            />

            {/* Bouton settings — orbital uniquement, visible aussi sur mobile */}
            {!isCatalog && (
                <div className={styles.settingsShell} ref={settingsRef}>
                    <button
                        className={`${styles.settingsBtn} ${settingsOpen ? styles.settingsBtnOpen : ''}`}
                        onClick={() => setSettingsOpen(v => !v)}
                        type="button"
                        aria-label="Options"
                    >
                        <MdSettings />
                    </button>
                    {settingsOpen && (
                        <div className={styles.settingsDropdown}>
                            <button
                                className={styles.settingsItem}
                                onClick={handleResetView}
                                type="button"
                            >
                                Vue du dessus
                            </button>
                            <button
                                className={`${styles.settingsItem} ${showHZ ? styles.settingsItemActive : ''}`}
                                onClick={() => setShowHZ(v => !v)}
                                type="button"
                            >
                                Zone habitable
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Panneau infos — masqué en mode catalogue */}
            {!isCatalog && (
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
            )}

            {/* Mobile info panel */}
            {!isCatalog && (
                <>
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
                </>
            )}

        </div>
    );
}
