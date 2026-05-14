'use client';

import React, { useState, useMemo } from 'react';
import { MdChevronRight } from 'react-icons/md';
import styles from '../styles/CatalogView.module.css';

// ── Couleurs des planètes solaires (hors API) ─────────────────────────────

const SOLAR_COLORS = {
    mercure: '#c8c8c8', mercury: '#c8c8c8',
    venus: '#f0d080',
    terre: '#4a80c0', earth: '#4a80c0',
    mars: '#d05010',
    jupiter: '#d8a060',
    saturne: '#ede0a0', saturn: '#ede0a0',
    uranus: '#88eef0',
    neptune: '#3355e8',
    pluton: '#9a8070', pluto: '#9a8070',
};

const VISUAL_TYPE_LABELS = {
    'gas-giant': 'Géante gazeuse',
    'lava-world': 'Monde de lave',
    'ice-world': 'Monde glacé',
    temperate: 'Monde tempéré',
    rocky: 'Monde rocheux',
    Planet: 'Planète',
    Moon: 'Lune',
    Asteroid: 'Astéroïde',
};

// ── Composants visuels ────────────────────────────────────────────────────

function Sphere({ color = '#4488cc', size = 64, variant = 'planet' }) {
    return (
        <div
            className={`${styles.sphere} ${variant === 'star' ? styles.sphereStar : variant === 'galaxy' ? styles.sphereGalaxy : ''}`}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(ellipse at 36% 28%, rgba(255,255,255,0.42) 0%, transparent 54%),
                             radial-gradient(circle, ${color} 0%, rgba(0,0,0,0.75) 120%)`,
                boxShadow: variant === 'star'
                    ? `0 0 14px ${color}99, 0 0 28px ${color}55, inset -3px -4px 10px rgba(0,0,0,0.3)`
                    : 'inset -4px -5px 14px rgba(0,0,0,0.55), 0 3px 8px rgba(0,0,0,0.35)',
                '--glow': `${color}88`,
            }}
        />
    );
}

function Breadcrumb({ items }) {
    return (
        <nav className={styles.breadcrumb}>
            {items.map((item, i) => (
                <React.Fragment key={item.label}>
                    {i > 0 && <MdChevronRight className={styles.breadcrumbSep} />}
                    {item.onClick
                        ? <button className={styles.breadcrumbBtn} onClick={item.onClick} type="button">{item.label}</button>
                        : <span className={styles.breadcrumbCurrent}>{item.label}</span>
                    }
                </React.Fragment>
            ))}
        </nav>
    );
}

// ── Composant principal ───────────────────────────────────────────────────

export default function CatalogView({
    allExtraSystems,
    solarPlanets,
    moons,
    selectedPlanet,
    focusMilkyWay,
    focusStarSystem,
    focusOnSolarSystem,
    focusPlanet,
    focusMoon,
}) {
    const [level, setLevel]               = useState('galaxies');
    const [activeSystemId, setActiveSystemId] = useState(null);
    const [activePlanetName, setActivePlanetName] = useState(null);
    const [search, setSearch]             = useState('');
    const [sort, setSort]                 = useState('distance'); // distance | size | mass

    // ── Système actif ────────────────────────────────────────────────────

    const activeSystem = useMemo(() => {
        if (!activeSystemId) return null;
        if (activeSystemId === 'solar') {
            return {
                id: 'solar',
                name: 'Soleil',
                planets: solarPlanets.map(p => ({
                    name: p.englishName,
                    id: p.id,
                    color: SOLAR_COLORS[p.id] ?? SOLAR_COLORS[p.englishName?.toLowerCase()] ?? '#888',
                    size: p.meanRadius ? p.meanRadius / 6371 : 1,
                    meanRadius: p.meanRadius,
                    avgTemp: p.avgTemp,
                    bodyType: 'Planet',
                    visualType: p.bodyType ?? 'Planet',
                    massEarth: p.mass ? (p.mass.massValue * Math.pow(10, p.mass.massExponent) / 5.972e24) : 0,
                    sideralOrbit: p.sideralOrbit,
                })),
            };
        }
        return allExtraSystems.find(s => s.id === activeSystemId) ?? null;
    }, [activeSystemId, allExtraSystems, solarPlanets]);

    // ── Planètes triées ──────────────────────────────────────────────────

    const sortedPlanets = useMemo(() => {
        const list = activeSystem?.planets ?? [];
        const copy = [...list];
        if (sort === 'size') copy.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
        else if (sort === 'mass') copy.sort((a, b) => (a.massEarth ?? 0) - (b.massEarth ?? 0));
        else copy.sort((a, b) => (a.r ?? 0) - (b.r ?? 0)); // distance
        return copy;
    }, [activeSystem, sort]);

    // ── Étoiles filtrées ─────────────────────────────────────────────────

    const allSystems = useMemo(() => [
        { id: 'solar', name: 'Soleil', starColor: '#ffe880', isSolar: true, planets: solarPlanets },
        ...allExtraSystems,
    ], [allExtraSystems, solarPlanets]);

    const filteredSystems = useMemo(() => {
        if (!search) return allSystems;
        const q = search.toLowerCase();
        return allSystems.filter(s => s.name.toLowerCase().includes(q));
    }, [allSystems, search]);

    // ── Breadcrumb ───────────────────────────────────────────────────────

    const breadcrumb = useMemo(() => {
        const items = [
            {
                label: 'Galaxies',
                onClick: level !== 'galaxies' ? () => { setLevel('galaxies'); setSearch(''); } : null,
            },
        ];
        if (level === 'stars' || level === 'planets' || level === 'moons') {
            items.push({
                label: 'Étoiles',
                onClick: level !== 'stars' ? () => { setLevel('stars'); setSearch(''); } : null,
            });
        }
        if (level === 'planets' || level === 'moons') {
            items.push({
                label: activeSystem?.name ?? '—',
                onClick: level !== 'planets' ? () => setLevel('planets') : null,
            });
        }
        if (level === 'moons') {
            items.push({ label: activePlanetName ?? '—', onClick: null });
        }
        return items;
    }, [level, activeSystem, activePlanetName]);

    // ── Handlers ─────────────────────────────────────────────────────────

    function goGalaxy() {
        focusMilkyWay?.();
        setLevel('stars');
        setSearch('');
        setActiveSystemId(null);
    }

    function goStar(sys) {
        if (sys.id === 'solar') focusOnSolarSystem?.();
        else focusStarSystem?.(sys.id);
        setActiveSystemId(sys.id);
        setLevel('planets');
        setSearch('');
    }

    function goPlanet(planet) {
        const name = planet.name ?? planet.englishName ?? planet.id;
        focusPlanet?.(name, activeSystemId);
        setActivePlanetName(name);
        setLevel('moons');
    }

    function goMoon(moon) {
        focusMoon?.(moon.id ?? moon.englishName, activePlanetName);
    }

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className={styles.overlay}>
            <Breadcrumb items={breadcrumb} />

            {/* ── Galaxies ── */}
            {level === 'galaxies' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Galaxies</span>
                        <span className={styles.count}>1 répertoriée</span>
                    </div>
                    <div className={styles.gridCentered}>
                        <div className={styles.card} onClick={goGalaxy}>
                            <Sphere color="#aac8ff" size={80} variant="galaxy" />
                            <div className={styles.cardName}>Voie Lactée</div>
                            <div className={styles.cardMeta}>
                                <span className={styles.cardTag}>Galaxie spirale barrée</span>
                                <span className={styles.cardTagAccent}>~200–400 Md étoiles</span>
                                <span className={styles.cardTag}>100 000 al de diamètre</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Étoiles ── */}
            {level === 'stars' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Étoiles</span>
                        <span className={styles.count}>{filteredSystems.length} / {allSystems.length} systèmes</span>
                    </div>
                    <input
                        className={styles.searchBox}
                        placeholder="Rechercher une étoile…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                    <div className={styles.grid}>
                        {filteredSystems.map(sys => {
                            const color = sys.starColor ?? '#ffe880';
                            const pCount = sys.planets?.length ?? 0;
                            return (
                                <div
                                    key={sys.id}
                                    className={`${styles.card} ${activeSystemId === sys.id ? styles.cardActive : ''}`}
                                    onClick={() => goStar(sys)}
                                >
                                    <Sphere color={color} size={60} variant="star" />
                                    <div className={styles.cardName}>{sys.name}</div>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardTagAccent}>{pCount}p</span>
                                        {sys.starInfo?.avgTemp && (
                                            <span className={styles.cardTag}>{sys.starInfo.avgTemp.toLocaleString('fr-FR')} K</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── Planètes ── */}
            {level === 'planets' && activeSystem && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Planètes de {activeSystem.name}</span>
                        <span className={styles.count}>{sortedPlanets.length}</span>
                        <div className={styles.sortControls}>
                            {[['distance', 'Distance'], ['size', 'Taille'], ['mass', 'Masse']].map(([key, label]) => (
                                <button
                                    key={key}
                                    className={`${styles.sortBtn} ${sort === key ? styles.sortBtnActive : ''}`}
                                    onClick={() => setSort(key)}
                                    type="button"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.grid}>
                        {sortedPlanets.map(planet => {
                            const name = planet.name ?? planet.englishName ?? planet.id;
                            const color = planet.color ?? '#4488cc';
                            const sizeRatio = planet.size ?? (planet.meanRadius ? planet.meanRadius / 6371 : 0);
                            const tempC = planet.avgTemp != null ? (planet.avgTemp - 273.15).toFixed(0) : null;
                            const typeLabel = VISUAL_TYPE_LABELS[planet.visualType] ?? VISUAL_TYPE_LABELS[planet.bodyType] ?? 'Planète';
                            const isHabitable = planet.avgTemp != null && planet.avgTemp >= 180 && planet.avgTemp <= 350;
                            return (
                                <div
                                    key={name}
                                    className={`${styles.card} ${selectedPlanet === name || selectedPlanet === planet.id ? styles.cardActive : ''}`}
                                    onClick={() => goPlanet(planet)}
                                >
                                    <Sphere color={color} size={54} variant="planet" />
                                    <div className={styles.cardName}>{name}</div>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.cardTag}>{typeLabel}</span>
                                        {sizeRatio > 0 && (
                                            <span className={styles.cardTagAccent}>{sizeRatio.toFixed(2)}× Terre</span>
                                        )}
                                        {tempC !== null && (
                                            <span className={isHabitable ? styles.cardTagGreen : styles.cardTagWarm}>
                                                {tempC} °C
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── Lunes ── */}
            {level === 'moons' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Lunes de {activePlanetName}</span>
                        <span className={styles.count}>{moons.filter(m => !m.name?.startsWith('S/')).length}</span>
                    </div>
                    {moons.length === 0 ? (
                        <div className={styles.empty}>Aucune lune répertoriée pour cette planète.</div>
                    ) : (
                        <div className={styles.grid}>
                            {moons
                                .filter(m => !m.name?.startsWith('S/'))
                                .map(moon => {
                                    const mName = moon.englishName ?? moon.name ?? moon.id;
                                    const sizeRatio = moon.meanRadius ? (moon.meanRadius / 6371).toFixed(3) : null;
                                    return (
                                        <div key={moon.id ?? mName} className={styles.card} onClick={() => goMoon(moon)}>
                                            <Sphere color="#8899aa" size={48} variant="planet" />
                                            <div className={styles.cardName}>{mName}</div>
                                            <div className={styles.cardMeta}>
                                                <span className={styles.cardTag}>Lune</span>
                                                {sizeRatio && (
                                                    <span className={styles.cardTagAccent}>{sizeRatio}× Terre</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
