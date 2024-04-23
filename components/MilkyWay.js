import React, { useState, useEffect, useRef } from 'react';

// Styles
import styles from '../styles/MilkyWay.module.css';

// Mui 
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';

export default function MilkyWay(props) {

    const [hovered, setHovered] = useState(false)

    return (
        <div className={styles.page}>
            <div className={styles.containerImage}
                onMouseEnter={() => setHovered(true)}
            >
                <img src='milkyway.jpeg'
                    className={styles.image}
                    style={{
                        opacity: props.size,
                        width: props.size,
                        height: props.size,
                        transition: `opacity 2s ease-in-out, width 2s ease-in-out, height 2s ease-in-out`,
                        animation: `orbit1 500s linear infinite`,
                        zIndex: '1'
                    }}
                />
            </div>

        </div>
    )
}