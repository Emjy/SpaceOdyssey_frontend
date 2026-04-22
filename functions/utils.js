import { fetchFromApi } from '../lib/api';

// Fonction pour récupération des informations sur l'objet en cours
export const infoObjet = async (objectName, setInfos) => {
    await setInfos(null)
    try {
        const data = await fetchFromApi(`/bodies/body/${objectName}`);
        if (data.result) {
            setInfos(data.body);
        }
    } catch (error) {
        // Gestion des erreurs
        console.error('Une erreur s\'est produite :', error);
    }


    try {
        const data = await fetchFromApi(`/infos/${objectName}`);
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
        const data = await fetchFromApi(`/bodies/moons/${planetName}`);
        if (data.result) {
            setMoons(data.moons);
        }
    } catch (error) {
        // Gestion des erreurs
        console.error('Une erreur s\'est produite :', error);
        setMoons([]);
    }
}
