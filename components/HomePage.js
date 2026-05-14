'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MdInfo, MdInfoOutline } from 'react-icons/md';

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

    if (loading) {
        return (
            <div className={styles.pageBackground}>
                <div className={styles.loadingState}>Chargement du système orbital…</div>
            </div>
        );
    }

    const handleResetView = () => {
        focusOnSolarSystem();
        setResetViewNonce((value) => value + 1);
    };

    const isCatalog = viewMode === 'catalog';

    return (
        <div className={styles.pageBackground}>

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
                />
            </div>

            {/* Vue catalogue — couvre la scène 3D */}
            {isCatalog && (
                <CatalogView
                    allExtraSystems={allExtraSystems}
                    solarPlanets={planets}
                    moons={moons}
                    selectedPlanet={selectedPlanet}
                    focusMilkyWay={focusMilkyWay}
                    focusStarSystem={focusStarSystem}
                    focusOnSolarSystem={focusOnSolarSystem}
                    focusPlanet={focusPlanet}
                    focusMoon={focusMoon}
                />
            )}

            {/* Navigation breadcrumb — toujours visible */}
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

            {/* Bouton reset — mode orbital uniquement */}
            {!isCatalog && (
                <button
                    className={`${styles.panel} ${styles.resetViewButton}`}
                    onClick={handleResetView}
                    type="button"
                >
                    Reset View
                </button>
            )}

            {/* Toggle catalogue / orbital */}
            <button
                onClick={() => setViewMode(m => m === 'orbital' ? 'catalog' : 'orbital')}
                style={{
                    position: 'fixed', bottom: 20, left: 20, zIndex: 60,
                    background: isCatalog ? 'rgba(126,231,255,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isCatalog ? 'rgba(126,231,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    color: isCatalog ? '#7ee7ff' : '#aac',
                    borderRadius: 10, padding: '7px 16px',
                    cursor: 'pointer', fontSize: '0.82rem',
                    backdropFilter: 'blur(10px)',
                }}
                type="button"
            >
                {isCatalog ? '◎ Vue orbitale' : '⊞ Catalogue'}
            </button>

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
