'use client';

import React, { useMemo, useState } from 'react';
import styles from '../styles/Informations.module.css';
import { MdToday, MdPublic, MdPerson, MdRotateLeft, MdDeviceThermostat, MdDonutSmall, MdBlurCircular, MdPlayArrow } from 'react-icons/md';
import { GiWeight } from 'react-icons/gi';

const FIELD_CONFIG = {
    mass: {
        label: 'Mass',
        icon: <GiWeight />,
        format: (value) => `${value.massValue.toFixed(2)} x 10e${value.massExponent} kg`,
    },
    meanRadius: {
        label: 'Mean radius',
        icon: <MdDonutSmall />,
        format: (value) => `${value.toLocaleString('fr-FR')} km`,
    },
    gravity: {
        label: 'Surface gravity',
        icon: <MdPlayArrow />,
        format: (value) => `${value} m.s-2`,
    },
    density: {
        label: 'Density',
        icon: <MdBlurCircular />,
        format: (value) => `${value.toFixed(2)} g.cm3`,
    },
    avgTemp: {
        label: 'Average temperature',
        icon: <MdDeviceThermostat />,
        format: (value) => `${(value - 273.15).toFixed(1)} °C`,
    },
    sideralOrbit: {
        label: 'Orbital period',
        icon: <MdRotateLeft />,
        format: (value) => value >= 365 ? `${(value / 365.24219).toFixed(2)} years` : `${value.toFixed(2)} days`,
    },
    numberOfStars: {
        label: 'Stars',
        icon: <MdPublic />,
        format: (value) => value.toLocaleString('fr-FR'),
    },
    numberOfPlanets: {
        label: 'Planets',
        icon: <MdPublic />,
        format: (value) => value.toLocaleString('fr-FR'),
    },
    discoveredBy: {
        label: 'Discovered by',
        icon: <MdPerson />,
        format: (value) => value,
    },
    discoveryDate: {
        label: 'Discovery date',
        icon: <MdToday />,
        format: (value) => value,
    },
};

export default function Informations({ infos }) {
    const [open, setOpen] = useState(true);

    const infoItems = useMemo(
        () =>
            Object.entries(FIELD_CONFIG)
                .map(([key, config]) => {
                    const value = infos?.[key];
                    if (!value || (key === 'mass' && !value.massValue)) {
                        return null;
                    }

                    return {
                        key,
                        label: config.label,
                        icon: config.icon,
                        value: config.format(value),
                    };
                })
                .filter(Boolean),
        [infos]
    );

    return (
        <div className={styles.container}>
            <button className={styles.title} onClick={() => setOpen((prev) => !prev)} type="button">
                <span className={styles.titleMeta}>{infos.bodyType || 'Object'}</span>
                <span className={styles.titleName}>{infos.englishName || infos.name}</span>
            </button>

            {open && (
                <div className={styles.content}>
                    <div className={styles.summary}>
                        <div className={styles.summaryLabel}>Selected target</div>
                        <div className={styles.summaryValue}>{infos.id}</div>
                    </div>

                    <div className={styles.grid}>
                        {infoItems.map((item) => (
                            <div key={item.key} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.icon}>{item.icon}</span>
                                    <span className={styles.cardLabel}>{item.label}</span>
                                </div>
                                <div className={styles.cardValue}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
