import React from 'react'

// Styles
import styles from '../styles/MilkyWay.module.css';

export default function MilkyWay(props) {
    return (
        <div className={styles.page}>
            <div className={styles.containerImage}>
                <img src='milkyway.jpeg' className={styles.image}
                    style={{
                        opacity: props.size,
                        width: props.size,
                        height: props.size,
                        transition: `opacity 2s ease-in-out, width 2s ease-in-out, height 2s ease-in-out`,
                        animation: `orbit1 500s linear infinite`,
                    }}
                />
            </div>
        </div>
    )
}