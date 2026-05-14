'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MdChevronRight } from 'react-icons/md';
import styles from '../styles/CatalogView.module.css';
import { getMoonStubsFromPlanet } from '../lib/solarApi';

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

const PLANET_TEXTURE_BASE = '/textures/planets';
const STAR_TEXTURE_BASE = '/textures/stars';
const MOON_TEXTURE_BASE = '/textures/moons';

const SOLAR_RING_MAP = {
    saturne: '/textures/planets/saturne_anneaux.png',
};

const CAROUSEL_STEP_GAP = 92;
const CAROUSEL_VISIBLE_RADIUS = 2;

const EXO_TYPE_BACKGROUNDS = {
    'gas-giant': [
        'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 34%)',
        'repeating-linear-gradient(180deg, rgba(255,255,255,0.18) 0 8px, rgba(20,10,0,0.06) 8px 16px, rgba(255,255,255,0.08) 16px 22px)',
    ],
    'lava-world': [
        'radial-gradient(circle at 65% 68%, rgba(255,120,20,0.34) 0%, rgba(255,120,20,0) 24%)',
        'radial-gradient(circle at 34% 26%, rgba(255,220,120,0.22) 0%, rgba(255,220,120,0) 18%)',
        'repeating-linear-gradient(135deg, rgba(40,0,0,0.28) 0 10px, rgba(255,100,0,0.18) 10px 18px, rgba(0,0,0,0.1) 18px 28px)',
    ],
    'ice-world': [
        'radial-gradient(circle at 38% 24%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 30%)',
        'repeating-linear-gradient(145deg, rgba(255,255,255,0.16) 0 9px, rgba(110,170,220,0.12) 9px 18px, rgba(255,255,255,0.05) 18px 26px)',
    ],
    temperate: [
        'radial-gradient(circle at 66% 70%, rgba(80,150,90,0.26) 0%, rgba(80,150,90,0) 24%)',
        'repeating-linear-gradient(160deg, rgba(255,255,255,0.08) 0 10px, rgba(0,50,90,0.08) 10px 18px, rgba(40,120,70,0.1) 18px 28px)',
    ],
    rocky: [
        'radial-gradient(circle at 62% 66%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 20%)',
        'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 9px, rgba(0,0,0,0.1) 9px 18px, rgba(255,255,255,0.04) 18px 28px)',
    ],
};

function normalizeAssetName(value) {
    return String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '');
}

function getBodyVisual(body, kind) {
    const name = body?.id ?? body?.name ?? body?.englishName ?? '';
    const normalized = normalizeAssetName(name);

    if (kind === 'star') {
        const color = body?.starColor ?? '#ffe880';
        if (normalized === 'soleil' || normalized === 'sun' || body?.isSolar) {
            return {
                variant: 'star',
                texture: `${STAR_TEXTURE_BASE}/soleil.jpg`,
                glowColor: color,
                starBackground: [
                    'repeating-radial-gradient(circle at 50% 50%, rgba(255,245,210,0.08) 0 3px, rgba(255,170,60,0.05) 3px 7px, rgba(0,0,0,0) 7px 11px)',
                    'radial-gradient(circle at 48% 46%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 28%)',
                ].join(', '),
            };
        }
        return {
            variant: 'star',
            glowColor: color,
            starBackground: [
                'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.09) 0 3px, rgba(255,190,120,0.05) 3px 7px, rgba(0,0,0,0) 7px 11px)',
                'radial-gradient(circle at 48% 46%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 28%)',
                `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(0,0,0,0.82) 118%)`,
            ].join(', '),
            background: `radial-gradient(circle at 45% 45%, ${color} 0%, rgba(0,0,0,0.84) 120%)`,
        };
    }

    if (kind === 'moon') {
        return {
            variant: 'moon',
            texture: `${MOON_TEXTURE_BASE}/${normalized}.jpg`,
            glowColor: '#a6b6c8',
        };
    }

    const visualType = body?.visualType ?? body?.bodyType ?? 'Planet';
    const ringTexture = SOLAR_RING_MAP[normalized] ?? null;
    const color = body?.color ?? '#4488cc';
    const texture = body?.isSolar || body?.bodyType === 'Planet'
        ? `${PLANET_TEXTURE_BASE}/${normalized}.jpg`
        : null;

    if (texture) {
        return {
            variant: 'planet',
            texture,
            ringTexture,
            glowColor: color,
        };
    }

    return {
        variant: 'planet',
        ringTexture,
        glowColor: color,
        background: [
            ...(EXO_TYPE_BACKGROUNDS[visualType] ?? EXO_TYPE_BACKGROUNDS.rocky),
            `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(0,0,0,0.8) 120%)`,
        ].join(', '),
    };
}

