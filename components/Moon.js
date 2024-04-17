import React, { useState, useEffect } from 'react';

export default function Moon(props) {

    // Faire random 1 4 pour orbit moons  ou props de 1 a 4 
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false)
    }, [props])

    return (
        <>
            {props.focus === false ?
                <>
                    <div style={{
                        borderTop: `solid rgba(255, 255, 255, ${props.moonSize < 0.4 ? 0.08 : 0.2}) 1px`,
                        boxSizing: 'border-box',
                        borderRadius: '50%',
                        position: 'absolute',
                        width: `${props.moonOrbit}px`,
                        height: `${props.moonOrbit}px`,
                        left: `calc(50% - ${props.moonOrbit / 2}px)`, // Centrer l'orbite de la lune autour de la planète
                        top: `calc(50% - ${props.moonOrbit / 2}px)`,
                        animation: `orbit${props.nOrb} ${props.vitesseMoon}s linear infinite`,
                        transition: `width 2s ease-in, height 2s ease-in, opacity 2s ease-out`,

                    }}>
                        <div style={{
                            borderRadius: '50%',
                            width: `${props.moonSize}em`,
                            height: `${props.moonSize}em`,
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translateX(${props.moonOrbit * 0.5}px)`,
                            transition: `width 2s ease-in, height 2s ease-in, opacity 2s ease-out`,
                        }}>

                            <img
                                src={`moons/${imageError ? 'noimage' : props.moonSelected ? props.moonSelected : props.moon}.png`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    zIndex: '0',
                                    transition: `width 2s ease-in, height 2s ease-in, opacity 2s ease-out`,
                                    opacity: imageError ? 0.2 : 1

                                }}
                                onError={() => setImageError(true)}
                            />

                        </div>
                    </div>
                </>

                :

                <img src={`moons/${imageError ? 'noimage' : props.moonSelected}.png`}
                    style={{
                        width: '10em',
                        height: '10em',
                        transform: `translate(-50%, -50%)`,
                        objectFit: 'cover',
                        zIndex: '1',
                        transition: `width 2s ease-in, height 2s ease-in, opacity 2s ease-out`,
                        opacity: imageError ? 0.2 : 1

                    }}
                    onError={() => setImageError(true)}
                />
            }
        </>


    )
}
