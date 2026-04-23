'use client';

import React, { useMemo, useState, memo } from 'react';
import { MdChevronRight, MdKeyboardArrowDown } from 'react-icons/md';
import { milkyWay, solarSystem } from '../data/solarSystem';
import styles from '../styles/HomePage.module.css';

const displayLabel = (label) => (label === 'Solar System' ? 'Soleil' : label);

const NavigationMenu = memo(({
    planets,
    asteroids,
    moons,
    selectedMilkyWay,
    selectedSolarSystem,
    selectedPlanet,
    selectedAsteroid,
    selectedMoon,
    focusMilkyWay,
    focusSagittarusA,
    focusOnSolarSystem,
    focusPlanet,
    focusAsteroid,
    focusMoon,
    setSelectedMilkyWay,
    setSelectedSolarSystem,
    setSelectedAsteroid,
    setMoons,
    bodyCount,
    currentView,
    currentTarget,
}) => {
    const [openMenu, setOpenMenu] = useState(null);

    const moonItems = useMemo(
        () => moons.filter((item) => !item.name?.startsWith('S/')),
        [moons]
    );

    const navItems = [
        {
            id: 'milkyway',
            label: displayLabel(selectedMilkyWay || 'Milky Way'),
            items: milkyWay.map((item) => ({
                id: item,
                label: displayLabel(item),
                active: selectedMilkyWay === item,
                onClick: () => {
                    setSelectedMilkyWay(item);
                    if (item === 'Sagittarius A') focusSagittarusA();
                    else if (item === 'Solar System') focusOnSolarSystem();
                    setOpenMenu(null);
                },
            })),
        },
        selectedMilkyWay === 'Solar System' ? {
            id: 'solarsystem',
            label: selectedSolarSystem || 'Soleil',
            items: solarSystem.map((item) => ({
                id: item,
                label: item,
                active: selectedSolarSystem === item,
                onClick: async () => {
                    setSelectedSolarSystem(item);
                    if (item === 'Planets') {
                        focusOnSolarSystem();
                    } else if (item === 'Asteroid Belt') {
                        await focusAsteroid('');
                    }
                    setOpenMenu(null);
                },
            })),
        } : null,
        selectedMilkyWay === 'Solar System' ? {
            id: 'planets',
            label: selectedPlanet ? planets.find((item) => item.id === selectedPlanet)?.englishName || selectedPlanet : 'Planets',
            items: planets.map((item) => ({
                id: item.id,
                label: item.englishName,
                active: selectedPlanet === item.id,
                onClick: () => {
                    focusPlanet(item.id);
                    setOpenMenu(null);
                },
            })),
        } : null,
        selectedMilkyWay === 'Solar System' ? {
            id: 'asteroids',
            label: selectedAsteroid ? asteroids.find((item) => item.id === selectedAsteroid)?.englishName || selectedAsteroid : 'Asteroids',
            items: asteroids.map((item) => ({
                id: item.id,
                label: item.englishName,
                active: selectedAsteroid === item.id,
                onClick: () => {
                    setSelectedAsteroid(item.id);
                    focusAsteroid(item.id);
                    setOpenMenu(null);
                },
            })),
        } : null,
        moonItems.length > 0 ? {
            id: 'moons',
            label: selectedMoon ? moonItems.find((item) => item.id === selectedMoon)?.englishName || selectedMoon : 'Moons',
            items: moonItems.map((item) => ({
                id: item.id,
                label: item.englishName,
                active: selectedMoon === item.id,
                onClick: () => {
                    focusMoon(item.id, selectedPlanet);
                    setOpenMenu(null);
                },
            })),
        } : null,
    ].filter(Boolean);

    return (
        <div className={`${styles.panel} ${styles.topNavShell}`}>
            <nav className={styles.topNav} aria-label="Navigation du systeme solaire">
                {navItems.map((section, index) => (
                    <React.Fragment key={section.id}>
                        <div className={styles.navGroup}>
                            <button
                                type="button"
                                className={`${styles.navTrigger} ${openMenu === section.id ? styles.navTriggerOpen : ''}`}
                                onClick={() => setOpenMenu((current) => current === section.id ? null : section.id)}
                            >
                                <span className={styles.navTriggerLabel}>{section.label}</span>
                                <MdKeyboardArrowDown />
                            </button>
                            {openMenu === section.id && (
                                <div className={styles.navDropdown}>
                                    {section.items.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className={`${styles.navDropdownItem} ${item.active ? styles.navDropdownItemActive : ''}`}
                                            onClick={item.onClick}
                                        >
                                            <span>{item.label}</span>
                                            {item.active && <span className={styles.navDropdownTick}>•</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {index < navItems.length - 1 && <MdChevronRight className={styles.navChevron} />}
                    </React.Fragment>
                ))}
            </nav>
            <div className={styles.navMeta}>
                <div className={styles.footerChip}>Vue : {currentView}</div>
                <div className={styles.footerChip}>Cible : {currentTarget}</div>
                <div className={styles.footerChip}>{bodyCount} corps célestes</div>
            </div>
        </div>
    );
});

NavigationMenu.displayName = 'NavigationMenu';

export default NavigationMenu;
