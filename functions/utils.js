// Fonction pour récupération des informations sur l'objet en cours
export const infoObjet = async (objectName, setInfos) => {
    await setInfos(null)
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


    try {
        const response = await fetch(`https://space-odyssey-backend.vercel.app/infos/${objectName}`);
        const data = await response.json();
        if (data.result) {
            setInfos(prevState => ({ ...prevState, ...data.info }));
        }
    } catch (error) {
        // Gestion des erreurs
        console.error('Une erreur s\'est produite :', error);
    }
};

// Fonction pour récupération des informations supplémentaires sur l'objet en cours
export const infoObjetSup = async (objectName, setInfosSup) => {

    const infosSupFiltered = infosSup.find(item => item.id === objectName)
    setInfosSup(infosSupFiltered.infos)

}

export const fetchMoons = async (planetName, setMoons) => {
    // Récupération des lunes de la planète pour le menu
    try {
        const response = await fetch(`https://space-odyssey-backend.vercel.app/bodies/moons/${planetName}`);
        const data = await response.json();
        if (data.result) {
            setMoons(data.moons);
        }
    } catch (error) {
        // Gestion des erreurs
        console.error('Une erreur s\'est produite :', error);
    }
}