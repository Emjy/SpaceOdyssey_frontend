import React, { useState, useEffect } from 'react';

// Composants 
import Moon from './Moon';

// Fonctions
import { fetchMoons } from '../functions/utils';


export default function Planet(props) {

    if (props.name === props.selectedPlanet) {
        console.log("index planete", props.name, props.index)

    }

    let orbit = 60;
    let spacing = 40;

    if (props.nbMoons === 1) {
        orbit = 500;
        spacing = 80;
    }

    if (props.nbMoons === 8) {
        orbit = 300;
        spacing = 80;
    }

    if (props.nbMoons === 4) {
        orbit = 30;
        spacing = 15;
    }


    const [moons, setMoons] = useState([]);

    useEffect(() => {

        fetchMoons(props.name, setMoons) 

    }, [props.name]);

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
                moonSize={props.planetSize / 5}
                name={item.id}
                planetName={props.name}
                nOrb={index + 1}
                vitesseMoon={vitesse}
                selectedMoon={props.selectedMoon}
                selectedPlanet={props.selectedPlanet}
                focus={props.focus}
                index={props.name === props.selectedPlanet ? 20 - props.index + index + 1 : 0}
                focusMoon={props.focusMoon}
                setFocusOnMoon={props.setFocusOnMoon}
            />);
    });

    return (
        <div
            style={{
                width: `${props.orbitSize}px`,
                height: `${props.orbitSize}px`,
                borderTop: 'solid rgba(255, 255, 255, 0.2) 2px',
                boxSizing: 'border-box',
                borderRadius: '50%',
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `orbit${props.nOrb} ${props.vitesse}s linear infinite`,
                transition: `width 0.2s ease-in, height 0.2s ease-in, opacity 0.2s ease-out`,
                opacity: props.orbitSize,
                zIndex: `${props.index}`,
            }}

        >
            <div style={{
                transform: `translate(-50%, -50%) translateX(${props.orbitSize / 2}px)`,
                borderRadius: '50%',
                width: `${props.planetSize}em`,
                height: `${props.planetSize}em`,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transition: `transform 2s ease-in, width 2s ease-in, height 2s ease-in`,
                cursor: 'pointer',
                zIndex: `${props.index}`,
            }}
                onClick={(event) => {
                    props.setFocusOnPlanet(prevState => !prevState)
                    props.focusPlanet(props.name)
                    event.stopPropagation()
                }} 

            >

                <img src={`planets/${props.name}.png`}
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
