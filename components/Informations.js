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
import PublicIcon from '@mui/icons-material/Public';
import FlareIcon from '@mui/icons-material/Flare';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';

export default function Informations(props) {

    const [contentHeight, setContentHeight] = useState(0);
    const [contentWidth, setContentWidth] = useState(0);
    const [hoveredIndices, setHoveredIndices] = useState([]);

    const[open, setOpen] =useState(true)

    const contentRef = useRef(null);

    useEffect(() => {
        // Mettre à jour la hauteur du contenu lorsqu'il change
        setContentHeight(contentRef.current.clientHeight);
        setContentWidth(contentRef.current.clientWidth);
    }, [props.infos]);

    const handleMouseEnter = (index) => {
        setHoveredIndices(prevIndices => [...prevIndices, index]);
    };

    const handleMouseLeave = (index) => {
        setHoveredIndices(prevIndices => prevIndices.filter(i => i !== index));
    };


    const infoItems = Object.entries(props.infos).map(([key, value], index) => {
        // Si la masse n'existe pas 
        if (key === "mass" && value === null) {
            return;
        }
        // Vérifier si la valeur est supérieure à zéro pour afficher le composant
        if (value > 0 || (key === 'mass' && value.massValue > 0) || value) {
            // Créer dynamiquement le composant en fonction de la clé
            let iconComponent;
            let infoName;

            switch (key) {
                case 'mass':
                    infoName = 'Mass';
                    iconComponent = <FitnessCenterIcon />;
                    value = `${value.massValue.toFixed(2)} x 10e${value.massExponent} kg`;
                    break;
                case 'meanRadius':
                    infoName = 'Mean radius';
                    iconComponent = <DonutSmallRoundedIcon />;
                    value = `${value} km`;
                    break;
                case 'gravity':
                    infoName = 'Surface gravity';
                    iconComponent = <PlayForWorkRoundedIcon />;
                    value = `${value} m.s-2`;
                    break;
                case 'density':
                    infoName = 'Density';
                    iconComponent = <BlurCircularRoundedIcon />;
                    value = `${value.toFixed(2)} g.cm3`;
                    break;
                case 'avgTemp':
                    infoName = 'Average temperature';
                    iconComponent = <DeviceThermostatRoundedIcon />;
                    value = `${(value - 273.15).toFixed(2)} °C`;
                    break;
                case 'sideralOrbit':
                    infoName = 'Sideral Orbit';
                    iconComponent = <RotateLeftRoundedIcon />;
                    value = `${(value / 365.242190).toFixed(3)} an(s)`;
                    break;
                case 'numberOfStars':
                    infoName = 'Number of stars';
                    iconComponent = <FlareIcon />;
                    value = `# ${value.toLocaleString('fr-FR') }`;
                    break;
                case 'numberOfPlanets':
                    infoName = 'Number of planets';
                    iconComponent = <PublicIcon />;
                    value = `# ${value.toLocaleString('fr-FR') }`;
                    break;
                case 'discoveredBy':
                    infoName = 'Discover by';
                    iconComponent = <PersonRoundedIcon />;
                    value = `${value}`;
                    break;
                case 'discoveryDate':
                    infoName = 'Discovery date';
                    iconComponent = <TodayRoundedIcon />;
                    value = `${value}`;
                    break;
                default:
                    iconComponent = null;
                    value = null;
                    break;
            }

            // Rendu du composant dynamique
            return (
                <>
                    {value &&
                        <div
                            key={index}
                            className={styles.element}
                        >
                            <div className={styles.icon}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={() => handleMouseLeave(index)}>
                                {iconComponent}
                            </div>
                            {hoveredIndices.includes(index) ? infoName : value}
                        </div >
                    }

                </>


            );
        }

        return null; // Si la valeur est inférieure ou égale à zéro, ne rien afficher
    });


    return (
        <div
            className={styles.container}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: `18vw`,
                minWidth: `180px`,
                height: open ?`${contentHeight + 35}px` : '4.3em',
                opacity: `${contentHeight}`,
                color: 'rgba(255,255,255, 0.5)',
                borderRadius: '32px',
                padding: '16px',
                transition: `width 0.5s ease-in, height 0.5s ease-in, font-size 0.5s ease `,
            }}>

            <div className={styles.infos} ref={contentRef}>
                <div className={styles.title}
                onClick={() => setOpen(!open)}>
                    {props.infos.bodyType + ' : ' + props.infos.englishName}
                </div>

               {open && <div className={styles.content} style={{ overflow: 'auto' }}>
                    {infoItems}
                </div>}

            </div>

        </div>
    )
}
