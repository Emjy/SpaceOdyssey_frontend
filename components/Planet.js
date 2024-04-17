import React, { useState, useEffect } from 'react';

// Composants 
import Moon from './Moon';

export default function Planet(props) {

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

    let nOrb = 0;

    const [moons, setMoons] = useState([]);

    useEffect(() => {

        fetch(`http://localhost:3000/bodies/moons/${props.name}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setMoons(data.moons);
                }
            });

    }, [props.name]);

    const selectedMoons = moons.slice(0, props.nbMoons).map((item, index) => {

        orbit += spacing;
        nOrb += 1

        let vitesse = item.sideralOrbit < 5 ? 5 : item.sideralOrbit;

        if (props.nbMoons === 8) {
            vitesse = item.sideralOrbit * 10;
        }
        if (props.nbMoons === 1) {
            vitesse = item.sideralOrbit * 100;
        }

        return (
            <Moon
                key={item.id}
                moonOrbit={orbit}
                moonSize={props.planetSize / 5}
                moon={item.id}
                nOrb={nOrb}
                vitesseMoon={vitesse}
                moonSelected={props.moonSelected}
                focus={props.focus}
            />);
    });

    return (
        <div
            style={{
                width: `${props.orbitSize}px`,
                height: `${props.orbitSize}px`,
                borderTop: 'solid rgba(255, 255, 255, 0.2) 1px',
                boxSizing: 'border-box',
                borderRadius: '50%',
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `orbit${props.nOrb} ${props.vitesse}s linear infinite`,
                transition: `width 0.2s ease-in, height 0.2s ease-in, opacity 0.2s ease-out`,
                opacity: props.orbitSize,
                cursor:'pointer', 
            }}
            onClick={() => props.focusPlanet(props.name)}
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



            }}>

                <img src={`planets/${props.name}.png`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: '1',
                    }}
                />


                {selectedMoons}

            </div>
        </div >
    )
}
