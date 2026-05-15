'use client';

import React, { useMemo, useState, memo, useEffect, useRef, useCallback } from 'react';
import { MdChevronRight, MdKeyboardArrowDown, MdSearch } from 'react-icons/md';
import styles from '../styles/HomePage.module.css';
import { GALAXIES, isGalaxyOverviewSelection } from '../data/galaxies';

// ─── Dropdown générique avec recherche ───────────────────────────────────────

function Dropdown({ items, onClose, searchThreshold = 8 }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (items.length >= searchThreshold) inputRef.current?.focus();
    }, [items.length, searchThreshold]);

    const filtered = useMemo(() => {
        if (!query) return items;
        const q = query.toLowerCase();
        return items.filter((item) =>
            item.kind === 'label' || item.label?.toLowerCase().includes(q)
        );
    }, [items, query]);

    // Filtre les labels orphelins (label suivi d'un autre label ou rien)
    const visible = useMemo(() => {
        return filtered.filter((item, i) => {
            if (item.kind !== 'label') return true;
            const next = filtered[i + 1];
            return next && next.kind !== 'label';
        });
    }, [filtered]);

    return (
        <div className={styles.navDropdown}>
            {items.length >= searchThreshold && (
                <div className={styles.navDropdownSearch}>
                    <MdSearch className={styles.navDropdownSearchIcon} />
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.navDropdownSearchInput}
                        placeholder="Rechercher…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            {visible.map((item) =>
                item.kind === 'label' ? (
                    <div key={item.id} className={styles.navDropdownSection}>
                        {item.label}
                    </div>
                ) : (
                    <button
                        key={item.id}
                        type="button"
                        className={`${styles.navDropdownItem} ${item.active ? styles.navDropdownItemActive : ''}`}
                        onClick={() => { item.onClick(); onClose(); }}
                    >
                        {item.dot && (
                            <span className={styles.navDropdownDot} style={{ background: item.dot }} />
                        )}
                        <span className={styles.navDropdownLabel}>{item.label}</span>
                        {item.meta && <span className={styles.navDropdownMeta}>{item.meta}</span>}
                        {item.active && <span className={styles.navDropdownTick}>•</span>}
                    </button>
                )
            )}
            {visible.length === 0 && (
                <div className={styles.navDropdownEmpty}>Aucun résultat</div>
            )}
        </div>
    );
}

// ─── Bouton de section breadcrumb ────────────────────────────────────────────

