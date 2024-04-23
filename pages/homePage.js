import React, { useState, useEffect, useRef } from 'react';

//Style 
import styles from '../styles/HomePage.module.css';

// Fonctions
import { infoObjet, fetchMoons } from '../functions/utils';

// Datas
import { milkyWay, solarSystem } from '../data/solarSystem';

// composants 
import MilkyWay from '../components/MilkyWay';
import SagittarusA from '../components/SagittarusA';
import Sun from '../components/Sun';
import Planet from '../components/Planet';
import Informations from '../components/Informations';

export default function HomePage() {

    // Gestion menu
    const [milkyWayMenu, setMilkyWayMenu] = useState(false)
    const [solarSystemMenu, setSolarSystemMenu] = useState(false)
    const [planetMenu, setPlanetMenu] = useState(false)
    const [moonMenu, setMoonMenu] = useState(false)

    // Adaptation de la taille des fenetres 
    const secondaryButtonsRef = useRef(null);
    const [secondaryButtonsHeight, setSecondaryButtonsHeight] = useState(0)

    // Focus sur les objets
    const [focusSA, setFocusSA] = useState(true);
    const [focusSolarSystem, setFocusSolarSystem] = useState(true);
    const [focusOnPlanet, setFocusOnPlanet] = useState(false);
    const [focusOnMoon, setFocusOnMoon] = useState(false);
    const [focusOneMoon, setFocusOneMoon] = useState(true);

    // Sctokage des informations
    const [infos, setInfos] = useState(false)

    // Gestion Solar System
    const [selectedMilkyWay, setSelectedMilkyWay] = useState(null)

    // Gestion Solar System
    const [selectedSolarSystem, setSelectedSolarSystem] = useState(null)

    // Gestion des planètes
    const [planets, setPlanets] = useState([]);
    const [planetStates, setPlanetStates] = useState({
        milkyWaySize: 800, sagittarusA: 16, indexSa: 10,
        sunSize: 16, indexSun: 10, sunOrbit: 210,
        mercuryOrbit: 0, mercurySize: 0, mercuryIndex: 9,
        venusOrbit: 0, venusSize: 0, venusIndex: 8,
        earthOrbit: 0, earthSize: 0, earthIndex: 7,
        marsOrbit: 0, marsSize: 0, marsIndex: 6,
        jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: 5,
        saturnOrbit: 0, saturnSize: 0, saturnIndex: 4,
        uranusOrbit: 0, uranusSize: 0, uranusIndex: 3,
        neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 2,
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
            }).catch(error => {
                console.error('Une erreur s\'est produite :', error);
            });
    }, []);

    // Boutons milkyWay pour le menu 
    const buttonsMilkyWay = milkyWay.map((item) => {

        const isActive = selectedMilkyWay === item;

        return (
            <div key={item.id}
                style={{
                    backgroundColor: isActive ? 'rgba(236, 243, 233, 0.08)' : '',
                    color: isActive ? 'white' : ''
                }}
                className={styles.secondaryButton}
                onClick={() => {
                    setMilkyWayMenu(false)
                    setSelectedMilkyWay(item)
                    if (item === 'Sagittarius A') {
                        setFocusSA(true)
                        focusSagittarusA()
                    } else if (item === 'Solar System') {
                        focusOnSolarSystem()
                    }
                }}
            >
                {item}
            </div>
        )
    })
    // Boutons solarSystem pour le menu 
    const buttonsSolarSystem = solarSystem.map((item) => {

        const isActive = selectedSolarSystem === item;

        return (
            <div key={item.id}
                style={{
                    backgroundColor: isActive ? 'rgba(236, 243, 233, 0.08)' : '',
                    color: isActive ? 'white' : ''
                }}
                className={styles.secondaryButton}
                onClick={() => {
                    setSolarSystemMenu(false)
                    setSelectedSolarSystem(item)
                    if (item === 'Sun') {
                        focusOnSolarSystem()
                    }
                }}
            >
                {item}
            </div>
        )
    })

    // Boutons planets pour le menu
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
                    focusPlanet(item.id)
                }}
            >
                {item.englishName}
            </div>
        )
    })

    // Boutons moons pour le menu
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
                    setFocusOnMoon(true)
                    focusMoon(item.id, selectedPlanet)
                }}
            >
                {item.englishName}
            </div>
        )
    });

    const focusMilkyWay = () => {

        setPlanetStates({
            milkyWaySize: 800, sagittarusA: 16, indexSa: 10,
            sunSize: 16, indexSun: 10, sunOrbit: 210,
            mercuryOrbit: 0, mercurySize: 0, mercuryIndex: 0,
            venusOrbit: 0, venusSize: 0, venusIndex: 0,
            earthOrbit: 0, earthSize: 0, earthIndex: 0,
            marsOrbit: 0, marsSize: 0, marsIndex: 0,
            jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: 0,
            saturnOrbit: 0, saturnSize: 0, saturnIndexIndex: 0,
            uranusOrbit: 0, uranusSize: 0, uranusIndex: 0,
            neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 0,

        });

        // Stackage de la planète et moon selectionnée 
        setSelectedMoon(null)
        setFocusOnPlanet(false)
        setFocusOneMoon(false)

        setInfos(false)

        setSelectedPlanet(null)
        setPlanetMenu(false)
        setMoons([])

    }

    const focusSagittarusA = () => {

        // Ajouter les infos plus tard pour sagittarius A
        setInfos(null)

        if (!focusSA) {
            setSelectedMilkyWay(null)
            focusMilkyWay()
        } else {
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 800, indexSa: 10,
                sunSize: 0, indexSun: 0, sunOrbit: 0,
                mercuryOrbit: 0, mercurySize: 0.5, mercuryIndex: 0,
                venusOrbit: 0, venusSize: 0.5, venusIndex: 0,
                earthOrbit: 0, earthSize: 0.8, earthIndex: 0,
                marsOrbit: 0, marsSize: 0.8, marsIndex: 0,
                jupiterOrbit: 0, jupiterSize: 1.9, jupiterIndex: 0,
                saturnOrbit: 0, saturnSize: 1.9, saturnIndexIndex: 0,
                uranusOrbit: 0, uranusSize: 1.9, uranusIndex: 0,
                neptuneOrbit: 0, neptuneSize: 1.9, neptuneIndex: 0,

            })
        }

    }

    const focusOnSolarSystem = () => {

        setSelectedPlanet('Planets')
        setSelectedMilkyWay('Solar System')

        // focus milky way si clic sur le soleil 
        if (!focusSolarSystem && !focusOnPlanet && !focusOneMoon) {
            setInfos(null)
            focusMilkyWay()
        } else {
            setPlanetMenu(true)

            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
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

            // Récupération des informations
            infoObjet('soleil', setInfos)
        }

        setFocusOnPlanet(false)
        setFocusOneMoon(false)
        setMoons([])
        setNbMoons(4)
        setSelectedMoon(null)

    }

    const focusPlanet = (planetName) => {

        // Selection de la planète en cours
        setSelectedPlanet(planetName)

        //Affichage de toutes les lunes (max8)
        setSelectedMoon(null)
        setFocusOneMoon(false)
        setNbMoons(8)

        // Permet le focus sur la planète
        if (!focusOnPlanet) {
            setNbMoons(5);
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
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
        } else {
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
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
        }

        // récupération des lunes de la planète
        fetchMoons(planetName, setMoons)

        // Open auto moon menu 
        setMoonMenu(true)

        // Récupération des informations sur l'objet en cours
        infoObjet(planetName, setInfos)

    }

    const focusMoon = (moonName, planetName) => {

        setSelectedMoon(moonName)
        setFocusOneMoon(false)
        setNbMoons(1)

        // Permet le focus sur la lune
        if (focusOnMoon) {
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 0, indexSun: 0, sunOrbit: 0,
                mercuryOrbit: planetName === 'mercure' ? 1 : 0, mercurySize: planetName === 'mercure' ? 15 : 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
                venusOrbit: planetName === 'venus' ? 1 : 0, venusSize: planetName === 'venus' ? 15 : 0, venusIndex: planetName === 'venus' ? 10 : 0,
                earthOrbit: planetName === 'terre' ? 1 : 0, earthSize: planetName === 'terre' ? 15 : 0, earthIndex: planetName === 'terre' ? 10 : 0,
                marsOrbit: planetName === 'mars' ? 1 : 0, marsSize: planetName === 'mars' ? 15 : 0, marsIndex: planetName === 'mars' ? 10 : 0,
                jupiterOrbit: planetName === 'jupiter' ? 1 : 0, jupiterSize: planetName === 'jupiter' ? 15 : 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
                saturnOrbit: planetName === 'saturne' ? 1 : 0, saturnSize: planetName === 'saturne' ? 15 : 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
                uranusOrbit: planetName === 'uranus' ? 1 : 0, uranusSize: planetName === 'uranus' ? 15 : 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
                neptuneOrbit: planetName === 'neptune' ? 1 : 0, neptuneSize: planetName === 'neptune' ? 15 : 0, neptuneIndex: planetName === 'neptune' ? 10 : 0,
            });
        } else {
            setFocusOneMoon(true)
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 0, indexSun: 0, sunOrbit: 0,
                mercuryOrbit: 0, mercurySize: 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
                venusOrbit: 0, venusSize: 0, venusIndex: planetName === 'venus' ? 10 : 0,
                earthOrbit: 1, earthSize: 0, earthIndex: planetName === 'terre' ? 10 : 0,
                marsOrbit: 0, marsSize: 0, marsIndex: planetName === 'mars' ? 10 : 0,
                jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
                saturnOrbit: 0, saturnSize: 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
                uranusOrbit: 0, uranusSize: 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
                neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: planetName === 'naptune' ? 10 : 0,
            });
        }

        // Récupération des informations sur l'objet en cours
        infoObjet(moonName, setInfos)

    }

    // Affichage des composants planètes sur la page
    const mapPlanets = planets.map((item, index) => {

        return (

            <Planet
                style={{ cursor: 'pointer', position: 'absolute', zIndex: '12' }}
                key={index}
                name={item.id}
                orbitSize={planetStates[`${item.englishName.toLowerCase()}Orbit`]}
                index={planetStates[`${item.englishName.toLowerCase()}Index`]}
                nOrb={index + 1}
                planetSize={planetStates[`${item.englishName.toLowerCase()}Size`]}
                vitesse={(item.sideralOrbit)}
                nbMoons={nbMoons}
                focus={focusOneMoon}
                focusPlanet={focusPlanet}
                focusMoon={focusMoon}
                setFocusOnPlanet={setFocusOnPlanet}
                setFocusOnMoon={setFocusOnMoon}
                selectedMoon={selectedMoon}
                selectedPlanet={selectedPlanet}

            />

        )
    })

    return (
        <>
            <div className={styles.pageBackground}>

                {/* Menu */}
                <div className={styles.menu}>

                    <div className={styles.menuItem}>
                        <div className={styles.secondaryButtons} style={{
                            height: milkyWayMenu ? `8em` : '3.3em'
                        }}>
                            <div className={styles.menuTitle} onClick={() => {
                                setSelectedMilkyWay(null)
                                setMilkyWayMenu(!milkyWayMenu)
                                if (milkyWayMenu) {
                                    focusMilkyWay()
                                }
                            }}>
                                {selectedMilkyWay ? selectedMilkyWay : 'Milky Way'}
                            </div>
                            <div>
                                {milkyWayMenu && buttonsMilkyWay}
                            </div>
                        </div>
                    </div>

                    <div className={styles.menuItem}>

                        {selectedMilkyWay === 'Solar System' && <div className={styles.secondaryButtons} style={{ height: solarSystemMenu ? `10.3em` : '3.3em' }}>
                            <div className={styles.menuTitle} onClick={() => setSolarSystemMenu(!solarSystemMenu)}>
                                {'Solar System'}
                            </div>
                            <div>
                                {solarSystemMenu && buttonsSolarSystem}
                            </div>

                        </div>}
                    </div>

                    <div className={styles.menuItem}>
                        {selectedPlanet && selectedMilkyWay === 'Solar System' &&
                            <div
                                ref={secondaryButtonsRef}
                                className={styles.secondaryButtons}
                                style={{ maxHeight: `346px`, height: planetMenu ? `346px` : '3.3em' }}
                                onClick={() => setPlanetMenu(!planetMenu)}
                            >
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
                            <div
                                className={styles.secondaryButtons}
                                style={{ maxHeight: `${(moons.length * 2.4) + 3.3}em`, height: moonMenu ? `346px` : '3.3em' }}
                                onClick={() => setMoonMenu(!moonMenu)}
                            >
                                <div className={styles.menuTitle}>
                                    {!moonMenu && selectedMoon ? selectedMoon[0].toUpperCase() + selectedMoon.slice(1) : 'Moons'}
                                </div>
                                <div style={{ maxHeight: `290px`, overflow: 'auto' }}>
                                    {moonMenu && buttonsMoons}
                                </div>

                            </div>}
                    </div>
                </div>

                {/* Affichage des objets */}
                <div className={styles.container} >

                    <MilkyWay size={planetStates.milkyWaySize} />

                    <SagittarusA
                        size={planetStates.sagittarusA}
                        opacity={planetStates.sagittarusA}
                        indexSa={planetStates.indexSa}
                        focusSagittarusA={focusSagittarusA}
                        setFocusSA={setFocusSA}
                    />

                    <Sun
                        sunSize={planetStates.sunSize}
                        indexSun={planetStates.indexSun}
                        orbit={planetStates.sunOrbit}
                        focusSolarSystem={focusOnSolarSystem}
                        setFocusSolarSystem={setFocusSolarSystem}
                    />

                    {mapPlanets}

                </div>

                {/* Informations */}
                {infos && <div className={styles.rightContainer}>
                    <Informations infos={infos} />
                </div>}

            </div>

        </>

    )
};
