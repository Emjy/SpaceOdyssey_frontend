import React from 'react'

//Style 
import styles from '../styles/HomePage.module.css';

export default function Footer(props) {
    return (
        <div className={styles.footer}>
            <div className={styles.element}>
                <div>
                    {'Rotation'}
                </div>
                <div>
                    {`Planets : ${props.vitesse} / Moons : ${props.vitesse}`}
                </div>
            </div>
            <div className={styles.element}>
                |
            </div>

            <div className={styles.element}>
                <div>
                    {'Size'}
                </div>
                <div>
                    {`Planets : ${props.size} / Moons : ${props.size}`}
                </div>
            </div>

        </div>)
}
