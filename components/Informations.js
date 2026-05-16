'use client';

import React, { useMemo, useState } from 'react';
import styles from '../styles/Informations.module.css';
import useWikipedia from '../hooks/useWikipedia';
import useNasaMedia from '../hooks/useNasaMedia';
import InfinityLoader from './InfinityLoader';

const EARTH = { massKg: 5.972e24, radiusKm: 6371 };
const SUN   = { massKg: 1.989e30, radiusKm: 696340 };

function fmt(n, digits = 2) {
    return n.toLocaleString('fr-FR', { maximumFractionDigits: digits });
}

function fmtMass(v) {
    const kg = v.massValue * Math.pow(10, v.massExponent);
    const isStar = v.massExponent >= 29;
    const ref = isStar ? SUN.massKg : EARTH.massKg;
    const refName = isStar ? 'fois la masse du Soleil' : 'fois la masse de la Terre';
    const ratio = kg / ref;
    if (ratio < 0.001) return `${fmt(ratio * 1000, 2)}‰ de la masse de la Terre`;
    if (ratio < 1000) return `${fmt(ratio, 2)} ${refName}`;
    return `${fmt(ratio, 0)} ${refName}`;
}

function fmtRadius(v, bodyType) {
    const isStar = bodyType === 'Star';
    const ref = isStar ? SUN.radiusKm : EARTH.radiusKm;
    const refName = isStar ? 'fois le rayon du Soleil' : 'fois la taille de la Terre';
    const ratio = v / ref;
    const ratioStr = ratio < 0.01 ? `${fmt(ratio * 1000, 1)}‰` : fmt(ratio, 2);
    return `${v.toLocaleString('fr-FR')} km  (${ratioStr} ${refName})`;
}

function fmtOrbit(v) {
    if (v >= 365 * 2) return `${fmt(v / 365.24219, 2)} ans`;
    if (v >= 1)       return `${fmt(v, 1)} j`;
    return `${fmt(v * 24, 1)} h`;
}

function fmtGalaxyMass(m) {
    const ref = 'fois la masse du Soleil';
    if (m >= 1e12) return `${fmt(m / 1e12, 2)} billions de ${ref}`;
    if (m >= 1e9)  return `${fmt(m / 1e9, 0)} milliard${m >= 2e9 ? 's' : ''} de ${ref}`;
    if (m >= 1e6)  return `${fmt(m / 1e6, 0)} million${m >= 2e6 ? 's' : ''} de ${ref}`;
    return `${m.toLocaleString('fr-FR')} ${ref}`;
}

function fmtStarCount(n) {
    if (n >= 1e12) return `${fmt(n / 1e12, 2)} billion d'étoiles`;
    if (n >= 1e9)  return `${fmt(n / 1e9, 0)} milliard${n >= 2e9 ? 's' : ''} d'étoiles`;
    if (n >= 1e6)  return `${fmt(n / 1e6, 0)} million${n >= 2e6 ? 's' : ''} d'étoiles`;
    return `${n.toLocaleString('fr-FR')} étoiles`;
}

function fmtDistance(mly) {
    if (mly >= 1000) return `${fmt(mly / 1000, 2)} milliards d'années-lumière`;
    return `${fmt(mly, 1)} millions d'années-lumière`;
}

function fmtAngularSize(majorDeg, minorDeg) {
    if (!Number.isFinite(majorDeg) || majorDeg <= 0) return null;
    // La Lune pleine mesure environ 0,5° de diamètre apparent
    const moonRatio = majorDeg / 0.5;
    const major = majorDeg * 60;
    const minor = Number.isFinite(minorDeg) && minorDeg > 0 ? minorDeg * 60 : null;
    const arcStr = minor ? `${fmt(major, 1)}′ × ${fmt(minor, 1)}′` : `${fmt(major, 1)}′`;
    if (moonRatio >= 0.1) {
        return `${fmt(moonRatio, 1)}× la Lune pleine (${arcStr})`;
    }
    return arcStr;
}

const BODY_TYPE_FR = {
    'Star': 'Étoile', 'Exoplanet': 'Exoplanète', 'Planet': 'Planète',
    'Moon': 'Lune', 'Asteroid': 'Astéroïde', 'Black Hole': 'Trou noir', 'Galaxy': 'Galaxie',
};

