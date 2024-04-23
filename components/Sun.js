import React, { useState, useEffect } from 'react';

// Styles
import styles from '../styles/Sun.module.css'; // Assurez-vous que le chemin d'accès est correct

export default function Sun(props) {

    const [sunSize, setSunSize] = useState(props.sunSize);

    useEffect(() => {
        setSunSize(props.sunSize);
    }, [props.sunSize]);

    return (
        // <div className={styles.sunStyle} style={{ height: `${sunSize}px`, width: `${sunSize}px`, zIndex: props.indexSun }}>
        //     <video
        //         src="sun.mp4"
        //         className={styles.video}
        //         autoPlay loop muted
        //     />
        //     <div className={styles.videoOverlay} style={{ height: `${sunSize}px`, width: `${sunSize}px` }}></div>
        // </div>


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
                transition: `width 2s ease-in, height 2s ease-in, opacity 2s ease-out`,
                zIndex: props.indexSun,
                cursor: 'pointer'
            }}
        >

            <div
                className={styles.sunStyle}
                style={{
                    transform: `translate(-50%, -50%) translateX(${props.orbit}px)`,
                    borderRadius: '50%',
                    width: `${sunSize}px`,
                    height: `${sunSize}px`,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transition: `transform 2s ease-in, width 2s ease-in, height 2s ease-in`,

                }}

                onClick={() => {
                    props.setFocusSolarSystem(prevState => !prevState);
                    props.focusSolarSystem()
                }}
            >
                <video
                    src="sun.mp4"
                    className={styles.video}
                    autoPlay loop muted
                />
                <div className={styles.videoOverlay} style={{ height: `${sunSize}px`, width: `${sunSize}px` }}></div>

            </div>


        </div>
    )
}
