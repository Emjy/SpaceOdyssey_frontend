import React, { useState, useEffect } from 'react';

// Styles
import styles from '../styles/SagittarusA.module.css';

export default function SagittarusA(props) {

    const [coef, setCoef] = useState(1);


    return (
        <div className={styles.page}>
            <div
                onClick={() => {
                    props.setFocusSA(prevState => !prevState);
                    props.focusSagittarusA()
                }}
                style={{ zIndex: props.indexSa }}
            >
                <div className={styles.containerImage}>
                    <img src='sagittarusA.jpeg' className={styles.image}
                        style={{
                            opacity: props.opacity,
                            width: `${props.size * coef}px`,
                            height: `${props.size * coef}px`,
                            transition: `transform 0.5s ease, width 0.5s ease-out, height 0.5s ease-out, opacity 1s ease`,
                            cursor: 'pointer',
                            zIndex: props.indexSa

                        }}

                        onMouseEnter={() => setCoef(1.2)}
                        onMouseLeave={() => setCoef(1)}
                    />
                    <div className={styles.overlay} style={{ height: `${props.size}px`, width: `${props.size}px` }}></div>

                </div>
                
            </div>
        </div>
    )
}
