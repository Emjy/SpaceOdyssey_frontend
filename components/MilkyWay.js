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
                    }}
                />
            </div>


            {/* {hovered && props.size &&
                <CenterFocusWeakIcon className={styles.button} />
            } */}

            {/* <div style={{
                borderRadius: '50%',
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `orbit4 500s linear infinite`,
                transition: `width 0.2s ease-in, height 0.2s ease-in, opacity 0.2s ease-out`,
                opacity: '1',
                zIndex: '4',

            }}>
                <div style={{
                    transform: `translate(-50%, -50%) translateX(180px)`,
                    borderRadius: '50%',
                    width: `50px`,
                    height: `50px`,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transition: `transform 2s ease-in, width 2s ease-in, height 2s ease-in`,

                }}>
                    <CenterFocusWeakIcon className={styles.button} />
                </div>
            </div> */}


        </div>
    )
}