import React, { useState, useEffect, useRef } from 'react';

//Style 
import styles from '../styles/HomePage.module.css';

// Fonctions
import { infoObjet } from '../functions/utils';

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

    // Gestion menu
    const [planetMenu, setPlanetMenu] = useState(false)
    const [moonMenu, setMoonMenu] = useState(false)

    // Adaptation de la taille des fenetres 
    const secondaryButtonsRef = useRef(null);
    const [secondaryButtonsHeight, setSecondaryButtonsHeight] = useState(0)

    // Focus sur les objets
    const [focusSolarSystem, setFocusSolarSystem] = useState(true);
    const [focusOnPlanet, setFocusOnPlanet] = useState(false);
    const [focusOneMoon, setFocusOneMoon] = useState(true);

    // Sctokage des informations
    const [infos, setInfos] = useState(false)

    // Gestion des planètes
    const [planets, setPlanets] = useState([]);
    const [planetStates, setPlanetStates] = useState({
        milkyWaySize: 800, sagittarusA: 0,
        sunSize: 16, indexSun: 10, sunOrbit: 210,
        mercuryOrbit: 0, mercurySize: 0.5, mercuryIndex: 9,
        venusOrbit: 0, venusSize: 0.5, venusIndex: 8,
        earthOrbit: 0, earthSize: 0.8, earthIndex: 7,
        marsOrbit: 0, marsSize: 0.8, marsIndex: 6,
        jupiterOrbit: 0, jupiterSize: 3, jupiterIndex: 5,
        saturnOrbit: 0, saturnSize: 2, saturnIndex: 4,
        uranusOrbit: 0, uranusSize: 2, uranusIndex: 3,
        neptuneOrbit: 0, neptuneSize: 2, neptuneIndex: 2,
    });
    const [selectedPlanet, setSelectedPlanet] = useState(null)

    // Gestion des lunes
    const [moons, setMoons] = useState([]);
    const [nbMoons, setNbMoons] = useState(4)
    const [selectedMoon, setSelectedMoon] = useState(null)

    // Initialisation, récupération des planètes
    useEffect(() => {
        fetch(`https://space-odyssey-backend.vercel.app/bodies/planets`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setPlanets(data.planets);
                }
            });
    }, []);

    console.log(secondaryButtonsHeight)

    const focusMilkyWay = () => {

        setPlanetStates({
            milkyWaySize: 800, sagittarusA: 0,
            sunSize: 16, indexSun: 10, sunOrbit: 210,
            mercuryOrbit: 0, mercurySize: 0.5, mercuryIndex: 0,
            venusOrbit: 0, venusSize: 0.5, venusIndex: 0,
            earthOrbit: 0, earthSize: 0.8, earthIndex: 0,
            marsOrbit: 0, marsSize: 0.8, marsIndex: 0,
            jupiterOrbit: 0, jupiterSize: 1.9, jupiterIndex: 0,
            saturnOrbit: 0, saturnSize: 1.9, saturnIndexIndex: 0,
            uranusOrbit: 0, uranusSize: 1.9, uranusIndex: 0,
            neptuneOrbit: 0, neptuneSize: 1.9, neptuneIndex: 0,

        });

        // Stackage de la planète et moon selectionnée 
        setSelectedMoon(null)
        setFocusOnPlanet(false)
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

    const focusOnSolarSystem = () => {

        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 120, indexSun: 10, sunOrbit: 0,
            mercuryOrbit: 160, mercurySize: 0.5, mercuryIndex: 9,
            venusOrbit: 240, venusSize: 0.5, venusIndex: 8,
            earthOrbit: 320, earthSize: 0.8, earthIndex: 7,
            marsOrbit: 400, marsSize: 0.8, marsIndex: 6,
            jupiterOrbit: 560, jupiterSize: 1.9, jupiterIndex: 5,
            saturnOrbit: 680, saturnSize: 1.9, saturnIndex: 4,
            uranusOrbit: 800, uranusSize: 1.9, uranusIndex: 3,
            neptuneOrbit: 920, neptuneSize: 1.9, neptuneIndex: 2,

        });

        setFocusSolarSystem(!focusSolarSystem)
        // Permet le focus sur la planète
        if (!focusSolarSystem && !focusOnPlanet && !focusOneMoon) {
            setInfos(null)
            focusMilkyWay()
        } else {
            // Récupération des informations
            infoObjet('soleil', setInfos)
        }

        setFocusOnPlanet(false)
        setFocusOneMoon(false)
        setMoons([])
        setNbMoons(4)
        setSelectedMoon(null)


    }

    const focusPlanet = async (planetName) => {

        // Modification des orbites et tailles pour focus sur la planète dans le systeme solaire
        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 250, indexSun: 11, sunOrbit: 0,
            mercuryOrbit: planetName === 'mercure' ? 600 : 0, mercurySize: planetName === 'mercure' ? 2 : 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
            venusOrbit: planetName === 'venus' ? 600 : 0, venusSize: planetName === 'venus' ? 2 : 0, venusIndex: planetName === 'venus' ? 10 : 0,
            earthOrbit: planetName === 'terre' ? 600 : 0, earthSize: planetName === 'terre' ? 2 : 0, earthIndex: planetName === 'terre' ? 10 : 0,
            marsOrbit: planetName === 'mars' ? 600 : 0, marsSize: planetName === 'mars' ? 2 : 0, marsIndex: planetName === 'mars' ? 10 : 0,
            jupiterOrbit: planetName === 'jupiter' ? 700 : 0, jupiterSize: planetName === 'jupiter' ? 4 : 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
            saturnOrbit: planetName === 'saturne' ? 700 : 0, saturnSize: planetName === 'saturne' ? 4 : 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
            uranusOrbit: planetName === 'uranus' ? 700 : 0, uranusSize: planetName === 'uranus' ? 4 : 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
            neptuneOrbit: planetName === 'neptune' ? 700 : 0, neptuneSize: planetName === 'neptune' ? 4 : 0, neptuneIndex: planetName === 'neptune' ? 10 : 0,
        });

        // Récupération des lunes de la planète
        await fetch(`https://space-odyssey-backend.vercel.app/bodies/moons/${planetName}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setMoons(data.moons)
                }
            });

        // Nombre de lunes affichées 
        setNbMoons(5);

        setSelectedMoon(null)

        setFocusOneMoon(false)

        setSecondaryButtonsHeight(secondaryButtonsRef.current.offsetHeight)

        infoObjet(planetName, setInfos)

    }

    const focusMoon = (planetName, moonName) => {

        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 0, indexSun: 0, sunOrbit: 0,
            mercuryOrbit: planetName === 'mercure' ? 1 : 0, mercurySize: planetName === 'mercure' ? 15 : 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
            venusOrbit: planetName === 'venus' ? 1 : 0, venusSize: planetName === 'venus' ? 15 : 0, venusIndex: planetName === 'venus' ? 10 : 0,
            earthOrbit: planetName === 'terre' ? 1 : 0, earthSize: planetName === 'terre' ? 15 : 0, earthIndex: planetName === 'terre' ? 10 : 0,
            marsOrbit: planetName === 'mars' ? 1 : 0, marsSize: planetName === 'mars' ? 15 : 0, marsIndex: planetName === 'mars' ? 10 : 0,
            jupiterOrbit: planetName === 'jupiter' ? 1 : 0, jupiterSize: planetName === 'jupiter' ? 15 : 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
            saturnOrbit: planetName === 'saturne' ? 1 : 0, saturnSize: planetName === 'saturne' ? 15 : 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
            uranusOrbit: planetName === 'uranus' ? 1 : 0, uranusSize: planetName === 'uranus' ? 15 : 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
            neptuneOrbit: planetName === 'neptune' ? 1 : 0, neptuneSize: planetName === 'neptune' ? 15 : 0, neptuneIndex: planetName === 'neptune' ? 10 : 0
        });

        setFocusOneMoon(false)
        setNbMoons(1)
        setSelectedMoon(moonName)

        // Recupération des infos 
        infoObjet(moonName, setInfos)

    }

    const zoomPlanet = async (planetName) => {

        setSelectedPlanet(planetName)

        setPlanetStates({
            milkyWaySize: 0, sagittarusA: 0,
            sunSize: 0, indexSun: 0, sunOrbit: 0,
            mercuryOrbit: planetName === 'mercure' ? 1 : 0, mercurySize: planetName === 'mercure' ? 10 : 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
            venusOrbit: planetName === 'venus' ? 1 : 0, venusSize: planetName === 'venus' ? 10 : 0, venusIndex: planetName === 'venus' ? 10 : 0,
            earthOrbit: planetName === 'terre' ? 1 : 0, earthSize: planetName === 'terre' ? 10 : 0, earthIndex: planetName === 'terre' ? 10 : 0,
            marsOrbit: planetName === 'mars' ? 1 : 0, marsSize: planetName === 'mars' ? 10 : 0, marsIndex: planetName === 'mars' ? 10 : 0,
            jupiterOrbit: planetName === 'jupiter' ? 1 : 0, jupiterSize: planetName === 'jupiter' ? 10 : 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
            saturnOrbit: planetName === 'saturne' ? 1 : 0, saturnSize: planetName === 'saturne' ? 10 : 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
            uranusOrbit: planetName === 'uranus' ? 1 : 0, uranusSize: planetName === 'uranus' ? 10 : 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
            neptuneOrbit: planetName === 'neptune' ? 1 : 0, neptuneSize: planetName === 'neptune' ? 10 : 0, neptuneIndex: planetName === 'neptune' ? 10 : 0
        });

        // Récupération des lunes de la planète
        await fetch(`https://space-odyssey-backend.vercel.app/bodies/moons/${planetName}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.result) {
                    setMoons(data.moons)
                }
            });

        // Permet le focus sur la planète
        if (!focusOnPlanet) {
            setFocusOnPlanet(true)
            focusPlanet(planetName)
        }

        setFocusOnPlanet(!focusOnPlanet)
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
            earthOrbit: 0, earthSize: 0,
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

    const planetsFetch = planets.map((item, index) => {
        nOrb += 1;

        return (

            <Planet
                style={{ cursor: 'pointer', position: 'relative', zIndex: '12' }}
                key={index}
                name={item.id}
                orbitSize={planetStates[`${item.englishName.toLowerCase()}Orbit`]}
                index={planetStates[`${item.englishName.toLowerCase()}Index`]}
                nOrb={nOrb}
                planetSize={planetStates[`${item.englishName.toLowerCase()}Size`]}
                vitesse={(item.sideralOrbit)}
                moonSelected={selectedMoon}
                nbMoons={nbMoons}
                focus={focusOneMoon}
                zoomPlanet={zoomPlanet}
            />

        )
    })

    const buttonsPlanets = planets.map((item) => {

        const isActive = selectedPlanet === item.id;

        return (
            <div key={item.id}
                style={{
                    backgroundColor: isActive ? 'rgba(236, 243, 233, 0.08)' : '',
                    color: isActive ? 'white' : ''
                }}
                className={styles.secondaryButton}
                onClick={() => {
                    setFocusOnPlanet(true)
                    zoomPlanet(item.id)
                }}
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
                    backgroundColor: isActive ? 'rgba(236, 243, 233, 0.08)' : '',
                    color: isActive ? 'white' : ''
                }}
                className={styles.secondaryButton}
                onClick={() => {
                    setMoonMenu(true)
                    focusMoon(selectedPlanet, item.id)
                }}
                    >
                {item.englishName}
            </div>
        )
    });

    return (
        <>
            <div className={styles.pageBackground}>

                <div className={styles.menu}>

                    <div className={styles.menuItem}>
                        <div className={styles.buttons}>
                            <div className={styles.menuTitle} onClick={() => focusMilkyWay()}>
                                {'Milky Way '}
                            </div>
                        </div>
                    </div>

                    <div className={styles.menuItem}>

                        <div className={styles.buttons} style={{ left: '10em' }} onClick={() => focusOnSolarSystem()}>
                            <div className={styles.menuTitle}>
                                {'Solar System'}
                            </div>
                        </div>
                    </div>

                    <div className={styles.menuItem}>
                        {selectedPlanet &&
                            <div ref={secondaryButtonsRef} style={{ maxHeight: `346px`, height: planetMenu ? `346px` : '3.3em' }} className={styles.secondaryButtons} onClick={() => setPlanetMenu(!planetMenu)} >
                                <div className={styles.menuTitle}>
                                    {!planetMenu ? selectedPlanet[0].toUpperCase() + selectedPlanet.slice(1) : 'Planets'}
                                </div>
                                <div>
                                    {planetMenu && buttonsPlanets}
                                </div>
                            </div>
                        }
                    </div>

                    <div className={styles.menuItem}>
                        {moons.length > 0 &&
                            <div className={styles.secondaryButtons} style={{ maxHeight: moonMenu ? `346px` : '3.3em' }} onClick={() => setMoonMenu(!moonMenu)} >
                                <div className={styles.menuTitle}>
                                    {!moonMenu && selectedMoon ? selectedMoon[0].toUpperCase() + selectedMoon.slice(1) : 'Moons'}
                                </div>
                                <div style={{ maxHeight: `300px`, overflow: 'auto' }}>
                                    {moonMenu && buttonsMoons}
                                </div>

                            </div>}
                    </div>
                </div>

                <div className={styles.container} >

                    <MilkyWay size={planetStates.milkyWaySize} />
                    <Sun sunSize={planetStates.sunSize} indexSun={planetStates.indexSun} orbit={planetStates.sunOrbit} focusSolarSystem={focusOnSolarSystem} />
                    {planetsFetch}

                </div>

                {infos && <div className={styles.rightContainer}>
                    <Informations infos={infos} />
                </div>}

            </div>

        </>

    )
};