// ── Composants visuels ────────────────────────────────────────────────────

function BodyVisual({ body, kind = 'planet', size = 64, className = '' }) {
    const visual = getBodyVisual(body, kind);
    return (
        <div
            className={[
                styles.sphere,
                className,
                visual.variant === 'star' ? styles.sphereStar : '',
                visual.variant === 'moon' ? styles.sphereMoon : '',
                visual.ringTexture ? styles.sphereWithRings : '',
            ].filter(Boolean).join(' ')}
            style={{
                width: size,
                height: size,
                '--glow': `${visual.glowColor}88`,
            }}
        >
            {visual.ringTexture && (
                <img
                    className={styles.ringTexture}
                    src={visual.ringTexture}
                    alt=""
                    aria-hidden="true"
                />
            )}
            {visual.variant === 'star' && visual.starBackground && (
                <div
                    className={styles.starCore}
                    style={{ background: visual.starBackground }}
                />
            )}
            <div
                className={`${styles.sphereSurface} ${visual.texture ? styles.sphereSurfaceImage : styles.sphereSurfaceGradient}`}
                style={visual.texture ? { backgroundImage: `url(${visual.texture})` } : { background: visual.background }}
            />
        </div>
    );
}

function GalaxyVisual() {
    return (
        <div className={styles.galaxyHero}>
            <img
                className={styles.galaxyHeroImage}
                src="/milkyway.jpeg"
                alt="Voie Lactée"
                loading="lazy"
            />
            <div className={styles.galaxyHeroOverlay} />
        </div>
    );
}

function getComparativeScale(value, referenceValue, minScale = 0.12, maxScale = 8, exponent = 0.5) {
    if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(referenceValue) || referenceValue <= 0) {
        return 1;
    }
    const ratio = value / referenceValue;
    return Math.max(minScale, Math.min(maxScale, Math.pow(ratio, exponent)));
}

