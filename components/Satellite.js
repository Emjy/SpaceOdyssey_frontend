import React from 'react'

//Style 
import styles from '../styles/Satellite.module.css';

export default function Satellite() {
    return (
        <div className={styles.page}>
            <div className={styles.imageContainer}>
                <img src='satellites/ISS.png' className={styles.image}  />
            </div>

            <div className={styles.imageContainer}>
                <img src='satellites/voyager1.png' className={styles.image} />

            </div>
            <div className={styles.imageContainer}>
                <img src='satellites/voyager2.png' className={styles.image} />

            </div>
        </div>

    )
}