// Noms français connus pour les objets spéciaux
const FR_NAMES = {
    milkyWay: 'Voie Lactée',
    andromeda: "Galaxie d'Andromède",
    soleil: 'Soleil',
    sagittariusA: 'Sagittarius A*',
};

function buildRows(infos) {
    const rows = [];
    const add = (label, value) => { if (value != null) rows.push({ label, value }); };

    if (infos.avgTemp != null) {
        const c = (infos.avgTemp - 273.15).toFixed(0);
        add('Température', `${c} °C`);
    }
    if (infos.meanRadius)    add('Rayon', fmtRadius(infos.meanRadius, infos.bodyType));
    if (infos.mass?.massValue) add('Masse', fmtMass(infos.mass));
    if (infos.gravity)       add('Gravité', `${infos.gravity} m/s²  (${fmt(infos.gravity / 9.807, 2)}× Terre)`);
    if (infos.density)       add('Densité', `${Number(infos.density).toFixed(2)} g/cm³  (eau = 1,00)`);
    if (infos.sideralOrbit)  add('Période orb.', fmtOrbit(infos.sideralOrbit));
    if (infos.sideralRotation) {
        const h = infos.sideralRotation;
        add('Rotation', Math.abs(h) >= 48 ? `${fmt(h / 24, 1)} j` : `${fmt(h, 1)} h`);
    }
    if (infos.numberOfStars)   add('Étoiles', infos.numberOfStars.toLocaleString('fr-FR'));
    if (infos.numberOfPlanets) add('Planètes', infos.numberOfPlanets.toLocaleString('fr-FR'));
    if (infos.bodyType === 'Galaxy') {
        if (infos.starCount != null) add('Étoiles', fmtStarCount(infos.starCount));
        if (infos.massSolarMasses != null) add('Masse', fmtGalaxyMass(infos.massSolarMasses));
        if (infos.distanceMly != null) add('Distance', fmtDistance(infos.distanceMly));
        if (infos.sizeKly != null) {
            const ly = infos.sizeKly * 1000;
            const sizeStr = ly >= 1e6
                ? `${fmt(ly / 1e6, 2)} millions d'années-lumière`
                : `${fmt(ly / 1000, 0)} milliers d'années-lumière`;
            add('Taille physique', sizeStr);
        }
        if (infos.majorAxisDeg) add('Taille apparente', fmtAngularSize(infos.majorAxisDeg, infos.minorAxisDeg));
    }
    if (infos.discoveredBy)    add('Découvert par', infos.discoveredBy);
    if (infos.discoveryDate)   add('Découverte', infos.discoveryDate);
    if (infos.sy_dist)         add('Distance', `${fmt(infos.sy_dist * 3.2616, 0)} années-lumière`);
    return rows;
}

function getWikiNames(infos) {
    const englishName = infos.englishName ?? infos.name ?? null;
    const bodyType = infos.bodyType ?? '';

    if (bodyType === 'Moon' && englishName) {
        const hostPlanet = infos.aroundPlanet?.planet ?? infos.aroundPlanet?.englishName ?? null;
        const moonFr = hostPlanet ? `${englishName} (lune)` : `${englishName} (satellite naturel)`;
        const moonEn = hostPlanet ? `${englishName} (moon)` : `${englishName} (natural satellite)`;
        return { frName: moonFr, enName: moonEn };
    }

    if (bodyType === 'Planet' && englishName) {
        return { frName: FR_NAMES[infos.id] ?? infos.name ?? null, enName: englishName };
    }

    if (bodyType === 'Galaxy' && englishName) {
        if (infos.id === 'milkyway') {
            return { frName: 'Voie Lactée', enName: 'Milky Way' };
        }
        if (infos.id === 'andromeda' || englishName === 'Andromeda') {
            return { frName: "Galaxie d'Andromède", enName: 'Andromeda Galaxy' };
        }
        const sourceId = infos.sourceId?.trim() || null;
        const displayName = infos.name?.trim() || null;
        const frenchName = displayName?.toLowerCase().startsWith('galaxie ')
            ? displayName
            : (FR_NAMES[infos.id] ?? displayName);
        return {
            frName: frenchName,
            enName: sourceId || (englishName.includes('Galaxy') ? englishName : `${englishName} Galaxy`),
        };
    }

    const frName = FR_NAMES[infos.id]
        ?? (infos.name && infos.name !== infos.englishName ? infos.name : null);
    const enName = englishName;
    return { frName, enName };
}