function safeSize(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function mixScale(from, to, weight) {
    const t = Math.max(0, Math.min(1, weight));
    return from + (to - from) * t;
}

function getNiceScaleKm(rawKm) {
    if (!Number.isFinite(rawKm) || rawKm <= 0) return null;
    const exponent = Math.floor(Math.log10(rawKm));
    const base = Math.pow(10, exponent);
    const normalized = rawKm / base;

    let niceNormalized = 1;
    if (normalized >= 5) niceNormalized = 5;
    else if (normalized >= 2) niceNormalized = 2;
    else niceNormalized = 1;

    return niceNormalized * base;
}

function formatScaleExponent(value) {
    if (!Number.isFinite(value) || value <= 0) return null;
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    const roundedMantissa = mantissa >= 9.95 ? 10 : Math.round(mantissa * 10) / 10;
    if (roundedMantissa === 10) {
        return '10^' + (exponent + 1);
    }
    if (Math.abs(roundedMantissa - 1) < 0.05) {
        return '10^' + exponent;
    }
    return `${String(roundedMantissa).replace('.', ',')} × 10^${exponent}`;
}

function getPlanetRelativeScale(planet, centeredKey, sortedPlanets) {
    const sizeRatio = planet.size ?? (planet.meanRadius ? planet.meanRadius / 6371 : 0);
    const focusedPlanet = sortedPlanets.find((candidate) => (
        (candidate.name ?? candidate.englishName ?? candidate.id) === centeredKey
    )) ?? planet;
    const focusedSize = focusedPlanet.size ?? (focusedPlanet.meanRadius ? focusedPlanet.meanRadius / 6371 : 0);
    return getComparativeScale(sizeRatio, focusedSize, 0.1, 8, 0.5);
}

function getMoonRelativeScale(moon, centeredKey, visibleMoons) {
    const focusedMoon = visibleMoons.find((candidate) => (
        String(candidate.id ?? candidate.englishName ?? candidate.name) === centeredKey
    )) ?? moon;
    return getComparativeScale(
        moon.meanRadius ?? 0,
        focusedMoon.meanRadius ?? 0,
        0.1,
        6,
        0.5
    );
}

function CarouselRow({
    items,
    getKey,
    activeKey = null,
    onFocusItem,
    onSelect,
    renderItem,
    getRenderedSize,
    getPhysicalDiameterKm,
    focusDiameter = 280,
    edgeGap = CAROUSEL_STEP_GAP,
}) {
    const shellRef = useRef(null);
    const wheelLockRef = useRef(false);
    const wheelUnlockTimerRef = useRef(null);
    const [centeredKey, setCenteredKey] = useState(activeKey ?? (items[0] ? getKey(items[0]) : null));
    const centeredIndex = Math.max(0, items.findIndex((item) => String(getKey(item)) === String(centeredKey)));

    useEffect(() => {
        if (items.length === 0) {
            setCenteredKey(null);
            return;
        }
        setCenteredKey((current) => {
            if (activeKey && items.some((item) => getKey(item) === activeKey)) return activeKey;
            if (current && items.some((item) => getKey(item) === current)) return current;
            return getKey(items[0]);
        });
    }, [items, getKey, activeKey]);

    useEffect(() => () => {
        if (wheelUnlockTimerRef.current) window.clearTimeout(wheelUnlockTimerRef.current);
    }, []);

    useEffect(() => {
        const shell = shellRef.current;
        if (!shell) return undefined;

        const onNativeWheel = (event) => {
            const absX = Math.abs(event.deltaX);
            const absY = Math.abs(event.deltaY);
            if (absY < 4 || absY < absX) return;
            event.preventDefault();
            moveByStep(event.deltaY > 0 ? 1 : -1);
        };

        shell.addEventListener('wheel', onNativeWheel, { passive: false });
        return () => {
            shell.removeEventListener('wheel', onNativeWheel);
        };
    }, [centeredIndex, items]);

    useEffect(() => {
        if (!activeKey) return;
        setCenteredKey(activeKey);
    }, [activeKey]);

    function goToIndex(nextIndex) {
        const boundedIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
        if (boundedIndex === centeredIndex) return;
        const nextItem = items[boundedIndex];
        setCenteredKey(getKey(nextItem));
    }

    function moveByStep(direction) {
        if (wheelLockRef.current) return;
        const nextIndex = Math.max(0, Math.min(items.length - 1, centeredIndex + direction));
        if (nextIndex === centeredIndex) return;
        wheelLockRef.current = true;
        goToIndex(nextIndex);
        if (wheelUnlockTimerRef.current) window.clearTimeout(wheelUnlockTimerRef.current);
        wheelUnlockTimerRef.current = window.setTimeout(() => {
            wheelLockRef.current = false;
        }, 280);
    }

    const renderedSizes = useMemo(() => (
        items.map((item, index) => safeSize(
            getRenderedSize?.(item, centeredKey, {
                isCentered: index === centeredIndex,
                index,
                centeredIndex,
                distanceFromCenter: Math.abs(index - centeredIndex),
            }) ?? focusDiameter,
            focusDiameter
        ))
    ), [items, getRenderedSize, centeredKey, centeredIndex, focusDiameter]);

    const visibleIndices = useMemo(() => {
        if (centeredIndex < 0) return [];
        const list = [];
        for (let offset = -CAROUSEL_VISIBLE_RADIUS; offset <= CAROUSEL_VISIBLE_RADIUS; offset += 1) {
            const index = centeredIndex + offset;
            if (index >= 0 && index < items.length) {
                list.push(index);
            }
        }
        return list;
    }, [centeredIndex, items.length]);

    const centeredScale = useMemo(() => {
        if (centeredIndex < 0 || !items[centeredIndex]) return null;
        const centeredItem = items[centeredIndex];
        const renderedSize = renderedSizes[centeredIndex] ?? focusDiameter;
        const physicalDiameterKm = getPhysicalDiameterKm?.(centeredItem);
        if (!Number.isFinite(physicalDiameterKm) || physicalDiameterKm <= 0 || !Number.isFinite(renderedSize) || renderedSize <= 0) {
            return null;
        }

        const kmPerPx = physicalDiameterKm / renderedSize;
        const targetPx = 128;
        const targetKm = kmPerPx * targetPx;
        const niceKm = getNiceScaleKm(targetKm);
        if (!Number.isFinite(niceKm) || niceKm <= 0) return null;
        const rulerPx = 128;
        const subdivisions = niceKm >= Math.pow(10, Math.floor(Math.log10(niceKm))) * 5 ? 5 : 4;
        return {
            rulerPx: Math.round(rulerPx),
            rulerKm: niceKm,
            kmPerPx,
            subdivisions,
            exponentLabel: formatScaleExponent(niceKm),
        };
    }, [centeredIndex, items, renderedSizes, focusDiameter, getPhysicalDiameterKm]);

    return (
        <div
            ref={shellRef}
            className={styles.carouselShell}
            style={{
                '--carousel-focus-diameter': `${focusDiameter}px`,
                '--carousel-edge-gap': `${edgeGap}px`,
            }}
        >
            <div className={styles.carouselStage}>
                {visibleIndices.map((index) => {
                    const item = items[index];
                    const key = String(getKey(item));
                    const isCentered = centeredKey === key;
                    const isActive = activeKey != null && String(activeKey) === key;
                    const renderedSize = renderedSizes[index] ?? focusDiameter;
                    const direction = index - centeredIndex;
                    let offsetX = 0;

                    if (direction !== 0) {
                        const step = direction > 0 ? 1 : -1;
                        let previousSize = focusDiameter;

                        for (let cursor = centeredIndex + step; step > 0 ? cursor <= index : cursor >= index; cursor += step) {
                            const currentSize = renderedSizes[cursor] ?? focusDiameter;
                            offsetX += step * (((previousSize + currentSize) / 2) + edgeGap);
                            previousSize = currentSize;
                        }
                    }
                    return (
                        <button
                            key={key}
                            type="button"
                            data-carousel-key={key}
                            className={[
                                styles.carouselItem,
                                isCentered ? styles.carouselItemCentered : '',
                                isActive ? styles.carouselItemActive : '',
                            ].filter(Boolean).join(' ')}
                            style={{
                                width: `${Math.max(renderedSize, 180)}px`,
                                '--item-size': `${renderedSize}px`,
                                '--item-offset-x': `${offsetX}px`,
                            }}
                            onClick={() => {
                                if (isCentered) {
                                    onFocusItem?.(item);
                                    onSelect?.(item);
                                    return;
                                }
                                setCenteredKey(key);
                                onFocusItem?.(item);
                            }}
                        >
                            {renderItem(item, { isCentered, isActive, centeredKey, renderedSize, index, centeredIndex })}
                        </button>
                    );
                })}
            </div>
            {centeredScale && (
                <div className={styles.carouselScale}>
                    <div className={styles.carouselScaleRule}>
                        <div
                            className={styles.carouselScaleLine}
                            style={{ width: `${centeredScale.rulerPx}px` }}
                        >
                            {Array.from({ length: centeredScale.subdivisions + 1 }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`${styles.carouselScaleTick} ${index === 0 || index === centeredScale.subdivisions ? styles.carouselScaleTickMajor : ''}`}
                                    style={{ left: `${(index / centeredScale.subdivisions) * 100}%` }}
                                />
                            ))}
                        </div>
                        <div className={styles.carouselScaleReadout}>
                            {Math.round(centeredScale.rulerKm).toLocaleString('fr-FR')} km
                        </div>
                        <div className={styles.carouselScalePower}>
                            {centeredScale.exponentLabel}
                        </div>
                    </div>
                </div>
            )}
        </div>
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
    const overlayRef = useRef(null);
    const [level, setLevel]               = useState('galaxies');
    const [activeSystemId, setActiveSystemId] = useState(null);
    const [activePlanetName, setActivePlanetName] = useState(null);
    const [sort, setSort]                 = useState('distance'); // distance | size | mass
    const [starSort, setStarSort]         = useState('temperature'); // temperature | size | planets | name

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

    const sortedSystems = useMemo(() => {
        const systems = [...allSystems];
        const getTemp = (system) => system?.starInfo?.avgTemp ?? (system.isSolar ? 5778 : -Infinity);
        const getRadius = (system) => system?.starInfo?.meanRadius ?? (system.isSolar ? 695700 : -Infinity);
        const getPlanets = (system) => system?.planets?.length ?? 0;

        if (starSort === 'size') {
            systems.sort((a, b) => getRadius(a) - getRadius(b));
        } else if (starSort === 'planets') {
            systems.sort((a, b) => getPlanets(a) - getPlanets(b));
        } else if (starSort === 'name') {
            systems.sort((a, b) => String(a.name).localeCompare(String(b.name), 'fr', { sensitivity: 'base' }));
        } else {
            systems.sort((a, b) => getTemp(a) - getTemp(b));
        }

        return systems;
    }, [allSystems, starSort]);

    const solarMoonMap = useMemo(() => Object.fromEntries(
        solarPlanets.map((planet) => [
            planet.englishName ?? planet.id,
            getMoonStubsFromPlanet(planet),
        ])
    ), [solarPlanets]);

    const visibleMoons = useMemo(() => {
        if (activeSystemId !== 'solar' || !activePlanetName) return [];
        return solarMoonMap[activePlanetName] ?? [];
    }, [activeSystemId, activePlanetName, solarMoonMap]);

    const activePlanetCarouselKey = useMemo(() => {
        const match = sortedPlanets.find((planet) => (
            selectedPlanet === planet.id
            || selectedPlanet === planet.name
            || selectedPlanet === planet.englishName
        ));
        return match ? (match.name ?? match.englishName ?? match.id) : null;
    }, [sortedPlanets, selectedPlanet]);

    // ── Breadcrumb ───────────────────────────────────────────────────────

    const breadcrumb = useMemo(() => {
        const items = [
            {
                label: 'Galaxies',
                onClick: level !== 'galaxies' ? () => { setLevel('galaxies'); } : null,
            },
        ];
        if (level === 'stars' || level === 'planets' || level === 'moons') {
            items.push({
                label: 'Étoiles',
                onClick: level !== 'stars' ? () => { setLevel('stars'); } : null,
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
        setActiveSystemId(null);
    }

    function goStar(sys) {
        if (sys.id === 'solar') focusOnSolarSystem?.();
        else focusStarSystem?.(sys.id);
        setActiveSystemId(sys.id);
        setLevel('planets');
    }

    function focusStarOnly(sys) {
        if (sys.id === 'solar') focusOnSolarSystem?.();
        else focusStarSystem?.(sys.id);
        setActiveSystemId(sys.id);
    }

    function goPlanet(planet) {
        const name = planet.name ?? planet.englishName ?? planet.id;
        if (activePlanetCarouselKey !== name) {
            focusPlanet?.(name, activeSystemId);
        }
        setActivePlanetName(name);
        if (activeSystemId === 'solar' && (solarMoonMap[name]?.length ?? 0) > 0) {
            setLevel('moons');
        }
    }

    function focusPlanetOnly(planet) {
        const name = planet.name ?? planet.englishName ?? planet.id;
        setActivePlanetName(name);
        if (activePlanetCarouselKey !== name) {
            focusPlanet?.(name, activeSystemId);
        }
    }

    function goMoon(moon) {
        focusMoon?.(moon.id ?? moon.englishName, activePlanetName);
    }

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return undefined;

        const blockHistorySwipe = (event) => {
            if (!overlay.contains(event.target)) return;
            const absX = Math.abs(event.deltaX);
            const absY = Math.abs(event.deltaY);
            if (absX < 3) return;
            event.preventDefault();
        };

        window.addEventListener('wheel', blockHistorySwipe, { passive: false, capture: true });
        return () => {
            window.removeEventListener('wheel', blockHistorySwipe, { capture: true });
        };
    }, []);

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div ref={overlayRef} className={styles.overlay}>
            <Breadcrumb items={breadcrumb} />

            {/* ── Galaxies ── */}
            {level === 'galaxies' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Galaxies</span>
                        <span className={styles.count}>1 répertoriée</span>
                    </div>
                    <CarouselRow
                        items={[{ id: 'milkyway', name: 'Voie Lactée' }]}
                        getKey={(galaxy) => galaxy.id}
                        onFocusItem={goGalaxy}
                        onSelect={goGalaxy}
                        getPhysicalDiameterKm={() => 946073047258080}
                        focusDiameter={360}
                        getRenderedSize={() => 360}
                        renderItem={(galaxy, { isCentered }) => (
                            <>
                                <div className={styles.carouselCaption}>
                                    <GalaxyVisual />
                                    <div className={styles.carouselTitle}>{galaxy.name}</div>
                                    <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                        <div className={styles.carouselMeta}>Galaxie spirale barrée</div>
                                        <div className={styles.carouselAccent}>~200–400 Md étoiles</div>
                                        <div className={styles.carouselMeta}>100 000 al de diamètre</div>
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </>
            )}

            {/* ── Étoiles ── */}
            {level === 'stars' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Étoiles</span>
                        <span className={styles.count}>{sortedSystems.length} systèmes</span>
                        <div className={styles.sortControls}>
                            {[['temperature', 'Froid → chaud'], ['size', 'Taille'], ['planets', 'Planètes'], ['name', 'Nom']].map(([key, label]) => (
                                <button
                                    key={key}
                                    className={`${styles.sortBtn} ${starSort === key ? styles.sortBtnActive : ''}`}
                                    onClick={() => setStarSort(key)}
                                    type="button"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <CarouselRow
                        items={sortedSystems}
                        getKey={(sys) => sys.id}
                        activeKey={activeSystemId}
                        onFocusItem={focusStarOnly}
                        onSelect={goStar}
                        getPhysicalDiameterKm={(sys) => {
                            const radiusKm = sys?.starInfo?.meanRadius ?? (sys?.isSolar ? 695700 : null);
                            return Number.isFinite(radiusKm) ? radiusKm * 2 : null;
                        }}
                        focusDiameter={320}
                        getRenderedSize={() => 320}
                        renderItem={(sys, { isCentered }) => (
                            <>
                                <div className={styles.carouselVisualStage}>
                                    <BodyVisual body={sys} kind="star" size={320} />
                                </div>
                                <div className={styles.carouselCaption}>
                                    <div className={styles.carouselTitle}>{sys.name}</div>
                                    <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                        <div className={styles.carouselMeta}>{sys.planets?.length ?? 0} planètes</div>
                                        {sys.starInfo?.avgTemp && (
                                            <div className={styles.carouselAccent}>
                                                {sys.starInfo.avgTemp.toLocaleString('fr-FR')} K
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    />
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
                    <CarouselRow
                        items={sortedPlanets}
                        getKey={(planet) => planet.name ?? planet.englishName ?? planet.id}
                        activeKey={activePlanetCarouselKey}
                        onFocusItem={focusPlanetOnly}
                        onSelect={goPlanet}
                        getPhysicalDiameterKm={(planet) => (
                            Number.isFinite(planet?.meanRadius) ? planet.meanRadius * 2 : null
                        )}
                        focusDiameter={280}
                        getRenderedSize={(planet, centeredKey, ctx) => {
                            const relativeScale = getPlanetRelativeScale(planet, centeredKey, sortedPlanets);
                            const distance = ctx?.distanceFromCenter ?? 0;
                            if (distance === 0) return 280;
                            const falloff = distance === 1 ? 1 : distance === 2 ? 0.88 : 0.74;
                            return safeSize(280 * mixScale(relativeScale, 1, 0.18) * falloff, 280);
                        }}
                        renderItem={(planet, { isCentered, renderedSize }) => {
                            const name = planet.name ?? planet.englishName ?? planet.id;
                            const tempC = planet.avgTemp != null ? `${(planet.avgTemp - 273.15).toFixed(0)} °C` : null;
                            const typeLabel = VISUAL_TYPE_LABELS[planet.visualType] ?? VISUAL_TYPE_LABELS[planet.bodyType] ?? 'Planète';
                            const sizeRatio = planet.size ?? (planet.meanRadius ? planet.meanRadius / 6371 : 0);
                            return (
                                <>
                                    <div className={styles.carouselVisualStage}>
                                        <BodyVisual body={planet} kind="planet" size={renderedSize} />
                                    </div>
                                    <div className={styles.carouselCaption}>
                                        <div className={styles.carouselTitle}>{name}</div>
                                        <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                            <div className={styles.carouselMeta}>{typeLabel}</div>
                                            {sizeRatio > 0 && (
                                                <div className={styles.carouselAccent}>{sizeRatio.toFixed(2)}× Terre</div>
                                            )}
                                            {tempC && <div className={styles.carouselMeta}>{tempC}</div>}
                                        </div>
                                    </div>
                                </>
                            );
                        }}
                    />
                </>
            )}

            {/* ── Lunes ── */}
            {level === 'moons' && (
                <>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Lunes de {activePlanetName}</span>
                        <span className={styles.count}>{visibleMoons.length}</span>
                    </div>
                    {visibleMoons.length === 0 ? (
                        <div className={styles.empty}>Aucune lune répertoriée pour cette planète.</div>
                    ) : (
                        <CarouselRow
                            items={visibleMoons}
                            getKey={(moon) => moon.id ?? moon.englishName ?? moon.name}
                            onFocusItem={goMoon}
                            onSelect={goMoon}
                            getPhysicalDiameterKm={(moon) => (
                                Number.isFinite(moon?.meanRadius) ? moon.meanRadius * 2 : null
                            )}
                            focusDiameter={250}
                            getRenderedSize={(moon, centeredKey, ctx) => {
                                const relativeScale = getMoonRelativeScale(moon, centeredKey, visibleMoons);
                                const distance = ctx?.distanceFromCenter ?? 0;
                                if (distance === 0) return 250;
                                const falloff = distance === 1 ? 1 : distance === 2 ? 0.88 : 0.74;
                                return safeSize(250 * mixScale(relativeScale, 1, 0.18) * falloff, 250);
                            }}
                            renderItem={(moon, { isCentered, renderedSize }) => {
                                const mName = moon.englishName ?? moon.name ?? moon.id;
                                const sizeRatio = moon.meanRadius ? (moon.meanRadius / 6371).toFixed(3) : null;
                                return (
                                    <>
                                        <div className={styles.carouselVisualStage}>
                                            <BodyVisual body={moon} kind="moon" size={renderedSize} />
                                        </div>
                                        <div className={styles.carouselCaption}>
                                            <div className={styles.carouselTitle}>{mName}</div>
                                            <div className={`${styles.carouselInfo} ${isCentered ? styles.carouselInfoVisible : ''}`}>
                                                <div className={styles.carouselMeta}>Lune</div>
                                                {sizeRatio && (
                                                    <div className={styles.carouselAccent}>{sizeRatio}× Terre</div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                );
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