function NavSegment({ label, isOpen, onClick }) {
    return (
        <button
            type="button"
            className={`${styles.navTrigger} ${isOpen ? styles.navTriggerOpen : ''}`}
            onClick={onClick}
        >
            <span className={styles.navTriggerLabel}>{label}</span>
            <MdKeyboardArrowDown className={`${styles.navTriggerIcon} ${isOpen ? styles.navTriggerIconOpen : ''}`} />
        </button>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

const NavigationMenu = memo(({
    planets = [],
    asteroids = [],
    moons = [],
    exoplanetSystems = [],
    galaxies = [],
    infos,
    selectedMilkyWay,
    selectedSolarSystem,
    selectedPlanet,
    selectedAsteroid,
    selectedMoon,
    focusMilkyWay,
    focusCatalogGalaxy,
    focusSagittarusA,
    focusOnSolarSystem,
    focusStarSystem,
    focusPlanet,
    focusAsteroid,
    focusMoon,
    setSelectedMilkyWay,
}) => {
    const [openMenu, setOpenMenu] = useState(null);
    const navRef = useRef(null);

    // Lunes filtrées (sans les lunes "S/...")
    const moonItems = useMemo(
        () => moons.filter((item) => !item.name?.startsWith('S/')),
        [moons]
    );

    // Système actif (solar | exo_xxx | null)
    const activeSystemId = useMemo(() => {
        if (selectedMilkyWay === 'Solar System') return 'solar';
        if (!selectedMilkyWay) return null;
        return exoplanetSystems.find((s) => s.milkyWayKey === selectedMilkyWay)?.id ?? null;
    }, [selectedMilkyWay, exoplanetSystems]);

    const activeExoSystem = useMemo(
        () => exoplanetSystems.find((s) => s.id === activeSystemId) ?? null,
        [exoplanetSystems, activeSystemId]
    );

    const isMilkyWayGalaxyActive = useMemo(() => {
        if (infos?.bodyType === 'Galaxy') {
            return infos.id === 'milkyway';
        }
        return selectedMilkyWay == null;
    }, [infos, selectedMilkyWay]);

    const closeMenu = useCallback(() => setOpenMenu(null), []);

    const toggleMenu = useCallback((id) => {
        setOpenMenu((cur) => cur === id ? null : id);
    }, []);

    // Ferme sur clic extérieur
    useEffect(() => {
        if (!openMenu) return;
        const handler = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) closeMenu();
        };
        document.addEventListener('pointerdown', handler, { capture: true });
        return () => document.removeEventListener('pointerdown', handler, { capture: true });
    }, [openMenu, closeMenu]);

    // Escape ferme le menu
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') closeMenu(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [closeMenu]);

    // ── Niveau 1 : Voie Lactée ────────────────────────────────────────────────

    const catalogGalaxies = useMemo(() => {
        const knownIds = new Set(GALAXIES.map((galaxy) => galaxy.id));
        return [
            ...GALAXIES,
            ...galaxies.filter((galaxy) => !knownIds.has(galaxy.id)),
        ];
    }, [galaxies]);

    const galaxyLabel = useMemo(() => {
        if (infos?.bodyType === 'Galaxy' && infos?.name) return infos.name;
        return 'Voie Lactée';
    }, [infos, selectedMilkyWay]);

    const galaxyItems = useMemo(() => catalogGalaxies.map((galaxy) => ({
        id: galaxy.id,
        label: galaxy.name,
        active:
            galaxy.selectionValue == null
                ? (infos?.bodyType === 'Galaxy'
                    ? infos?.id === galaxy.id
                    : (selectedMilkyWay == null && galaxy.id === 'milkyway'))
                : selectedMilkyWay === galaxy.selectionValue,
        onClick:
            galaxy.id === 'milkyway'
                ? focusMilkyWay
                : () => focusCatalogGalaxy?.(galaxy),
    })), [catalogGalaxies, infos, selectedMilkyWay, focusMilkyWay, focusCatalogGalaxy]);

    // ── Niveau 2 : Étoile ────────────────────────────────────────────────────

    const starLabel = useMemo(() => {
        if (isMilkyWayGalaxyActive) return 'Étoiles';
        if (isGalaxyOverviewSelection(selectedMilkyWay)) return 'Étoile';
        if (selectedMilkyWay === 'Solar System') return 'Soleil';
        return selectedMilkyWay; // hostname de l'exoétoile
    }, [selectedMilkyWay, isMilkyWayGalaxyActive]);

    const starItems = useMemo(() => [
        {
            id: 'solar',
            label: 'Soleil',
            active: selectedMilkyWay === 'Solar System',
            dot: '#ffe880',
            meta: 'G2V',
            onClick: () => focusStarSystem('solar'),
        },
        { id: 'exo-divider', label: `Exoétoiles (${exoplanetSystems.length})`, kind: 'label' },
        ...exoplanetSystems.map((sys) => ({
            id: sys.id,
            label: sys.name,
            active: selectedMilkyWay === sys.milkyWayKey,
            dot: sys.starColor,
            meta: `${sys.planets.length}p`,
            onClick: () => focusStarSystem(sys.id),
        })),
    ], [exoplanetSystems, selectedMilkyWay, focusStarSystem]);

    // ── Niveau 3 : Planète / corps ───────────────────────────────────────────

    const planetLabel = useMemo(() => {
        if (selectedAsteroid) {
            return asteroids.find((a) => a.id === selectedAsteroid)?.englishName ?? selectedAsteroid;
        }
        if (selectedPlanet) {
            if (activeSystemId === 'solar') {
                return planets.find((p) => p.id === selectedPlanet)?.englishName ?? selectedPlanet;
            }
            return selectedPlanet; // nom de la planète exo
        }
        if (selectedSolarSystem === 'Asteroid Belt') return "Ceinture d'astéroïdes";
        return 'Corps célestes';
    }, [selectedPlanet, selectedAsteroid, selectedSolarSystem, planets, asteroids, activeSystemId]);

    const planetItems = useMemo(() => {
        if (activeSystemId === 'solar') {
            return [
                { id: 'pl-label', label: 'Planètes', kind: 'label' },
                ...planets.map((p) => ({
                    id: p.id,
                    label: p.englishName,
                    active: selectedPlanet === p.id,
                    onClick: () => focusPlanet(p.id, 'solar'),
                })),
                { id: 'ast-label', label: 'Astéroïdes', kind: 'label' },
                {
                    id: 'asteroid-belt',
                    label: "Ceinture d'astéroïdes",
                    active: selectedSolarSystem === 'Asteroid Belt' && !selectedAsteroid,
                    onClick: () => focusAsteroid(''),
                },
                ...asteroids.map((a) => ({
                    id: a.id,
                    label: a.englishName,
                    active: selectedAsteroid === a.id,
                    onClick: () => focusAsteroid(a.id),
                })),
            ];
        }
        if (activeExoSystem) {
            return [
                { id: 'exo-pl-label', label: `Planètes de ${activeExoSystem.name}`, kind: 'label' },
                ...activeExoSystem.planets.map((p) => ({
                    id: p.name,
                    label: p.name,
                    active: selectedPlanet === p.name,
                    meta: p.meanRadius ? `${Math.round(p.meanRadius / 6371 * 10) / 10}× Terre` : undefined,
                    onClick: () => focusPlanet(p.name, activeExoSystem.id),
                })),
            ];
        }
        return [];
    }, [activeSystemId, activeExoSystem, planets, asteroids, selectedPlanet, selectedAsteroid, selectedSolarSystem, focusPlanet, focusAsteroid]);

    // ── Niveau 4 : Lune ──────────────────────────────────────────────────────

    const moonLabel = useMemo(() => {
        if (!selectedMoon) return 'Lunes';
        return moonItems.find((m) => m.id === selectedMoon)?.englishName ?? selectedMoon;
    }, [selectedMoon, moonItems]);

    const moonDropItems = useMemo(() =>
        moonItems.map((m) => ({
            id: m.id,
            label: m.englishName,
            active: selectedMoon === m.id,
            onClick: () => focusMoon(m.id, selectedPlanet),
        })),
        [moonItems, selectedMoon, selectedPlanet, focusMoon]
    );

    // ── Construction des segments breadcrumb ──────────────────────────────────

    const segments = useMemo(() => {
        const list = [
            { id: 'galaxy', label: galaxyLabel, items: galaxyItems },
        ];

        // Niveau étoile : visible seulement quand un système stellaire est actif
        if (
            isMilkyWayGalaxyActive
            || selectedMilkyWay === 'Solar System'
            || (!!selectedMilkyWay && !isGalaxyOverviewSelection(selectedMilkyWay))
        ) {
            list.push({ id: 'star', label: starLabel, items: starItems });
        }

        // Niveau planète : visible si un système stellaire est actif
        if (activeSystemId && planetItems.length > 0) {
            list.push({ id: 'planet', label: planetLabel, items: planetItems });
        }

        // Niveau lune : visible si des lunes sont disponibles
        if (activeSystemId === 'solar' && moonDropItems.length > 0) {
            list.push({ id: 'moon', label: moonLabel, items: moonDropItems });
        }

        return list;
    }, [
        galaxyLabel, galaxyItems,
        selectedMilkyWay, starLabel, starItems, isMilkyWayGalaxyActive,
        activeSystemId, planetLabel, planetItems,
        moonDropItems, moonLabel,
    ]);

    return (
        <div className={styles.topNavShell} ref={navRef}>
            <nav className={styles.topNav} aria-label="Navigation spatiale">
                {segments.map((seg, i) => (
                    <React.Fragment key={seg.id}>
                        <div className={styles.navGroup}>
                            <NavSegment
                                label={seg.label}
                                isOpen={openMenu === seg.id}
                                onClick={() => toggleMenu(seg.id)}
                            />
                            {openMenu === seg.id && (
                                <Dropdown items={seg.items} onClose={closeMenu} />
                            )}
                        </div>
                        {i < segments.length - 1 && (
                            <MdChevronRight className={styles.navChevron} aria-hidden />
                        )}
                    </React.Fragment>
                ))}
            </nav>
        </div>
    );
});

NavigationMenu.displayName = 'NavigationMenu';
export default NavigationMenu;
