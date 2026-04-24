'use client';

import React, { useMemo, useState, memo } from 'react';
import { MdChevronRight, MdKeyboardArrowDown } from 'react-icons/md';
import { milkyWay } from '../data/solarSystem';
import styles from '../styles/HomePage.module.css';

const displayLabel = (label) => {
    if (label === 'Solar System') return 'Soleil';
    if (label === 'Sagittarius A') return 'Sagittarius A*';
    return label;
};

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
    focusStarSystem,
    focusPlanet,
    focusAsteroid,
    focusMoon,
    setSelectedMilkyWay,
}) => {
    const [openMenu, setOpenMenu] = useState(null);

    const moonItems = useMemo(
        () => moons.filter((item) => !item.name?.startsWith('S/')),
        [moons]
    );

    const selectedPlanetLabel = selectedPlanet
        ? planets.find((item) => item.id === selectedPlanet)?.englishName || selectedPlanet
        : null;
    const selectedAsteroidLabel = selectedAsteroid
        ? asteroids.find((item) => item.id === selectedAsteroid)?.englishName || selectedAsteroid
        : null;
    const selectedMoonLabel = selectedMoon
        ? moonItems.find((item) => item.id === selectedMoon)?.englishName || selectedMoon
        : null;

    const closeMenu = () => setOpenMenu(null);

    const milkyWayItems = milkyWay.map((item) => ({
        id: item,
        label: displayLabel(item),
        active: selectedMilkyWay === item,
        onClick: () => {
            if (item === 'Sagittarius A') {
                setSelectedMilkyWay(item);
                focusSagittarusA();
            } else if (item === 'Solar System') {
                focusStarSystem('solar');
            } else if (item === 'Kepler') {
                focusStarSystem('kepler');
            }
            closeMenu();
        },
    }));

    const sunItems = [
        {
            id: 'sun-home',
            label: 'Soleil',
            active: selectedMilkyWay === 'Solar System' && !selectedPlanet && !selectedAsteroid && !selectedMoon && selectedSolarSystem !== 'Asteroid Belt',
            onClick: () => {
                focusOnSolarSystem();
                closeMenu();
            },
        },
        {
            id: 'asteroid-belt-home',
            label: "Ceinture d'astéroïdes",
            active: selectedSolarSystem === 'Asteroid Belt' && !selectedAsteroid,
            onClick: () => {
                focusAsteroid('');
                closeMenu();
            },
        },
    ];

    const bodyItems = [
        { id: 'planets-label', label: 'Planètes', kind: 'label' },
        ...planets.map((item) => ({
            id: item.id,
            label: item.englishName,
            active: selectedPlanet === item.id,
            onClick: () => {
                focusPlanet(item.id);
                closeMenu();
            },
        })),
        { id: 'asteroids-label', label: 'Astéroïdes', kind: 'label' },
        {
            id: 'asteroid-belt',
            label: "Ceinture d'astéroïdes",
            active: selectedSolarSystem === 'Asteroid Belt' && !selectedAsteroid,
            onClick: () => {
                focusAsteroid('');
                closeMenu();
            },
        },
        ...asteroids.map((item) => ({
            id: item.id,
            label: item.englishName,
            active: selectedAsteroid === item.id,
            onClick: () => {
                focusAsteroid(item.id);
                closeMenu();
            },
        })),
    ];

    const breadcrumbs = [
        {
            id: 'milkyway',
            label: 'Milky Way',
            items: [
                {
                    id: 'milky-way-overview',
                    label: 'Milky Way',
                    active: selectedMilkyWay === null,
                    onClick: () => {
                        focusMilkyWay();
                        closeMenu();
                    },
                },
                ...milkyWayItems,
            ],
        },
    ];

    if (selectedMilkyWay === 'Sagittarius A') {
        breadcrumbs.push({
            id: 'sagittarius',
            label: 'Sagittarius A*',
            items: [
                {
                    id: 'sagittarius-current',
                    label: 'Sagittarius A*',
                    active: true,
                    onClick: () => {
                        setSelectedMilkyWay('Sagittarius A');
                        focusSagittarusA();
                        closeMenu();
                    },
                },
            ],
        });
    }

    if (selectedMilkyWay === 'Solar System') {
        breadcrumbs.push({
            id: 'sun',
            label: 'Soleil',
            items: sunItems,
        });
        breadcrumbs.push({
            id: 'bodies',
            label: selectedPlanetLabel || selectedAsteroidLabel || (selectedSolarSystem === 'Asteroid Belt' ? "Ceinture d'astéroïdes" : "Corps célestes"),
            items: bodyItems,
        });
    }

    if (selectedMilkyWay === 'Kepler') {
        breadcrumbs.push({
            id: 'kepler',
            label: 'Kepler',
            items: [
                {
                    id: 'kepler-home',
                    label: 'Kepler',
                    active: !selectedPlanet,
                    onClick: () => { focusStarSystem('kepler'); closeMenu(); },
                },
                { id: 'kepler-planets-label', label: 'Planètes', kind: 'label' },
                ...['kepler-b', 'kepler-c', 'kepler-d'].map((id) => ({
                    id,
                    label: id.toUpperCase(),
                    active: selectedPlanet === id,
                    onClick: () => { focusPlanet(id); closeMenu(); },
                })),
            ],
        });
    }

    if (selectedMilkyWay === 'Solar System' && moonItems.length > 0) {
        breadcrumbs.push({
            id: 'moons',
            label: selectedMoonLabel || 'Lunes',
            items: moonItems.map((item) => ({
                id: item.id,
                label: item.englishName,
                active: selectedMoon === item.id,
                onClick: () => {
                    focusMoon(item.id, selectedPlanet);
                    closeMenu();
                },
            })),
        });
    }

    return (
        <div className={styles.topNavShell}>
            <nav className={styles.topNav} aria-label="Fil d'ariane du systeme solaire">
                {breadcrumbs.map((section, index) => (
                    <React.Fragment key={section.id}>
                        <div className={styles.navGroup}>
                            <button
                                type="button"
                                className={`${styles.navTrigger} ${openMenu === section.id ? styles.navTriggerOpen : ''}`}
                                onClick={() => setOpenMenu((current) => current === section.id ? null : section.id)}
                            >
                                <span className={styles.navTriggerLabel}>{section.label}</span>
                                <MdKeyboardArrowDown className={styles.navTriggerIcon} />
                            </button>
                            {openMenu === section.id && (
                                <div className={styles.navDropdown}>
                                    {section.items.map((item) => (
                                        item.kind === 'label' ? (
                                            <div key={item.id} className={styles.navDropdownSection}>
                                                {item.label}
                                            </div>
                                        ) : (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`${styles.navDropdownItem} ${item.active ? styles.navDropdownItemActive : ''}`}
                                                onClick={item.onClick}
                                            >
                                                <span>{item.label}</span>
                                                {item.active && <span className={styles.navDropdownTick}>•</span>}
                                            </button>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                        {index < breadcrumbs.length - 1 && <MdChevronRight className={styles.navChevron} />}
                    </React.Fragment>
                ))}
            </nav>
        </div>
    );
});

NavigationMenu.displayName = 'NavigationMenu';

export default NavigationMenu;
