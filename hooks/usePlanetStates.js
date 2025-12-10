import { useState, useCallback } from 'react';
import { DEFAULT_PLANET_STATE, createPlanetState } from '../constants/planetStates';

/**
 * Hook personnalisé pour gérer l'état des planètes
 * Simplifie la mise à jour de l'état planétaire en utilisant des fonctions helper
 */
const usePlanetStates = () => {
    const [planetStates, setPlanetStates] = useState(DEFAULT_PLANET_STATE);

    // Réinitialise tous les états à zéro
    const resetAllStates = useCallback(() => {
        setPlanetStates(DEFAULT_PLANET_STATE);
    }, []);

    // Met à jour l'état avec des valeurs personnalisées
    const updatePlanetState = useCallback((overrides) => {
        setPlanetStates(createPlanetState(overrides));
    }, []);

    // Met à jour partiellement l'état sans réinitialiser
    const mergeState = useCallback((partialState) => {
        setPlanetStates(prev => ({
            ...prev,
            ...partialState
        }));
    }, []);

    return {
        planetStates,
        setPlanetStates,
        resetAllStates,
        updatePlanetState,
        mergeState,
    };
};

export default usePlanetStates;