function buildEarthRows(infos) {
    const rows = [];
    const add = (label, value) => { if (value != null) rows.push({ label, value }); };
    if (infos.meanRadius)      add('Rayon / Terre',   `${(infos.meanRadius / 6371).toFixed(2)}×`);
    if (infos.mass?.massValue) {
        const kg = infos.mass.massValue * Math.pow(10, infos.mass.massExponent);
        add('Masse / Terre', `${(kg / 5.972e24).toFixed(2)}×`);
    }
    if (infos.gravity)         add('Gravité / Terre', `${(infos.gravity / 9.807).toFixed(2)}×`);
    return rows;
}

function getNasaUrl(infos) {
    if (infos.bodyType === 'Exoplanet') {
        return `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(infos.englishName)}`;
    }
    if (infos.bodyType === 'Star' && infos.isExoplanet) {
        return `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(infos.englishName)}`;
    }
    return null;
}

export default function Informations({ infos }) {
    const rows = useMemo(() => buildRows(infos), [infos]);
    const bodyTypeFr = BODY_TYPE_FR[infos.bodyType] ?? infos.bodyType ?? 'Objet';

    const [compareEarth, setCompareEarth] = useState(false);
    const earthRows = useMemo(() => compareEarth ? buildEarthRows(infos) : [], [compareEarth, infos]);
    const showCompareToggle = !['Galaxy', 'Black Hole'].includes(infos.bodyType);

    const { frName, enName } = useMemo(() => getWikiNames(infos), [infos]);
    const { result: wiki, loading: wikiLoading } = useWikipedia(frName, enName);
    const { result: nasaMedia, loading: nasaLoading } = useNasaMedia(infos);
    const nasaUrl = useMemo(() => getNasaUrl(infos), [infos]);
    const mediaThumb = infos.bodyType === 'Galaxy'
        ? null
        : wiki?.thumbnail;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.type}>{bodyTypeFr}</span>
                <span className={styles.name}>{infos.englishName || infos.name}</span>
                {showCompareToggle && (
                    <button
                        type="button"
                        className={`${styles.compareBtn} ${compareEarth ? styles.compareBtnActive : ''}`}
                        onClick={() => setCompareEarth(v => !v)}
                        aria-label="Comparer à la Terre"
                    >
                        ⊕
                    </button>
                )}
            </div>

            {(rows.length > 0 || earthRows.length > 0) && (
                <div className={styles.rows}>
                    {rows.map(({ label, value }) => (
                        <div key={label} className={styles.row}>
                            <span className={styles.rowLabel}>{label}</span>
                            <span className={styles.rowValue}>{value}</span>
                        </div>
                    ))}
                    {earthRows.length > 0 && (
                        <>
                            <div className={styles.rowDivider} />
                            {earthRows.map(({ label, value }) => (
                                <div key={label} className={`${styles.row} ${styles.rowEarth}`}>
                                    <span className={styles.rowLabel}>{label}</span>
                                    <span className={styles.rowValue}>{value}</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {(wiki || wikiLoading || nasaUrl || nasaMedia || nasaLoading) && (
                <div className={styles.wikiSection}>
                    {mediaThumb && (
                        <img
                            className={styles.wikiThumb}
                            src={mediaThumb}
                            alt=""
                            aria-hidden="true"
                        />
                    )}
                    {(wikiLoading || nasaLoading) && !mediaThumb && !wiki && (
                        <div className={styles.wikiSkeleton}>
                            <InfinityLoader size={36} />
                        </div>
                    )}
                    {wiki?.extract && (
                        <p className={styles.wikiExtract}>{wiki.extract}</p>
                    )}
                    <div className={styles.wikiLinks}>
                        {nasaMedia?.url && (
                            <a
                                href={nasaMedia.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.wikiLink}
                            >
                                NASA Image Library →
                            </a>
                        )}
                        {wiki?.url && (
                            <a
                                href={wiki.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.wikiLink}
                            >
                                Wikipédia {wiki.lang === 'fr' ? 'FR' : 'EN'} →
                            </a>
                        )}
                        {nasaUrl && (
                            <a
                                href={nasaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.wikiLink}
                            >
                                NASA Exoplanet Archive →
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
