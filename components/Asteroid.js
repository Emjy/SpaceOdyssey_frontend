'use client';

import React, { useState, useEffect } from 'react';

export default function Asteroid(props) {

    const [coef, setCoef] = useState(1);
    const [size, setSize] = useState(1);
    const [orbit, setOrbit] = useState(48);

    useEffect(() => {

        setSize(props.asteroidSize)
        setOrbit(props.orbitSize)

    }, [props]);

    return (
        <div
            style={{   
                borderTop: 'solid rgba(255, 255, 255, 0.5) 1px',
                boxSizing: 'border-box',
                borderRadius: '50%',
                position: 'absolute', 
                animation: `orbit${props.nOrb} ${props.vitesse}s linear infinite`,
                transition: `transform 0.5s ease, width 0.2s ease-in, height 0.2s ease-in`,
                opacity: `${orbit}`,
                zIndex: `${props.index}`,
            }}

        >
            <div
                style={{
                    transform: `translate(-50%, -50%) translateX(${orbit / 2}vh)`,
                    // borderRadius: '50%',
                    width: `${size * coef}vh`,
                    height: `${size * coef}vh`,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transition: `transform 1s ease-in, width 0.5s ease-in, height 0.5s ease-in`,
                    cursor: 'pointer',
                    zIndex: `${props.index}`,
                }}
                onClick={async (event) => {
                 props.setFocusOnAsteroid(prevState => !prevState)
                    props.setSelectedAsteroid(props.name)
                    await props.focusAsteroid(props.name)
                    event.stopPropagation()
                }}
                onMouseEnter={() => setCoef(1.3)}
                onMouseLeave={() => setCoef(1)}
            >

                <img src={`asteroids/${props.name}.png`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        zIndex: `${props.index}`,
                    }}

                />

                <div>
                
                </div>

            </div>
        </div >
    )
}
