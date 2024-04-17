import React, { useState, useRef, useEffect } from 'react';

// Styles
import styles from '../styles/Informations.module.css';

// MUI
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DonutSmallRoundedIcon from '@mui/icons-material/DonutSmallRounded';
import BlurCircularRoundedIcon from '@mui/icons-material/BlurCircularRounded';
import DeviceThermostatRoundedIcon from '@mui/icons-material/DeviceThermostatRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import PlayForWorkRoundedIcon from '@mui/icons-material/PlayForWorkRounded';

export default function Informations(props) {

    const [contentHeight, setContentHeight] = useState(0);
    const [contentWidth, setContentWidth] = useState(0);

    const contentRef = useRef(null);

    useEffect(() => {
        // Mettre à jour la hauteur du contenu lorsqu'il change
        setContentHeight(contentRef.current.clientHeight);
        setContentWidth(contentRef.current.clientWidth);
    }, [props.infos]);


    console.log(contentWidth, contentHeight)

    return (
        <div
            className={styles.container}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: `300px`,
                height: `${contentHeight + 32}px`,
                opacity: `${contentHeight}`,
                color: 'rgba(255,255,255, 0.5)',
                borderRadius: '32px',
                padding: '16px',
                overflow: 'auto',
                transition: `width 1s ease-in, height 1s ease-in`,
            }}>

            <div className={styles.infos} ref={contentRef}>
                <div className={styles.title}>
                    {props.infos.englishName + ' - ' + props.infos.bodyType}
                </div>

                {props.infos.mass &&
                    <div className={styles.element}>
                        <div className={styles.icon}>
                            <FitnessCenterIcon />
                        </div>
                        {props.infos.mass.massValue.toFixed(2) + ` x 10e${props.infos.mass.massExponent} kg`}
                    </div>}

                {props.infos.meanRadius > 0 &&
                    <div className={styles.element}>
                        <div className={styles.icon}>
                            <DonutSmallRoundedIcon />
                        </div>
                        {props.infos.meanRadius.toFixed(0) + ` km`}
                    </div>}

                {props.infos.gravity > 0 &&
                    <div className={styles.element}>
                        <div className={styles.icon}>
                            <PlayForWorkRoundedIcon />
                        </div>
                        {props.infos.gravity + ' m.s-2'}
                    </div>
                }

                {props.infos.density > 0 &&
                    <div className={styles.element}>
                        <div className={styles.icon}>
                            <BlurCircularRoundedIcon />
                        </div>
                        {props.infos.density + ' g.cm3'}
                    </div>
                }

                {props.infos.avgTemp > 0 &&
                    <div className={styles.element}>
                        <div className={styles.icon}>
                            <DeviceThermostatRoundedIcon />
                        </div>
                        {(props.infos.avgTemp - 273.15).toFixed(2) + ' °C'}
                    </div>
                }

                {props.infos.sideralOrbit > 0 &&
                    <div className={styles.element}>
                        <div className={styles.icon}>
                            <RotateLeftRoundedIcon />
                        </div>
                        {(props.infos.sideralOrbit / 365.242190).toFixed(2) + ' an(s)'}
                    </div>
                }
            </div>

        </div>
    )
}
