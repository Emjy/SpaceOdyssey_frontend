import React, { useState, useEffect } from 'react';

export default function CursorFollower() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);


    const followCursor = (e) => {
        requestAnimationFrame(() => {
            setCursorPos({ x: e.clientX, y: e.clientY });

            const imageCenterX = window.innerWidth / 2; // Utiliser la largeur de la fenêtre si l'image est centrée
            const imageCenterY = window.innerHeight / 2; // Utiliser la hauteur de la fenêtre si l'image est centrée

            // Si l'image est centrée, ces valeurs doivent être constantes. Sinon, elles doivent être mises à jour
            // en fonction de la position actuelle de l'image.

            const angleCorrection = -Math.PI / 2; // Inverser la direction pour la correction d'angle
            const angle = Math.atan2(e.clientY - imageCenterY, e.clientX - imageCenterX) + angleCorrection;

            setRotation(angle);
        });
    };
    useEffect(() => {

        window.addEventListener('mousemove', followCursor);

        return () => {
            window.removeEventListener('mousemove', followCursor);
        };
    }, []);

    // Ajouter un décalage spatial en ajustant le X et le Y
    const xOffset = 20; // Décalage horizontal
    const yOffset = 20; // Décalage vertical

    return (
        <img
            src="vaisseau.png" // Chemin vers votre image
            alt="Follower"
            style={{
                position: 'absolute',
                left: `${cursorPos.x + xOffset}px`,
                top: `${cursorPos.y + yOffset}px`,
                pointerEvents: 'none',
                transition: 'left 4s ease-in-out, top 4s ease-in-out, transorm 1s ease',
                width: '10px',
                height: 'auto',
                transform: `rotate(${rotation- 1.57}rad)`, // Rotation de l'image
                zIndex: '10'
            }}
        />
    );
}
