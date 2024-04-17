import React, { useState, useEffect, useRef } from 'react';

//Style 
import styles from '../styles/HomePage.module.css';

// composants 
import MilkyWay from '../components/MilkyWay';
import SagittarusA from '../components/SagittarusA';
import Sun from '../components/Sun';
import Planet from '../components/Planet';
import Informations from '../components/Informations';
import CursorFollower from '../components/utils/CursorFollower';
import Separateur from '../components/utils/Separateur';

export default function HomePage() {

    let nOrb = 0;

    // Navigation
    const [navigation, setNavigation] = useState('')

    // Adaptation de la taille des fenetres 
    const secondaryButtonsRef = useRef(null);
    const [secondaryButtonsHeight, setSecondaryButtonsHeight] = useState(0)

    // Focus sur les objets
    const [focus, setFocus] = useState(false);
    const [focusOneMoon, setFocusOneMoon] = useState(true);

    // Sctokage des informations
    const [infos, setInfos] = useState(false)

    // Gestion des planètes
    const [planets, setPlanets] = useState([]);
    const [planetStates, setPlanetStates] = useState({
        milkyWaySize: 800, sagittarusA: 0,
        sunSize: 16, indexSun: 2, sunOrbit: 210,
        mercuryOrbit: 0, mercurySize: 0.5,
        venusOrbit: 0, venusSize: 0.5,
        earthOrbit: 0, earthSize: 0.8,
        marsOrbit: 0, marsSize: 0.8,
        jupiterOrbit: 0, jupiterSize: 3,
        saturnOrbit: 0, saturnSize: 2,
        uranusOrbit: 0, uranusSize: 2,
        neptuneOrbit: 0, neptuneSize: 2
    });
    const [selectedPlanet, setSelectedPlanet] = useState(null)

    // Gestion des lunes
    const [moons, setMoons] = useState([]);
    const [nbMoons, setNbMoons] = useState(4)
    const [selectedMoon, setSelectedMoon] = useState(null)

    // Initialisation, récupération des planètes
    useEffect(() => {
        fetch(`http://localhost:3000/bodies/planets`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setPlanets(data.planets);
                }
            });
    }, []);


    const fetchMoons = async (planetId) => {

        fetch(`http://localhost:3000/bodies/moons/${planetId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setMoons(data.moons)
                }
            });
    };

    const focusMilkyWay = () => {
        setPlanetStates({
            milkyWaySize: 800, sagittarusA: 0,
            sunSize: 16, indexSun: 2, sunOrbit: 210,
            mercuryOrbit: 0, mercurySize: 0.5,
            venusOrbit: 0, venusSize: 0.5,
            earthOrbit: 0, earthSize: 0.8,
            marsOrbit: 0, marsSize: 0.8,
            jupiterOrbit: 0, jupiterSize: 1.9,
            saturnOrbit: 0, saturnSize: 1.9,
            uranusOrbit: 0, uranusSize: 1.9,
            neptuneOrbit: 0, neptuneSize: 1.9

        });

        setNavigation('MilkyWay')
        // Stackage de la planète et moon selectionnée 
        setSelectedPlanet(null)
        setSelectedMoon(null)
        setFocus(false)
        setFocusOneMoon(false)


    }

    const focusSagittarusA = () => {
        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 800,
            sunSize: 0, indexSun: 0, sunOrbit: 0,
            mercuryOrbit: 0, mercurySize: 0.5,
            venusOrbit: 0, venusSize: 0.5,
            earthOrbit: 0, earthSize: 0.8,
            marsOrbit: 0, marsSize: 0.8,
            jupiterOrbit: 0, jupiterSize: 1.9,
            saturnOrbit: 0, saturnSize: 1.9,
            uranusOrbit: 0, uranusSize: 1.9,
            neptuneOrbit: 0, neptuneSize: 1.9

        });
    }

    const focusSolarSytem = () => {
        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 120, indexSun: 100, sunOrbit: 0,
            mercuryOrbit: 160, mercurySize: 0.5,
            venusOrbit: 240, venusSize: 0.5,
            earthOrbit: 320, earthSize: 0.8,
            marsOrbit: 400, marsSize: 0.8,
            jupiterOrbit: 560, jupiterSize: 1.9,
            saturnOrbit: 680, saturnSize: 1.9,
            uranusOrbit: 800, uranusSize: 1.9,
            neptuneOrbit: 920, neptuneSize: 1.9

        });


        setFocus(false)
        setFocusOneMoon(false)
        setMoons([])
        setNbMoons(4)
        setSelectedPlanet(null)
        setSelectedMoon(null)

        // Récupération des informations
        infoObjet('soleil')

        setNavigation('SolarSystem')

    }

    const focusPlanet = async (planetName) => {

        console.log(planetName)
        
        // Modification des orbites et tailles pour focus sur la planète dans le systeme solaire
        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 250, indexSun: 100, sunOrbit: 0,
            mercuryOrbit: planetName === 'mercure' ? 600 : 0, mercurySize: planetName === 'mercure' ? 2 : 0.5,
            venusOrbit: planetName === 'venus' ? 600 : 0, venusSize: planetName === 'venus' ? 2 : 0.5,
            earthOrbit: planetName === 'terre' ? 600 : 0, earthSize: planetName === 'terre' ? 2 : 0.8,
            marsOrbit: planetName === 'mars' ? 600 : 0, marsSize: planetName === 'mars' ? 2 : 0.8,
            jupiterOrbit: planetName === 'jupiter' ? 700 : 0, jupiterSize: planetName === 'jupiter' ? 4 : 1.9,
            saturnOrbit: planetName === 'saturne' ? 700 : 0, saturnSize: planetName === 'saturne' ? 4 : 1.9,
            uranusOrbit: planetName === 'uranus' ? 700 : 0, uranusSize: planetName === 'uranus' ? 4 : 1.9,
            neptuneOrbit: planetName === 'neptune' ? 700 : 0, neptuneSize: planetName === 'neptune' ? 4 : 1.9
        });

        // Récupération des lunes de la planète
        await fetchMoons(planetName);

        // Nombre de lunes affichées 
        setNbMoons(5);

        // Stackage de la planète et moon selectionnée 
        setSelectedPlanet(planetName)
        setSelectedMoon(null)

        setFocus(true)
        setFocusOneMoon(false)
        setSecondaryButtonsHeight(secondaryButtonsRef.current.offsetHeight)

        infoObjet(planetName)

        setNavigation('Planet')
    }

    const focusMoon = (planetName, moonName) => {

        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 0, indexSun: 0, sunOrbit: 0,
            mercuryOrbit: planetName === 'mercure' ? 1 : 0, mercurySize: planetName === 'mercure' ? 15 : 0,
            venusOrbit: planetName === 'venus' ? 1 : 0, venusSize: planetName === 'venus' ? 15 : 0,
            earthOrbit: planetName === 'terre' ? 1 : 0, earthSize: planetName === 'terre' ? 15 : 0,
            marsOrbit: planetName === 'mars' ? 1 : 0, marsSize: planetName === 'mars' ? 15 : 0,
            jupiterOrbit: planetName === 'jupiter' ? 1 : 0, jupiterSize: planetName === 'jupiter' ? 15 : 0,
            saturnOrbit: planetName === 'saturne' ? 1 : 0, saturnSize: planetName === 'saturne' ? 15 : 0,
            uranusOrbit: planetName === 'uranus' ? 1 : 0, uranusSize: planetName === 'uranus' ? 15 : 0,
            neptuneOrbit: planetName === 'neptune' ? 1 : 0, neptuneSize: planetName === 'neptune' ? 15 : 0
        });

        setFocusOneMoon(false)
        setNbMoons(1)
        setSelectedMoon(moonName)

        // Recupération des infos 
        infoObjet(moonName)

        setNavigation('Moon')

    }

    const zoomPlanet = (planetName) => {

        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 0, indexSun: 0, sunOrbit: 0,
            mercuryOrbit: planetName === 'mercure' ? 1 : 0, mercurySize: planetName === 'mercure' ? 10 : 0,
            venusOrbit: planetName === 'venus' ? 1 : 0, venusSize: planetName === 'venus' ? 10 : 0,
            earthOrbit: planetName === 'terre' ? 1 : 0, earthSize: planetName === 'terre' ? 10 : 0,
            marsOrbit: planetName === 'mars' ? 1 : 0, marsSize: planetName === 'mars' ? 10 : 0,
            jupiterOrbit: planetName === 'jupiter' ? 1 : 0, jupiterSize: planetName === 'jupiter' ? 10 : 0,
            saturnOrbit: planetName === 'saturne' ? 1 : 0, saturnSize: planetName === 'saturne' ? 10 : 0,
            uranusOrbit: planetName === 'uranus' ? 1 : 0, uranusSize: planetName === 'uranus' ? 10 : 0,
            neptuneOrbit: planetName === 'neptune' ? 1 : 0, neptuneSize: planetName === 'neptune' ? 10 : 0
        });

        setFocus(!focus)
        // Pour unfocus, obligé de refecth la planète 
        if (!focus) {
            focusPlanet(planetName)
        }

        setNbMoons(8)
        setFocusOneMoon(false)
        setSelectedMoon(null)

    }

    const zoomMoon = (moonName) => {

        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 0, indexSun: 0, sunOrbit: 0,
            mercuryOrbit: 0, mercurySize: 0,
            venusOrbit: 0, venusSize: 0,
            earthOrbit: 1, earthSize: 0,
            marsOrbit: 0, marsSize: 0,
            jupiterOrbit: 0, jupiterSize: 0,
            saturnOrbit: 0, saturnSize: 0,
            uranusOrbit: 0, uranusSize: 0,
            neptuneOrbit: 0, neptuneSize: 0
        });

        setFocusOneMoon(true)
        setNbMoons(1)
        setSelectedMoon(moonName)

    }

    const infoObjet = (objectName) => {

        fetch(`http://localhost:3000/bodies/body/${objectName}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setInfos(data.body)
                }
            });

    }

    const planetsFetch = planets.map((item, index) => {
        nOrb += 1;

        return (

            <Planet
                style={{ cursor: 'pointer', position: 'relative', zIndex: '12' }}
                key={index}
                name={item.id}
                orbitSize={planetStates[`${item.englishName.toLowerCase()}Orbit`]}
                nOrb={nOrb}
                planetSize={planetStates[`${item.englishName.toLowerCase()}Size`]}
                vitesse={(item.sideralOrbit)}
                moonSelected={selectedMoon}
                nbMoons={nbMoons}
                focus={focusOneMoon}
                focusPlanet={focusPlanet}
            />

        )
    })

    const buttonsPlanets = planets.map((item) => {

        const isActive = selectedPlanet === item.id;

        return (
            <div key={item.id} style={{
                backgroundColor: isActive ? 'lightgrey' : '',
                color: isActive ? 'black' : '',
            }}
                className={styles.secondaryButton}
                onClick={() => focusPlanet(item.id)}
            >
                {item.englishName}
            </div>
        )
    })

    const buttonsMoons = moons.filter(item => !item.name.startsWith('S/')).map((item) => {

        const isActive = selectedMoon === item.id;

        return (
            <div key={item.id}
                style={{
                    backgroundColor: isActive ? 'lightgrey' : '',
                    color: isActive ? 'black' : ''
                }}
                className={styles.secondaryButton}
                onClick={() => focusMoon(selectedPlanet, item.id)}>
                {item.englishName}
            </div>
        )
    });

    return (
        <>
            <div className={styles.pageBackground}>

                <div className={styles.buttons}>
                    <div className={styles.button} onClick={() => focusMilkyWay()}>
                        {'Galaxy'}
                    </div>
                    <Separateur />
                    <div className={styles.button}
                        onClick={() => focusSolarSytem()}
                        onMouseEnter={() => infoObjet('soleil')}
                        onMouseLeave={() => infoObjet('')}>
                        {'Sun'}
                    </div>


                    {navigation == 'SolarSystem' &&
                        <>
                            <Separateur />
                            <div className={styles.button}>
                                {'Planets'}
                            </div>
                        </>
                    }

                    {selectedPlanet &&
                        <>
                            <Separateur />
                            <div className={styles.button} >
                                {'Moons'}
                            </div>
                        </>
                    }

                </div>

                {
                    <div ref={secondaryButtonsRef} className={styles.secondaryButtons}>
                        <div className={styles.menuTitle}>
                            {'Planets'}
                        </div>
                        {buttonsPlanets}
                    </div>
                }

                {moons.length > 0 && <div className={styles.tertiaryButtons} style={{ maxHeight: `${secondaryButtonsHeight}px` }}>
                    <div className={styles.menuTitle}>
                        {'Moons'}
                    </div>
                    <div style={{ overflow: 'auto' }}>
                        {buttonsMoons}
                    </div>

                </div>}

                <div className={styles.container} >

                    <MilkyWay size={planetStates.milkyWaySize} />

                    {planetsFetch}

                    <div onClick={() => focusSolarSytem()} style={{ cursor: 'pointer', position: 'fixed', zIndex: '10' }}>
                        <Sun sunSize={planetStates.sunSize} indexSun={planetStates.indexSun} orbit={planetStates.sunOrbit} />
                    </div>
                </div>

                {infos && <div className={styles.rightContainer}>
                    <Informations infos={infos} />
                </div>}

                <div className={styles.focusButton}>
                    {selectedPlanet &&
                        <>
                            <div className={styles.button} onClick={() => zoomPlanet(selectedPlanet)}>
                                {focus ? 'Focus Planet' : 'Unfocus Planet'}
                            </div>
                        </>

                    }
                    {selectedMoon && !focusOneMoon &&
                        <>
                            <div className={styles.button} onClick={() => zoomMoon(selectedMoon)}>
                                {'Focus Moon'}
                            </div>
                        </>
                    }
                </div>

            </div>

        </>

    )
};
