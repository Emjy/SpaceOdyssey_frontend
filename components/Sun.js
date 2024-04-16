import React, { useState, useEffect } from 'react';

// Styles
import styles from '../styles/Sun.module.css'; // Assurez-vous que le chemin d'accès est correct

export default function Sun(props) {

    const [sunSize, setSunSize] = useState(props.sunSize);

    useEffect(() => {
        setSunSize(props.sunSize);
    }, [props.sunSize]);

    return (
        <div className={styles.sunStyle} style={{ height: `${sunSize}px`, width: `${sunSize}px`, zIndex: props.indexSun }}>
            <video
                src="sun.mp4"
                className={styles.video}
                autoPlay loop muted
            />
            <div className={styles.videoOverlay} style={{ height: `${sunSize}px`, width: `${sunSize}px` }}></div>
        </div>
    )
}
