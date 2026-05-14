'use client';

import React, { useMemo, useState } from 'react';
import styles from '../styles/Informations.module.css';
import {
    MdToday, MdPublic, MdPerson, MdRotateLeft, MdDeviceThermostat,
    MdDonutSmall, MdBlurCircular, MdPlayArrow, MdStar, MdTerrain,
} from 'react-icons/md';
import { GiWeight } from 'react-icons/gi';

const EARTH = { massKg: 5.972e24, radiusKm: 6371 };
const SUN   = { massKg: 1.989e30, radiusKm: 696340 };

function fmt(n, digits = 2) {
    return n.toLocaleString('fr-FR', { maximumFractionDigits: digits });
}

function comparisonStr(value, key, bodyType) {
    if (key === 'meanRadius') {
        const isStar = bodyType === 'Star';
        const ref = isStar ? SUN.radiusKm : EARTH.radiusKm;
        const refName = isStar ? 'Soleil' : 'Terre';
        const ratio = value / ref;
        if (ratio < 0.01) return `${fmt(ratio * 1000, 1)}‰ ${refName}`;
        if (ratio < 100) return `${fmt(ratio, 2)}× ${refName}`;
        return `${fmt(ratio, 0)}× ${refName}`;
    }
    if (key === 'mass') {
        const valKg = value.massValue * Math.pow(10, value.massExponent);
        const isStar = value.massExponent >= 29;
        const ref = isStar ? SUN.massKg : EARTH.massKg;
        const refName = isStar ? 'Soleil' : 'Terre';
        const ratio = valKg / ref;
        if (ratio < 0.01) return `${fmt(ratio * 1000, 1)}‰ ${refName}`;
        if (ratio < 1000) return `${fmt(ratio, 2)}× ${refName}`;
        return `${fmt(ratio, 0)}× ${refName}`;
    }
    return null;
}

const FIELD_CONFIG = {
    mass: {
        label: 'Masse',
        icon: <GiWeight />,
        format: (v) => `${v.massValue.toFixed(2)} × 10^${v.massExponent} kg`,
    },
    meanRadius: {
        label: 'Rayon moyen',
        icon: <MdDonutSmall />,
        format: (v) => `${v.toLocaleString('fr-FR')} km`,
    },
    gravity: {
        label: 'Gravité de surface',
        icon: <MdPlayArrow />,
        format: (v) => `${v} m/s²`,
    },
    density: {
        label: 'Densité',
        icon: <MdBlurCircular />,
        format: (v) => `${v.toFixed(2)} g/cm³`,
    },
    avgTemp: {
        label: 'Température moy.',
        icon: <MdDeviceThermostat />,
        format: (v) => `${(v - 273.15).toFixed(0)} °C  (${v} K)`,
    },
    sideralOrbit: {
        label: 'Période orbitale',
        icon: <MdRotateLeft />,
        format: (v) => v >= 365 ? `${(v / 365.24219).toFixed(2)} ans` : `${v.toFixed(1)} jours`,
    },
    numberOfStars: {
        label: 'Étoiles',
        icon: <MdStar />,
        format: (v) => v.toLocaleString('fr-FR'),
    },
    numberOfPlanets: {
        label: 'Planètes',
        icon: <MdPublic />,
        format: (v) => v.toLocaleString('fr-FR'),
    },
    discoveredBy: {
        label: 'Découvert par',
        icon: <MdPerson />,
        format: (v) => v,
    },
    discoveryDate: {
        label: 'Date de découverte',
        icon: <MdToday />,
        format: (v) => v,
    },
};

const BODY_TYPE_FR = {
    'Star': 'Étoile',
    'Exoplanet': 'Exoplanète',
    'Planet': 'Planète',
    'Moon': 'Lune',
    'Asteroid': 'Astéroïde',
    'Black Hole': 'Trou noir',
    'Galaxy': 'Galaxie',
};

export default function Informations({ infos }) {
    const [open, setOpen] = useState(true);
    const bodyTypeFr = BODY_TYPE_FR[infos.bodyType] ?? infos.bodyType ?? 'Objet';

    const infoItems = useMemo(() =>
        Object.entries(FIELD_CONFIG)
            .map(([key, config]) => {
                const value = infos?.[key];
                if (!value && value !== 0) return null;
                if (key === 'mass' && !value.massValue) return null;
                const cmp = comparisonStr(value, key, infos.bodyType);
                return { key, label: config.label, icon: config.icon, value: config.format(value), comparison: cmp };
            })
            .filter(Boolean),
        [infos]
    );

    return (
        <div className={styles.container}>
            <button className={styles.title} onClick={() => setOpen(p => !p)} type="button">
                <span className={styles.titleMeta}>{bodyTypeFr}</span>
                <span className={styles.titleName}>{infos.englishName || infos.name}</span>
            </button>

            {open && (
                <div className={styles.content}>
                    <div className={styles.grid}>
                        {infoItems.map((item) => (
                            <div key={item.key} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.icon}>{item.icon}</span>
                                    <span className={styles.cardLabel}>{item.label}</span>
                                </div>
                                <div className={styles.cardValue}>{item.value}</div>
                                {item.comparison && (
                                    <div className={styles.cardComparison}>{item.comparison}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
