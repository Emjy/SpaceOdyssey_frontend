import React, { useState, useEffect } from 'react';

export default function Moon(props) {

    
    // Faire random 1 4 pour orbit moons  ou props de 1 a 4 
    const [imageError, setImageError] = useState(false);
    const [index, setIndex] = useState(0);
    const [nameSave, setNameSave] = useState(null)

    useEffect(() => {
        setImageError(false)
        setIndex(props.index) 
        setNameSave(props.selectedMoon)
    }, [props])
 

    // if (props.planetName === props.selectedPlanet) {
    //     console.log("lune name", props.name) // le probelme viens du props.name qui est toujours le mmee : la premeire lune 
    //     console.log("lune selected", props.selectedMoon) 
    //     console.log("name saved", nameSave) // tout change meme le nom sauvé 
    // }

    return (
        <>
            <div style={{
                borderTop: `solid rgba(255, 255, 255, ${props.moonSize < 0.4 ? 0.08 : 0.2}) 1px`,
                boxSizing: 'border-box',
                borderRadius: '50%',
                position: 'absolute',
                width: props.focus ? '1px' : `${props.moonOrbit}px`,
                height: props.focus ? '1px' : `${props.moonOrbit}px`,
                left: props.focus ? '1%' : `calc(50% - ${props.moonOrbit / 2}px)`, // Centrer l'orbite de la lune autour de la planète
                top: props.focus ? '1%' : `calc(50% - ${props.moonOrbit / 2}px)`,
                animation: props.focus ? 'none' : `orbit${props.nOrb} ${props.vitesseMoon}s linear infinite`,
                transition: `width 1s ease-in, height 1s ease-in, opacity 1s ease-out`,
                zIndex: `${index}`,
            }}>
                <div style={{
                    borderRadius: '50%',
                    width: props.focus && props.selectedMoon ? '10em' : `${props.moonSize}em`,
                    height: props.focus && props.selectedMoon ? '10em' : `${props.moonSize}em`,
                    position: 'absolute',
                    left: props.focus ? 'none' : '50%',
                    top: props.focus ? 'none' : '50%',
                    transform: props.focus ? 'translate(-50%, -50%)' : `translate(-50%, -50%) translateX(${props.moonOrbit * 0.5}px)`,
                    transition: `width 1s ease-in, height 1s ease-in, opacity 1s ease-out`,
                    zIndex: `${index}`,
                    cursor: 'pointer',
                }}
                    onClick={(event) => {
                        props.setFocusOnMoon(prevState => !prevState)
                        props.focusMoon(props.selectedMoon || props.name, props.selectedPlanet) // on renvoi le props.name qui va dans la fonction et rechange le selectedMoon 
                        event.stopPropagation()
                    }}
                >

                    <img
                        src={`moons/${imageError ? 'noimage' : props.selectedMoon ? props.selectedMoon : props.name}.png`}
                        alt={props.selectedMoon ? props.selectedMoon : props.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: `width 1s ease-in, height 1s ease-in, opacity 1s ease-out`,
                            opacity: imageError ? 0.2 : 1,
                            zIndex: `${index}`

                        }}
                        onError={() => setImageError(true)}
                    />

                </div>
            </div>
        </>



    )
}
