import React from 'react'

// Styles
import styles from '../styles/Informations.module.css';

export default function Informations(props) {

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: 'auto',
                height: 'auto',
                backgroundColor: 'rgba(255,255,255, 0.08)',
                color: 'rgba(255,255,255, 0.5)',
                borderRadius: '32px',
                overflow: 'auto',
                padding: '16px'
            }}>

            <div className={styles.infos}>
                <div style={{ color: 'rgba(255,255,255,1)', paddingBottom: '16px' }}>
                    {props.infos.englishName + ' - ' + props.infos.bodyType}
                </div>

                <div>
                    <strong>Mass : </strong>
                    {props.infos.mass.massValue.toFixed(2) + ` x 10e${props.infos.mass.massExponent} kg`}
                </div>

                {props.infos.meanRadius > 0 && <div >
                    <strong>Rayon moyen: </strong>
                    {props.infos.meanRadius.toFixed(0) + ` km`}
                </div>}

                {props.infos.gravtity > 0 && <div>
                    <strong>Surface Gravity : </strong>
                    {props.infos.gravity + ' m.s-2'}
                </div>}

                {props.infos.density  > 0 && <div>
                    <strong>Density : </strong>
                    {props.infos.density + ' g.cm3'}
                </div>}

                {props.infos.avgTemp > 0 && <div>
                    <strong>Average temperature : </strong>
                    {(props.infos.avgTemp - 273.15).toFixed(2) + ' °C'}
                </div>}

                {props.infos.sideralOrbit > 0 && <div>
                    <strong>Temps de rotation : </strong>
                    {(props.infos.sideralOrbit / 365.242190).toFixed(2) + ' an(s)'}
                </div>}
            </div>
        </div>
    )
}
