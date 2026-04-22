'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import Moon from './Moon';
const PlanetSphere = dynamic(() => import('./PlanetSphere'), { ssr: false });

import { fetchMoons } from '../functions/utils';
import styles from '../styles/Planet.module.css';

export default function Planet(props) {
    const [moons, setMoons] = useState([]);
    const [coef, setCoef] = useState(1);

    useEffect(() => {
        fetchMoons(props.name, setMoons);
    }, [props.name]);

    let orbit = 6;
    let spacing = 4;

    if (props.nbMoons === 1) { orbit = 80; spacing = 8; }
    if (props.nbMoons === 8) { orbit = 30; spacing = 8; }
    if (props.nbMoons === 4) { orbit = 4;  spacing = 1.2; }

    const mapMoons = moons.slice(0, props.nbMoons).map((item, index) => {
        orbit += spacing;
        let vitesse = item.sideralOrbit < 5 ? 5 : item.sideralOrbit;
        if (props.nbMoons === 8 || props.nbMoons === 1) vitesse = item.sideralOrbit * 100;

        return (
            <Moon
                key={item.id}
                moonOrbit={orbit}
                moonSize={props.planetSize / 7}
                name={item.id}
                planetName={props.name}
                nOrb={index + 1}
                vitesseMoon={vitesse}
                selectedMoon={props.selectedMoon}
                selectedPlanet={props.selectedPlanet}
                focus={props.focus}
                index={props.name === props.selectedPlanet ? 18 - index : 0}
                viewTilt={props.viewTilt}
                focusMoon={props.focusMoon}
                setFocusOnMoon={props.setFocusOnMoon}
            />
        );
    });

    return (
        // Anneau d'orbite — centré via left/top calc (pas de transform pour éviter le conflit avec l'animation)
        <div
            style={{
                width: `${props.orbitSize}vh`,
                height: `${props.orbitSize}vh`,
                borderTop: `solid rgba(255, 255, 255, ${props.orbitSize > 5 ? 0.2 : 0}) 1px`,
                boxSizing: 'border-box',
                borderRadius: '50%',
                position: 'absolute',
                left: `calc(50% - ${props.orbitSize / 2}vh)`,
                top: `calc(50% - ${props.orbitSize / 2}vh)`,
                animation: `orbit${props.nOrb} ${props.vitesse}s linear infinite`,
                transition: `width 0.4s ease-in-out, height 0.4s ease-in-out, left 0.4s ease-in-out, top 0.4s ease-in-out`,
                opacity: props.orbitSize > 0 ? 1 : 0,
                zIndex: `${props.index}`,
            }}
        >
            {/* Corps de la planète */}
            <div
                style={{
                    transform: `translate(-50%, -50%) translateX(${props.orbitSize / 2}vh) rotateX(${-props.viewTilt}deg)`,
                    borderRadius: '50%',
                    width: `${props.planetSize * coef}vh`,
                    height: `${props.planetSize * coef}vh`,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transition: `transform 1s ease-in, width 0.2s ease-out, height 0.2s ease-out`,
                    cursor: 'pointer',
                    zIndex: `${props.index}`,
                }}
                onClick={(event) => {
                    props.setFocusOnPlanet(prevState => !prevState);
                    props.focusPlanet(props.name);
                    event.stopPropagation();
                }}
                onMouseEnter={() => setCoef(1.2)}
                onMouseLeave={() => setCoef(1)}
            >
                <PlanetSphere name={props.name} />
                <div>{mapMoons}</div>
            </div>
        </div>
    );
}
