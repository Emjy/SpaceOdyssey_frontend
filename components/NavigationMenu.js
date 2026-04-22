'use client';

import React, { useState, useMemo, memo, useEffect } from 'react';
import CollapsibleMenu from './ui/CollapsibleMenu';
import MenuButton from './ui/MenuButton';
import { milkyWay, solarSystem } from '../data/solarSystem';
import styles from '../styles/HomePage.module.css';

/**
 * Composant de navigation principal qui gère tous les menus
 */
const NavigationMenu = memo(({
    // Données
    planets,
    asteroids,
    moons,

    // États de sélection
    selectedMilkyWay,
    selectedSolarSystem,
    selectedPlanet,
    selectedAsteroid,
    selectedMoon,

    // Fonctions de focus
    focusMilkyWay,
    focusSagittarusA,
    focusOnSolarSystem,
    focusPlanet,
    focusAsteroid,
    focusMoon,

    // Setters
    setFocusSA,
    setFocusSolarSystem,
    setFocusOnPlanet,
    setFocusOnAsteroid,
    setFocusOnMoon,
    setSelectedMilkyWay,
    setSelectedSolarSystem,
    setSelectedAsteroid,
    setMoons,
}) => {
    // États locaux pour les menus
    const [milkyWayMenu, setMilkyWayMenu] = useState(true);
    const [solarSystemMenu, setSolarSystemMenu] = useState(false);
    const [planetMenu, setPlanetMenu] = useState(false);
    const [asteroidMenu, setAsteroidMenu] = useState(false);
    const [moonMenu, setMoonMenu] = useState(false);

    // Auto-ouvrir les sous-menus à la navigation
    useEffect(() => {
        setSolarSystemMenu(selectedMilkyWay === 'Solar System');
    }, [selectedMilkyWay]);

    useEffect(() => {
        if (selectedSolarSystem === 'Planets') setPlanetMenu(true);
        if (selectedSolarSystem === 'Asteroid Belt') setAsteroidMenu(true);
    }, [selectedSolarSystem]);

    useEffect(() => {
        if (moons.length > 0) setMoonMenu(true);
        else setMoonMenu(false);
    }, [moons.length]);

    // Boutons Milky Way
    const buttonsMilkyWay = useMemo(() =>
        milkyWay.map((item) => (
            <MenuButton
                key={item.id || item}
                itemKey={item.id || item}
                label={item}
                isActive={selectedMilkyWay === item}
                onClick={() => {
                    setSelectedMilkyWay(item);
                    if (item === 'Sagittarius A') {
                        focusSagittarusA();
                    } else if (item === 'Solar System') {
                        focusOnSolarSystem();
                    }
                }}
            />
        )),
        [selectedMilkyWay, focusSagittarusA, focusOnSolarSystem, setFocusSA, setFocusSolarSystem, setSelectedMilkyWay]
    );

    // Boutons Solar System
    const buttonsSolarSystem = useMemo(() =>
        solarSystem.map((item) => (
            <MenuButton
                key={item.id || item}
                itemKey={item.id || item}
                label={item}
                isActive={selectedSolarSystem === item}
                onClick={async () => {
                    setSelectedSolarSystem(item);
                    if (item === 'Planets') {
                        focusOnSolarSystem();
                    } else if (item === 'Asteroid Belt') {
                        await focusAsteroid('');
                    }
                }}
            />
        )),
        [selectedSolarSystem, focusOnSolarSystem, focusAsteroid, setFocusSolarSystem, setSelectedSolarSystem]
    );

    // Boutons Planètes
    const buttonsPlanets = useMemo(() =>
        planets.map((item) => (
            <MenuButton
                key={item.id}
                itemKey={item.id}
                label={item.englishName}
                isActive={selectedPlanet === item.id}
                onClick={() => {
                    focusPlanet(item.id);
                }}
            />
        )),
        [planets, selectedPlanet, focusPlanet]
    );

    // Boutons Astéroïdes
    const buttonsAsteroids = useMemo(() =>
        asteroids.map((item) => (
            <MenuButton
                key={item.id}
                itemKey={item.id}
                label={item.englishName}
                isActive={selectedAsteroid === item.id}
                onClick={() => {
                    setSelectedAsteroid(item.id);
                    setFocusOnAsteroid(true);
                    focusAsteroid(item.id);
                }}
            />
        )),
        [asteroids, selectedAsteroid, focusAsteroid, setSelectedAsteroid, setFocusOnAsteroid]
    );

    // Boutons Lunes
    const buttonsMoons = useMemo(() =>
        moons
            .filter((item) => !item.name?.startsWith('S/'))
            .map((item) => (
                <MenuButton
                    key={item.id}
                    itemKey={item.id}
                    label={item.englishName}
                    isActive={selectedMoon === item.id}
                    onClick={() => {
                        focusMoon(item.id, selectedPlanet);
                    }}
                />
            )),
        [moons, selectedMoon, selectedPlanet, focusMoon]
    );

    return (
        <div className={`${styles.panel} ${styles.menu}`}>
            {/* Menu Milky Way */}
            <CollapsibleMenu
                title="Milky Way"
                isOpen={milkyWayMenu}
                onToggle={() => {
                    const opening = !milkyWayMenu;
                    setMilkyWayMenu(opening);
                    if (opening) {
                        setMoons([]);
                        focusMilkyWay();
                    }
                }}
                itemCount={milkyWay.length}
            >
                {buttonsMilkyWay}
            </CollapsibleMenu>

            {/* Menu Solar System */}
            {selectedMilkyWay === 'Solar System' && (
                <CollapsibleMenu
                    title="Solar System"
                    isOpen={solarSystemMenu}
                    onToggle={() => setSolarSystemMenu(!solarSystemMenu)}
                    itemCount={solarSystem.length}
                >
                    {buttonsSolarSystem}
                </CollapsibleMenu>
            )}

            {/* Menu Planètes */}
            {selectedMilkyWay === 'Solar System' && selectedSolarSystem === 'Planets' && (
                <CollapsibleMenu
                    title={selectedPlanet ? selectedPlanet[0].toUpperCase() + selectedPlanet.slice(1) : 'Planets'}
                    isOpen={planetMenu}
                    onToggle={() => setPlanetMenu(!planetMenu)}
                    itemCount={planets.length}
                    maxHeight="346px"
                >
                    {buttonsPlanets}
                </CollapsibleMenu>
            )}

            {/* Menu Astéroïdes */}
            {selectedMilkyWay === 'Solar System' && selectedSolarSystem === 'Asteroid Belt' && (
                <CollapsibleMenu
                    title={selectedAsteroid ? selectedAsteroid[0].toUpperCase() + selectedAsteroid.slice(1) : 'Asteroids'}
                    isOpen={asteroidMenu}
                    onToggle={() => setAsteroidMenu(!asteroidMenu)}
                    itemCount={asteroids.length}
                    maxHeight="346px"
                    scrollable
                >
                    {buttonsAsteroids}
                </CollapsibleMenu>
            )}

            {/* Menu Lunes */}
            {moons.length > 0 && selectedSolarSystem === 'Planets' && (
                <CollapsibleMenu
                    title={!moonMenu && selectedMoon ? selectedMoon[0].toUpperCase() + selectedMoon.slice(1) : 'Moons'}
                    isOpen={moonMenu}
                    onToggle={() => setMoonMenu(!moonMenu)}
                    itemCount={moons.length}
                    maxHeight={`${(moons.length + 1) * 2.7}em`}
                    scrollable
                >
                    {buttonsMoons}
                </CollapsibleMenu>
            )}
        </div>
    );
});

NavigationMenu.displayName = 'NavigationMenu';

export default NavigationMenu;
