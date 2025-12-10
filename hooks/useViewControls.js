import { useState, useCallback, useEffect, useRef } from 'react';
import { ZOOM_LIMITS, ROTATION_3D } from '../constants/solarSystemScale';

/**
 * Hook pour gérer le zoom et la rotation 3D de la vue
 */
const useViewControls = () => {
    const [zoom, setZoom] = useState(ZOOM_LIMITS.DEFAULT);
    const [rotationX, setRotationX] = useState(ROTATION_3D.DEFAULT_ANGLE);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const initialRotationX = useRef(ROTATION_3D.DEFAULT_ANGLE);

    // Gestion du zoom avec la molette
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_LIMITS.STEP : ZOOM_LIMITS.STEP;
        setZoom(prevZoom => {
            const newZoom = prevZoom + delta;
            return Math.max(ZOOM_LIMITS.MIN, Math.min(ZOOM_LIMITS.MAX, newZoom));
        });
    }, []);

    // Début du drag pour la rotation
    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        dragStartY.current = e.clientY;
        initialRotationX.current = rotationX;
        document.body.style.cursor = 'grabbing';
    }, [rotationX]);

    // Mouvement de la souris pendant le drag
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const deltaY = e.clientY - dragStartY.current;
        const rotationDelta = deltaY * ROTATION_3D.SENSITIVITY;
        const newRotationX = initialRotationX.current - rotationDelta;

        setRotationX(Math.max(
            ROTATION_3D.MIN_ANGLE,
            Math.min(ROTATION_3D.MAX_ANGLE, newRotationX)
        ));
    }, [isDragging]);

    // Fin du drag
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
    }, []);

    // Réinitialiser la vue
    const resetView = useCallback(() => {
        setZoom(ZOOM_LIMITS.DEFAULT);
        setRotationX(ROTATION_3D.DEFAULT_ANGLE);
    }, []);

    // Ajout des event listeners
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        zoom,
        rotationX,
        isDragging,
        handleWheel,
        handleMouseDown,
        resetView,
        setZoom,
        setRotationX,
    };
};

export default useViewControls;
