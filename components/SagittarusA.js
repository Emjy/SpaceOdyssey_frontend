import React, { useState, useEffect } from 'react';

// Styles
import styles from '../styles/MilkyWay.module.css';

export default function SagittarusA(props) {

    return (
        <div className={styles.page}>
            <div
                onClick={() => {
                    props.setFocusSA(prevState => !prevState);
                    props.focusSagittarusA()
                }}
                style={{ zIndex: props.indexSa }}
            >
                <img src='sagittarusA.jpeg' className={styles.image}
                    style={{
                        opacity: props.opacity,
                        width: props.size,
                        height: props.size,
                        transition: `opacity 2s ease-in-out, width 2s ease-in-out, height 2s ease-in-out`,
                        cursor: 'pointer',
                        zIndex: props.indexSa  

                    }}
                />
            </div>
        </div>
    )
}
