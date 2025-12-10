'use client';

import React, { useState, useEffect } from 'react';

// Styles
import styles from '../styles/Sun.module.css'; // Assurez-vous que le chemin d'accès est correct

export default function Sun(props) {

    const [sunSize, setSunSize] = useState(props.sunSize);
    const [coef, setCoef] = useState(1);


    useEffect(() => {
        setSunSize(props.sunSize);
    }, [props.sunSize]);


    return (

        <div
            style={{
                borderTop: 'solid rgba(255, 255, 255, 0.2) 1px',
                boxSizing: 'border-box',
                borderRadius: '50%',
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `orbit4 500s linear infinite`,
                transition: `width 1s ease-in, height 1s ease-in, opacity 1s ease-out`,
                zIndex: props.indexSun,
                cursor: 'pointer'
            }}
        >

            <div
                className={styles.sunStyle}
                style={{
                    transform: `translate(-50%, -50%) translateX(${props.orbit}vh)`,
                    borderRadius: '50%',
                    width: `${sunSize * coef}vh`,
                    height: `${sunSize * coef}vh`,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transition: `transform 0.5s ease, width 0.5s ease-out, height 0.5s ease-out`,

                }}

                onClick={() => {
                    props.setFocusSolarSystem(prevState => !prevState);
                    props.focusSolarSystem()
                }}
                onMouseEnter={() => setCoef(1.2)}
                onMouseLeave={() => setCoef(1)}
            >
                <video
                    src="sun.mp4"
                    className={styles.video}
                    autoPlay loop muted
                />
                <div className={styles.videoOverlay} style={{ height: `${sunSize * coef}vh`, width: `${sunSize * coef}vh` }}></div>

            </div>


        </div>
    )
}
