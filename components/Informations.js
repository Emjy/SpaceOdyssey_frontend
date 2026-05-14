'use client';

import React, { useMemo } from 'react';
import styles from '../styles/Informations.module.css';

const EARTH = { massKg: 5.972e24, radiusKm: 6371 };
const SUN   = { massKg: 1.989e30, radiusKm: 696340 };

function fmt(n, digits = 2) {
    return n.toLocaleString('fr-FR', { maximumFractionDigits: digits });
}

function fmtMass(v) {
    const kg = v.massValue * Math.pow(10, v.massExponent);
    const isStar = v.massExponent >= 29;
    const ref = isStar ? SUN.massKg : EARTH.massKg;
    const refName = isStar ? 'M☉' : 'M⊕';
    const ratio = kg / ref;
    if (ratio < 0.001) return `${fmt(ratio * 1000, 2)}‰ ${refName}`;
    if (ratio < 1000) return `${fmt(ratio, 2)} ${refName}`;
    return `${fmt(ratio, 0)} ${refName}`;
}

function fmtRadius(v, bodyType) {
    const isStar = bodyType === 'Star';
    const ref = isStar ? SUN.radiusKm : EARTH.radiusKm;
    const refName = isStar ? 'R☉' : 'R⊕';
    const ratio = v / ref;
    const ratioStr = ratio < 0.01 ? `${fmt(ratio * 1000, 1)}‰` : `${fmt(ratio, 2)}`;
    return `${v.toLocaleString('fr-FR')} km  ·  ${ratioStr} ${refName}`;
}

function fmtOrbit(v) {
    if (v >= 365 * 2) return `${fmt(v / 365.24219, 2)} ans`;
    if (v >= 1)       return `${fmt(v, 1)} j`;
    return `${fmt(v * 24, 1)} h`;
}

const BODY_TYPE_FR = {
    'Star': 'Étoile', 'Exoplanet': 'Exoplanète', 'Planet': 'Planète',
    'Moon': 'Lune', 'Asteroid': 'Astéroïde', 'Black Hole': 'Trou noir', 'Galaxy': 'Galaxie',
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
    if (infos.gravity)       add('Gravité', `${infos.gravity} m/s²`);
    if (infos.density)       add('Densité', `${Number(infos.density).toFixed(2)} g/cm³`);
    if (infos.sideralOrbit)  add('Période orb.', fmtOrbit(infos.sideralOrbit));
    if (infos.sideralRotation) {
        const h = infos.sideralRotation;
        add('Rotation', Math.abs(h) >= 48 ? `${fmt(h / 24, 1)} j` : `${fmt(h, 1)} h`);
    }
    if (infos.numberOfStars)   add('Étoiles', infos.numberOfStars.toLocaleString('fr-FR'));
    if (infos.numberOfPlanets) add('Planètes', infos.numberOfPlanets.toLocaleString('fr-FR'));
    if (infos.discoveredBy)    add('Découvert par', infos.discoveredBy);
    if (infos.discoveryDate)   add('Découverte', infos.discoveryDate);
    if (infos.sy_dist)         add('Distance', `${fmt(infos.sy_dist, 1)} al`);
    return rows;
}

export default function Informations({ infos }) {
    const rows = useMemo(() => buildRows(infos), [infos]);
    const bodyTypeFr = BODY_TYPE_FR[infos.bodyType] ?? infos.bodyType ?? 'Objet';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.type}>{bodyTypeFr}</span>
                <span className={styles.name}>{infos.englishName || infos.name}</span>
            </div>
            {rows.length > 0 && (
                <div className={styles.rows}>
                    {rows.map(({ label, value }) => (
                        <div key={label} className={styles.row}>
                            <span className={styles.rowLabel}>{label}</span>
                            <span className={styles.rowValue}>{value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
