'use client';

import React, { useState, useEffect } from 'react';

// Composants 
import Moon from './Moon';

// Fonctions
import { fetchMoons } from '../functions/utils';

// Styles
import styles from '../styles/Planet.module.css';

export default function Planet(props) {

    const [moons, setMoons] = useState([]);
    const [coef, setCoef] = useState(1);

    useEffect(() => {

        fetchMoons(props.name, setMoons)

    }, [props.name]);
    // if (props.name === props.selectedPlanet) {
    //     console.log("index planete", props.name, props.index)
    // }

    let orbit = 6;
    let spacing = 4;

    if (props.nbMoons === 1) {
        orbit = 80;
        spacing = 8;
    }

    if (props.nbMoons === 8) {
        orbit = 30;
        spacing = 8;
    }

    if (props.nbMoons === 4) {
        orbit = 4;
        spacing = 1.2;
    }

    // if (moons.length <= 2 ) {
    //     orbit = 1;
    //     spacing = 1.2; 
    // }

   

    const mapMoons = moons.slice(0, props.nbMoons).map((item, index) => {

        orbit += spacing;

        let vitesse = item.sideralOrbit < 5 ? 5 : item.sideralOrbit;

        if (props.nbMoons === 8 || props.nbMoons === 1) {
            vitesse = item.sideralOrbit * 100;
        }

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
                focusMoon={props.focusMoon}
                setFocusOnMoon={props.setFocusOnMoon}
            />);
    });

    return (
        <div
            style={{
                width: `${props.orbitSize}vh`,
                height: `${props.orbitSize}vh`,
                borderTop: 'solid rgba(255, 255, 255, 0.2) 1px',
                boxSizing: 'border-box',
                borderRadius: '50%',
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `orbit${props.nOrb} ${props.vitesse}s linear infinite`,
                transition: `transform 0.5s ease, width 0.2s ease-in, height 0.2s ease-in`,
                opacity: props.orbitSize,
                zIndex: `${props.index}`,
            }}

        >
            <div
                style={{
                    transform: `translate(-50%, -50%) translateX(${props.orbitSize / 2}vh)`,
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
                    props.setFocusOnPlanet(prevState => !prevState)
                    props.focusPlanet(props.name)
                    event.stopPropagation()

                }}
                onMouseEnter={() => setCoef(1.2)}
                onMouseLeave={() => setCoef(1)}
            >

                <img src={`planets/${props.name}${props.orbitSize === 1? '_north':''}.png`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: `${props.index}`,
                    }}

                />
                <div>
                    {mapMoons}
                </div>


            </div>
        </div >
    )
}
