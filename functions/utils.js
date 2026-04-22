import { getMoonsForPlanet, getObjectInfo } from '../data/celestialData';

// Fonction pour récupération des informations sur l'objet en cours
export const infoObjet = async (objectName, setInfos) => {
    setInfos(null);
    const objectInfo = getObjectInfo(objectName);
    if (objectInfo) {
        setInfos(objectInfo);
    }
};

// Fonction pour récupération des informations supplémentaires sur l'objet en cours
export const infoObjetSup = async (objectName, setInfosSup) => {

    const infosSupFiltered = infosSup.find(item => item.id === objectName)
    setInfosSup(infosSupFiltered.infos)

}

export const fetchMoons = async (planetName, setMoons) => {
    setMoons(getMoonsForPlanet(planetName));
};
