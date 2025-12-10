'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

//Style
import styles from '../styles/HomePage.module.css';

// Fonctions
import { infoObjet, fetchMoons } from '../functions/utils';

// Datas
import { milkyWay, solarSystem } from '../data/solarSystem';

// Hooks personnalisés
import usePlanetStates from '../hooks/usePlanetStates';

// composants
import MilkyWay from '../components/MilkyWay';
import SagittarusA from '../components/SagittarusA';
import Sun from '../components/Sun';
import Planet from '../components/Planet';
import Asteroid from '../components/Asteroid';
import Informations from '../components/Informations';
import Satellite from '../components/Satellite';
import Footer from '../components/Footer';
import MenuButton from '../components/ui/MenuButton';

// Icônes (react-icons est plus léger que MUI)
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

export default function HomePage() {


    // Gestion menu
    const [milkyWayMenu, setMilkyWayMenu] = useState(false)
    const [solarSystemMenu, setSolarSystemMenu] = useState(false)
    const [planetMenu, setPlanetMenu] = useState(false)
    const [asteroidMenu, setAsteroidMenu] = useState(false)
    const [moonMenu, setMoonMenu] = useState(false)

    // Adaptation de la taille des fenetres 
    const secondaryButtonsRef = useRef(null);
    const [secondaryButtonsHeight, setSecondaryButtonsHeight] = useState(0)

    // Focus sur les objets
    const [focusSA, setFocusSA] = useState(true);
    const [focusSolarSystem, setFocusSolarSystem] = useState(true);
    const [focusOnPlanet, setFocusOnPlanet] = useState(false);
    const [focusOnMoon, setFocusOnMoon] = useState(true);
    const [focusOnAsteroid, setFocusOnAsteroid] = useState(false);

    const [focusOneMoon, setFocusOneMoon] = useState(false);

    // Stockage des informations 
    const [infos, setInfos] = useState(false)
    const [infosSup, setInfosSup] = useState(false)

    // Gestion Solar System
    const [selectedMilkyWay, setSelectedMilkyWay] = useState(null)

    // Gestion Solar System
    const [selectedSolarSystem, setSelectedSolarSystem] = useState(null)

    // Gestion des planètes avec hook personnalisé
    const [planets, setPlanets] = useState([]);
    const { planetStates, updatePlanetState, setPlanetStates } = usePlanetStates();
    const [selectedPlanet, setSelectedPlanet] = useState(null)

    // Gestion des Asteroides
    const [asteroids, setAsteroids] = useState([])
    const [selectedAsteroid, setSelectedAsteroid] = useState(null)

    // Gestion des lunes
    const [moons, setMoons] = useState([]);
    const [nbMoons, setNbMoons] = useState(4)
    const [selectedMoon, setSelectedMoon] = useState(null)

    // Initialisation, récupération des planètes et asteroides
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://space-odyssey-backend.vercel.app/bodies/planets`);
                const data = await response.json();
                if (data.result) {
                    setPlanets(data.planets);
                }
            } catch (error) {
                console.error('Une erreur s\'est produite :', error);
            }

            try {
                const response = await fetch(`https://space-odyssey-backend.vercel.app/bodies/asteroids`);
                const data = await response.json();
                if (data.result) {
                    setAsteroids(data.asteroids);
                }
            } catch (error) {
                console.error('Une erreur s\'est produite :', error);
            }
        };

        fetchData();
    }, []);

    // Fonctions de focus avec useCallback pour éviter les re-créations
    const focusMilkyWay = useCallback(() => {

        setPlanetStates({
            milkyWaySize: 80, sagittarusA: 16, indexSa: 10,
            sunSize: 1.6, indexSun: 10, sunOrbit: 21,
            mercuryOrbit: 0, mercurySize: 0, mercuryIndex: 0,
            venusOrbit: 0, venusSize: 0, venusIndex: 0,
            earthOrbit: 0, earthSize: 0, earthIndex: 0,
            marsOrbit: 0, marsSize: 0, marsIndex: 0,
            jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: 0,
            saturnOrbit: 0, saturnSize: 0, saturnIndexIndex: 0,
            uranusOrbit: 0, uranusSize: 0, uranusIndex: 0,
            neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 0,
            plutoOrbit: 0, plutoSize: 0, plutoIndex: 0,

        });

        // Récupération des informations
        infoObjet('milkyWay', setInfos)

        // Réinitialisation des sélections
        setSelectedMoon(null)
        setFocusOnPlanet(false)
        setSelectedMilkyWay(null)
        setFocusOneMoon(false)
        setSelectedPlanet(null)
        setPlanetMenu(false)
        setMoons([])

    }, [setPlanetStates, setSelectedMoon, setFocusOnPlanet, setSelectedMilkyWay, setFocusOneMoon, setSelectedPlanet, setPlanetMenu, setMoons]);

    const focusSagittarusA = useCallback(() => {

        if (!focusSA) {
            setSelectedMilkyWay(null)
            focusMilkyWay()
        } else {
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 800, indexSa: 10,
                sunSize: 0, indexSun: 0, sunOrbit: 0,
                mercuryOrbit: 0, mercurySize: 0, mercuryIndex: 0,
                venusOrbit: 0, venusSize: 0, venusIndex: 0,
                earthOrbit: 0, earthSize: 0, earthIndex: 0,
                marsOrbit: 0, marsSize: 0, marsIndex: 0,
                jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: 0,
                saturnOrbit: 0, saturnSize: 0, saturnIndexIndex: 0,
                uranusOrbit: 0, uranusSize: 0, uranusIndex: 0,
                neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 0,
                plutoOrbit: 0, plutoSize: 0, plutoIndex: 0,

            })

            // Récupération des informations
            infoObjet('sagittariusA', setInfos)
        }

        setInfos(false)

    }, [focusSA, focusMilkyWay, setPlanetStates, setSelectedMilkyWay]);

    const focusOnSolarSystem = useCallback(() => {

        setSelectedSolarSystem('Planets')
        setSelectedPlanet('Planets')
        setSelectedMilkyWay('Solar System')

        // focus milky way si clic sur le soleil
        if (!focusSolarSystem && !focusOnPlanet && !focusOneMoon) {
            setInfos(null)
            focusMilkyWay()
        } else {
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 10, indexSun: 10, sunOrbit: 0,
                mercuryOrbit: 16, mercurySize: 1.5, mercuryIndex: 9,
                venusOrbit: 24, venusSize: 1.5, venusIndex: 8,
                earthOrbit: 32, earthSize: 2, earthIndex: 7,
                marsOrbit: 40, marsSize: 2, marsIndex: 6,
                jupiterOrbit: 56, jupiterSize: 4, jupiterIndex: 5,
                saturnOrbit: 68, saturnSize: 4, saturnIndex: 4,
                uranusOrbit: 80, uranusSize: 4, uranusIndex: 3,
                neptuneOrbit: 92, neptuneSize: 4, neptuneIndex: 2,
                plutoOrbit: 104, plutoSize: 1.5, plutoIndex: 1,


            });

            // Récupération des informations
            infoObjet('soleil', setInfos)
        }

        setFocusOnPlanet(false)
        setFocusOneMoon(false)
        setMoons([])
        setNbMoons(4)
        setSelectedMoon(null)

    }, [focusSolarSystem, focusOnPlanet, focusOneMoon, focusMilkyWay, setPlanetStates, setSelectedSolarSystem, setSelectedPlanet, setSelectedMilkyWay, setFocusOnPlanet, setFocusOneMoon, setMoons, setNbMoons, setSelectedMoon]);

    const focusPlanet = useCallback(async (planetName) => {

        // Selection de la planète en cours
        setSelectedPlanet(planetName)

        //Affichage de toutes les lunes (max8)
        setSelectedMoon(null)
        setFocusOneMoon(false)
        setNbMoons(8)

        // récupération des lunes de la planète
        await fetchMoons(planetName, setMoons)

        // Permet le focus sur la planète
        if (!focusOnPlanet) {
            setNbMoons(5);
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 25, indexSun: 11, sunOrbit: 0,
                mercuryOrbit: planetName === 'mercure' ? 60 : 0, mercurySize: planetName === 'mercure' ? 2 : 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
                venusOrbit: planetName === 'venus' ? 60 : 0, venusSize: planetName === 'venus' ? 2 : 0, venusIndex: planetName === 'venus' ? 10 : 0,
                earthOrbit: planetName === 'terre' ? 60 : 0, earthSize: planetName === 'terre' ? 2 : 0, earthIndex: planetName === 'terre' ? 10 : 0,
                marsOrbit: planetName === 'mars' ? 60 : 0, marsSize: planetName === 'mars' ? 2 : 0, marsIndex: planetName === 'mars' ? 10 : 0,
                jupiterOrbit: planetName === 'jupiter' ? 70 : 0, jupiterSize: planetName === 'jupiter' ? 4 : 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
                saturnOrbit: planetName === 'saturne' ? 70 : 0, saturnSize: planetName === 'saturne' ? 4 : 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
                uranusOrbit: planetName === 'uranus' ? 70 : 0, uranusSize: planetName === 'uranus' ? 4 : 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
                neptuneOrbit: planetName === 'neptune' ? 70 : 0, neptuneSize: planetName === 'neptune' ? 4 : 0, neptuneIndex: planetName === 'neptune' ? 10 : 0,
                plutoOrbit: planetName === 'pluton' ? 70 : 0, plutoSize: planetName === 'pluton' ? 4 : 0, plutoIndex: planetName === 'pluton' ? 10 : 0,
            });
        } else {
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 0, indexSun: 0, sunOrbit: 0,
                mercuryOrbit: planetName === 'mercure' ? 1 : 0, mercurySize: planetName === 'mercure' ? 20 : 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
                venusOrbit: planetName === 'venus' ? 1 : 0, venusSize: planetName === 'venus' ? 20 : 0, venusIndex: planetName === 'venus' ? 10 : 0,
                earthOrbit: planetName === 'terre' ? 1 : 0, earthSize: planetName === 'terre' ? 20 : 0, earthIndex: planetName === 'terre' ? 10 : 0,
                marsOrbit: planetName === 'mars' ? 1 : 0, marsSize: planetName === 'mars' ? 20 : 0, marsIndex: planetName === 'mars' ? 10 : 0,
                jupiterOrbit: planetName === 'jupiter' ? 1 : 0, jupiterSize: planetName === 'jupiter' ? 20 : 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
                saturnOrbit: planetName === 'saturne' ? 1 : 0, saturnSize: planetName === 'saturne' ? 20 : 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
                uranusOrbit: planetName === 'uranus' ? 1 : 0, uranusSize: planetName === 'uranus' ? 20 : 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
                neptuneOrbit: planetName === 'neptune' ? 1 : 0, neptuneSize: planetName === 'neptune' ? 20 : 0, neptuneIndex: planetName === 'neptune' ? 10 : 0,
                plutoOrbit: planetName === 'pluton' ? 1 : 0, plutoSize: planetName === 'pluton' ? 20 : 0, plutoIndex: planetName === 'pluton' ? 10 : 0,

            });
        }

        // Récupération des informations sur l'objet en cours
        infoObjet(planetName, setInfos)

        setInfos(false)

    }, [focusOnPlanet, setPlanetStates, setSelectedPlanet, setSelectedMoon, setFocusOneMoon, setNbMoons, setMoons]);

    const focusAsteroid = useCallback(async (asteroidName) => {
        setNbMoons(0)
        infoObjet('', setInfos)
        setSelectedAsteroid(asteroidName)

        if (focusOnAsteroid) {

            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 0, indexSun: 0, sunOrbit: 0,
                mercuryOrbit: 0, mercurySize: 0, mercuryIndex: 0,
                venusOrbit: 0, venusSize: 0, venusIndex: 0,
                earthOrbit: 0, earthSize: 0, earthIndex: 0,
                marsOrbit: 0, marsSize: 0, marsIndex: 0,
                jupiterOrbit: 0, jupiterSize: 0, jupiterIndex: 0,
                saturnOrbit: 0, saturnSize: 0, saturnIndexIndex: 0,
                uranusOrbit: 0, uranusSize: 0, uranusIndex: 0,
                neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 0,
                plutoOrbit: 0, plutoSize: 0, plutoIndex: 0,
            })


        } else {
            setSelectedAsteroid('')

            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 2, indexSun: 100, sunOrbit: 0,
                mercuryOrbit: 5, mercurySize: 1, mercuryIndex: 0,
                venusOrbit: 10, venusSize: 1, venusIndex: 0,
                earthOrbit: 15, earthSize: 1, earthIndex: 0,
                marsOrbit: 20, marsSize: 1, marsIndex: 0,
                jupiterOrbit: 90, jupiterSize: 10, jupiterIndex: 0,
                saturnOrbit: 0, saturnSize: 0, saturnIndexIndex: 0,
                uranusOrbit: 0, uranusSize: 0, uranusIndex: 0,
                neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: 0,
                plutoOrbit: 0, plutoSize: 0, plutoIndex: 0,

            })

        }

        // Récupération des informations sur l'objet en cours
        infoObjet(asteroidName, setInfos)

    }, [focusOnPlanet, setPlanetStates, setNbMoons, setSelectedAsteroid]);

    const focusMoon = useCallback((moonName, planetName) => {

        setSelectedMoon(moonName)

        setFocusOneMoon(false)
        setNbMoons(1)

        // Permet le focus sur la lune
        if (focusOnMoon) {
            setPlanetStates({
                milkyWaySize: 0, sagittarusA: 0, indexSa: 0,
                sunSize: 0, indexSun: 0, sunOrbit: 0,
                mercuryOrbit: planetName === 'mercure' ? 1 : 0, mercurySize: planetName === 'mercure' ? 40 : 0, mercuryIndex: planetName === 'mercure' ? 10 : 0,
                venusOrbit: planetName === 'venus' ? 1 : 0, venusSize: planetName === 'venus' ? 40 : 0, venusIndex: planetName === 'venus' ? 10 : 0,
                earthOrbit: planetName === 'terre' ? 1 : 0, earthSize: planetName === 'terre' ? 40 : 0, earthIndex: planetName === 'terre' ? 10 : 0,
                marsOrbit: planetName === 'mars' ? 1 : 0, marsSize: planetName === 'mars' ? 40 : 0, marsIndex: planetName === 'mars' ? 10 : 0,
                jupiterOrbit: planetName === 'jupiter' ? 1 : 0, jupiterSize: planetName === 'jupiter' ? 40 : 0, jupiterIndex: planetName === 'jupiter' ? 10 : 0,
                saturnOrbit: planetName === 'saturne' ? 1 : 0, saturnSize: planetName === 'saturne' ? 40 : 0, saturnIndex: planetName === 'saturne' ? 10 : 0,
                uranusOrbit: planetName === 'uranus' ? 1 : 0, uranusSize: planetName === 'uranus' ? 40 : 0, uranusIndex: planetName === 'uranus' ? 10 : 0,
                neptuneOrbit: planetName === 'neptune' ? 1 : 0, neptuneSize: planetName === 'neptune' ? 40 : 0, neptuneIndex: planetName === 'neptune' ? 10 : 0,
                plutoOrbit: planetName === 'pluton' ? 1 : 0, plutoSize: planetName === 'pluton' ? 40 : 0, plutoIndex: planetName === 'pluton' ? 10 : 0,

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
                neptuneOrbit: 0, neptuneSize: 0, neptuneIndex: planetName === 'neptune' ? 10 : 0,
                plutoOrbit: 0, plutoSize: 0, plutoIndex: planetName === 'pluton' ? 10 : 0,

            });

        }


        // Récupération des informations sur l'objet en cours
        infoObjet(moonName, setInfos)

    }, [focusOnMoon, setPlanetStates, setSelectedMoon, setFocusOneMoon, setNbMoons]);

    // Boutons milkyWay pour le menu - avec useMemo pour éviter les re-renders
    const buttonsMilkyWay = useMemo(() => milkyWay.map((item) => (
        <MenuButton
            key={item.id || item}
            itemKey={item.id || item}
            label={item}
            isActive={selectedMilkyWay === item}
            onClick={() => {
                setSelectedMilkyWay(item)
                if (item === 'Sagittarius A') {
                    setFocusSA(true)
                    focusSagittarusA()
                } else if (item === 'Solar System') {
                    setFocusSolarSystem(true)
                    focusOnSolarSystem()
                }
            }}
        />
    )), [selectedMilkyWay, focusSagittarusA, focusOnSolarSystem]);

    // Boutons solarSystem pour le menu
    const buttonsSolarSystem = useMemo(() => solarSystem.map((item) => (
        <MenuButton
            key={item.id || item}
            itemKey={item.id || item}
            label={item}
            isActive={selectedSolarSystem === item}
            onClick={async () => {
                setSelectedSolarSystem(item)
                if (item === 'Planets') {
                    setFocusSolarSystem(true)
                    focusOnSolarSystem()
                } else if (item === 'Asteroid Belt') {
                    setFocusOnAsteroid(false)
                    await focusAsteroid('')
                }
            }}
        />
    )), [selectedSolarSystem, focusOnSolarSystem, focusAsteroid]);

    // Boutons planets pour le menu
    const buttonsPlanets = useMemo(() => planets.map((item) => (
        <MenuButton
            key={item.id}
            itemKey={item.id}
            label={item.englishName}
            isActive={selectedPlanet === item.id}
            onClick={() => {
                setFocusOnPlanet(true)
                focusPlanet(item.id)
            }}
        />
    )), [planets, selectedPlanet, focusPlanet]);

    // Boutons asteroids pour le menu
    const buttonsAsteroids = useMemo(() => asteroids.map((item) => (
        <MenuButton
            key={item.id}
            itemKey={item.id}
            label={item.englishName}
            isActive={selectedAsteroid === item.id}
            onClick={() => {
                setSelectedAsteroid(item.id)
                setFocusOnAsteroid(true)
                focusAsteroid(item.id)
            }}
        />
    )), [asteroids, selectedAsteroid, focusAsteroid]);

    // Boutons moons pour le menu
    const buttonsMoons = useMemo(() => moons
        .filter(item => !item.name.startsWith('S/'))
        .map((item) => (
            <MenuButton
                key={item.id}
                itemKey={item.id}
                label={item.englishName}
                isActive={selectedMoon === item.id}
                onClick={() => {
                    setFocusOnMoon(true)
                    focusMoon(item.id, selectedPlanet)
                }}
            />
        )), [moons, selectedMoon, selectedPlanet, focusMoon]);

    // Mapping des composants planètes sur la page
    const mapPlanets = planets.map((item, index) => {

        return (

            <Planet
                key={index}
                style={{ cursor: 'pointer', position: 'absolute', zIndex: '12' }}
                name={item.id}
                orbitSize={planetStates[`${item.englishName.toLowerCase()}Orbit`]}
                index={planetStates[`${item.englishName.toLowerCase()}Index`]}
                nOrb={index + 1}
                planetSize={planetStates[`${item.englishName.toLowerCase()}Size`]}
                vitesse={item.sideralOrbit}
                nbMoons={nbMoons}
                focus={focusOneMoon}
                focusPlanet={focusPlanet}
                focusMoon={focusMoon}
                setFocusOnPlanet={setFocusOnPlanet}
                setFocusOnMoon={setFocusOnMoon}
                selectedMoon={selectedMoon}
                selectedPlanet={selectedPlanet}
                setSelectedMoon={setSelectedMoon}
            />

        )
    })

    // Affichage des composants asteroids sur la page
    const mapAsteroids = asteroids.map((item, index) => {

        let orbitSize
        let size

        if (selectedAsteroid === '') {
            orbitSize = 55 + index / 3
            size = item.meanRadius / 130
        } else if (selectedAsteroid === item.id) {
            orbitSize = 1
            size = 50
        } else {
            return null;
        }


        return (
            <div>
                <Asteroid
                    key={index}
                    name={item.id}
                    englishName={item.englishName}
                    orbitSize={orbitSize}
                    index={index + 1}
                    nOrb={index + 1}
                    asteroidSize={size}
                    vitesse={item.sideralOrbit / 10}
                    setSelectedAsteroid={setSelectedAsteroid}
                    focusAsteroid={focusAsteroid}
                    setFocusOnAsteroid={setFocusOnAsteroid}
                />
            </div>
        )
    })

    return (
        <>
            <div className={styles.pageBackground}>
                {/* Menu */}
                <div className={styles.menu}>

                    <div className={styles.menuItem}>
                        <div className={styles.secondaryButtons} style={{
                            height: milkyWayMenu ? `${(milkyWay.length + 1) * 2.5}em` : '3.3em'
                        }}>
                            <div className={styles.menuTitle} onClick={() => {
                                setMoons([])
                                setMilkyWayMenu(!milkyWayMenu)
                                if (milkyWayMenu) {
                                    focusMilkyWay()
                                }
                            }}>
                                <div></div>
                                {'Milky Way'}
                                {milkyWayMenu ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                            </div>
                            <div>
                                {milkyWayMenu && buttonsMilkyWay}
                            </div>
                        </div>
                    </div>

                    <div className={styles.menuItem}>

                        {selectedMilkyWay === 'Solar System' &&
                            <div
                                className={styles.secondaryButtons}
                                style={{ height: solarSystemMenu ? `${(solarSystem.length + 1) * 2.5}em` : '3.3em' }}
                            >
                                <div className={styles.menuTitle} onClick={() => setSolarSystemMenu(!solarSystemMenu)}>
                                    <div></div>
                                    {'Solar System'}
                                    {solarSystemMenu ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}

                                </div>
                                <div>
                                    {solarSystemMenu && buttonsSolarSystem}
                                </div>

                            </div>}
                    </div>

                    {selectedPlanet && selectedMilkyWay === 'Solar System' && selectedSolarSystem === 'Planets' &&

                        <div className={styles.menuItem}>
                            <div
                                ref={secondaryButtonsRef}
                                className={styles.secondaryButtons}
                                style={{ maxHeight: `346px`, height: planetMenu ? `${(planets.length + 1) * 2.1}em` : '3.3em' }}
                            >
                                <div
                                    className={styles.menuTitle}
                                    onClick={() => setPlanetMenu(!planetMenu)}
                                >
                                    <div></div>
                                    {!planetMenu ? selectedPlanet[0].toUpperCase() + selectedPlanet.slice(1) : 'Planets'}
                                    {planetMenu ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}

                                </div>
                                <div>
                                    {planetMenu && buttonsPlanets}
                                </div>
                            </div>
                        </div>

                    }

                    {selectedPlanet && selectedMilkyWay === 'Solar System' && selectedSolarSystem === 'Asteroid Belt' &&

                        <div className={styles.menuItem}>
                            <div
                                ref={secondaryButtonsRef}
                                className={styles.secondaryButtons}
                                style={{ maxHeight: `346px`, height: asteroidMenu ? `${(asteroids.length + 1) * 2.1}em` : '3.3em' }}
                            >
                                <div
                                    className={styles.menuTitle}
                                    onClick={() => setAsteroidMenu(!asteroidMenu)}
                                >
                                    <div></div>
                                    {!asteroidMenu && selectedAsteroid ? selectedAsteroid[0].toUpperCase() + selectedAsteroid.slice(1) : 'Asteroids'}
                                    {asteroidMenu ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}

                                </div>
                                <div style={{ maxHeight: `290px`, overflow: 'auto' }}>
                                    {asteroidMenu && buttonsAsteroids}
                                </div>
                            </div>

                        </div>}

                    {moons.length > 0 && selectedSolarSystem === 'Planets' &&
                        <div className={styles.menuItem}>
                            <div
                                className={styles.secondaryButtons}
                                style={{ maxHeight: `${(moons.length + 1) * 2.7}em`, height: moonMenu ? `${(planets.length) * 2.4}em` : '3.3em' }}
                            >
                                <div className={styles.menuTitle}
                                    onClick={() => setMoonMenu(!moonMenu)}
                                >
                                    <div></div>
                                    {!moonMenu && selectedMoon ? selectedMoon[0].toUpperCase() + selectedMoon.slice(1) : 'Moons'}
                                    {moonMenu ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}


                                </div>
                                <div style={{ maxHeight: `290px`, overflow: 'auto' }}>
                                    {moonMenu && buttonsMoons}
                                </div>

                            </div>
                        </div>}

                </div>

                {/* Affichage des objets */}
                <div className={styles.container}>

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

                    {(selectedSolarSystem === 'Planets' || selectedSolarSystem === 'Asteroid Belt') && mapPlanets}
                    {selectedMilkyWay === 'Solar System' && selectedSolarSystem === 'Asteroid Belt' && mapAsteroids}

                </div>

                {/* Informations */}
                {infos && <div className={styles.rightContainer}>
                    <Informations infos={infos} />
                </div>}

            </div>

        </>

    )
};
