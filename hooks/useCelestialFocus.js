import { useCallback } from 'react';
import { infoObjet } from '../functions/utils';

/**
 * Hook personnalisé pour gérer la logique de focus sur les objets célestes
 * Centralise toute la logique répétitive de focus
 */
const useCelestialFocus = ({
    updatePlanetState,
    setInfos,
    setSelectedMoon,
    setFocusOnPlanet,
    setSelectedMilkyWay,
    setFocusOneMoon,
    setSelectedPlanet,
    setPlanetMenu,
    setMoons,
    setSelectedSolarSystem,
    setNbMoons,
    focusSA,
    focusSolarSystem,
    focusOnPlanet,
    focusOneMoon,
}) => {

    // Focus sur la Voie Lactée
    const focusMilkyWay = useCallback(() => {
        updatePlanetState({
            milkyWaySize: 80,
            sagittarusA: 16,
            indexSa: 10,
            sunSize: 1.6,
            indexSun: 10,
            sunOrbit: 21,
        });

        infoObjet('milkyWay', setInfos);

        setSelectedMoon(null);
        setFocusOnPlanet(false);
        setSelectedMilkyWay(null);
        setFocusOneMoon(false);
        setSelectedPlanet(null);
        setPlanetMenu(false);
        setMoons([]);
    }, [updatePlanetState, setInfos, setSelectedMoon, setFocusOnPlanet, setSelectedMilkyWay, setFocusOneMoon, setSelectedPlanet, setPlanetMenu, setMoons]);

    // Focus sur Sagittarius A
    const focusSagittarusA = useCallback(() => {
        if (!focusSA) {
            setSelectedMilkyWay(null);
            focusMilkyWay();
        } else {
            updatePlanetState({
                sagittarusA: 800,
                indexSa: 10,
            });
            infoObjet('sagittariusA', setInfos);
        }
        setInfos(false);
    }, [focusSA, updatePlanetState, setInfos, setSelectedMilkyWay, focusMilkyWay]);

    // Focus sur le système solaire
    const focusOnSolarSystem = useCallback(() => {
        setSelectedSolarSystem('Planets');
        setSelectedPlanet('Planets');
        setSelectedMilkyWay('Solar System');

        if (!focusSolarSystem && !focusOnPlanet && !focusOneMoon) {
            setInfos(null);
            focusMilkyWay();
        } else {
            updatePlanetState({
                sunSize: 10,
                indexSun: 10,
                sunOrbit: 0,
                mercuryOrbit: 16,
                mercurySize: 1.5,
                mercuryIndex: 9,
                venusOrbit: 24,
                venusSize: 1.5,
                venusIndex: 8,
                earthOrbit: 32,
                earthSize: 2,
                earthIndex: 7,
                marsOrbit: 40,
                marsSize: 2,
                marsIndex: 6,
                jupiterOrbit: 56,
                jupiterSize: 4,
                jupiterIndex: 5,
                saturnOrbit: 68,
                saturnSize: 4,
                saturnIndex: 4,
                uranusOrbit: 80,
                uranusSize: 4,
                uranusIndex: 3,
                neptuneOrbit: 92,
                neptuneSize: 4,
                neptuneIndex: 2,
                plutoOrbit: 104,
                plutoSize: 1.5,
                plutoIndex: 1,
            });
            infoObjet('soleil', setInfos);
        }

        setFocusOnPlanet(false);
        setFocusOneMoon(false);
        setMoons([]);
        setNbMoons(4);
        setSelectedMoon(null);
    }, [focusSolarSystem, focusOnPlanet, focusOneMoon, updatePlanetState, setInfos, setSelectedSolarSystem, setSelectedPlanet, setSelectedMilkyWay, setFocusOnPlanet, setFocusOneMoon, setMoons, setNbMoons, setSelectedMoon, focusMilkyWay]);

    // Fonction helper pour créer l'état d'une planète spécifique
    const createPlanetFocusState = useCallback((planetName, orbit, size, index) => {
        const planetMap = {
            mercure: { mercuryOrbit: orbit, mercurySize: size, mercuryIndex: index },
            venus: { venusOrbit: orbit, venusSize: size, venusIndex: index },
            terre: { earthOrbit: orbit, earthSize: size, earthIndex: index },
            mars: { marsOrbit: orbit, marsSize: size, marsIndex: index },
            jupiter: { jupiterOrbit: orbit, jupiterSize: size, jupiterIndex: index },
            saturne: { saturnOrbit: orbit, saturnSize: size, saturnIndex: index },
            uranus: { uranusOrbit: orbit, uranusSize: size, uranusIndex: index },
            neptune: { neptuneOrbit: orbit, neptuneSize: size, neptuneIndex: index },
            pluton: { plutoOrbit: orbit, plutoSize: size, plutoIndex: index },
        };
        return planetMap[planetName] || {};
    }, []);

    // Focus sur une planète
    const focusPlanet = useCallback(async (planetName, fetchMoons) => {
        setSelectedPlanet(planetName);
        setSelectedMoon(null);
        setFocusOneMoon(false);
        setNbMoons(8);

        await fetchMoons(planetName, setMoons);

        if (!focusOnPlanet) {
            setNbMoons(5);
            const bigPlanets = ['jupiter', 'saturne', 'uranus', 'neptune', 'pluton'];
            const orbit = bigPlanets.includes(planetName) ? 70 : 60;
            const size = bigPlanets.includes(planetName) ? 4 : 2;

            updatePlanetState({
                sunSize: 25,
                indexSun: 11,
                ...createPlanetFocusState(planetName, orbit, size, 10),
            });
        } else {
            updatePlanetState({
                ...createPlanetFocusState(planetName, 1, 20, 10),
            });
        }

        infoObjet(planetName, setInfos);
    }, [focusOnPlanet, updatePlanetState, setSelectedPlanet, setSelectedMoon, setFocusOneMoon, setNbMoons, setMoons, setInfos, createPlanetFocusState]);

    // Focus sur un astéroïde
    const focusAsteroid = useCallback((asteroidName) => {
        if (!focusOnPlanet) {
            updatePlanetState({
                sunSize: 25,
                indexSun: 11,
            });
        } else {
            updatePlanetState({});
        }

        if (asteroidName) {
            infoObjet(asteroidName, setInfos);
        }
    }, [focusOnPlanet, updatePlanetState, setInfos]);

    // Focus sur une lune
    const focusMoon = useCallback((moonName) => {
        if (!focusOneMoon) {
            updatePlanetState({
                sunSize: 25,
                indexSun: 11,
            });
        } else {
            updatePlanetState({});
        }

        if (moonName) {
            infoObjet(moonName, setInfos);
        }
    }, [focusOneMoon, updatePlanetState, setInfos]);

    return {
        focusMilkyWay,
        focusSagittarusA,
        focusOnSolarSystem,
        focusPlanet,
        focusAsteroid,
        focusMoon,
    };
};

export default useCelestialFocus;
