// Fonction pour récupération des informations sur l'objet en cours
export const infoObjet = async (objectName, setInfos) => {
    try {
        const response = await fetch(`https://space-odyssey-backend.vercel.app/bodies/body/${objectName}`);
        const data = await response.json();
        if (data.result) {
            setInfos(data.body);
        }
    } catch (error) {
        // Gestion des erreurs
        console.error('Une erreur s\'est produite :', error);
    }
};

export const fetchMoons = async (planetName, setMoons) => {
    // Récupération des lunes de la planète pour le menu
     fetch(`https://space-odyssey-backend.vercel.app/bodies/moons/${planetName}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.result) {
                setMoons(data.moons)
            }
        }).catch(error => {
            console.error('Une erreur s\'est produite :', error);
        });
}