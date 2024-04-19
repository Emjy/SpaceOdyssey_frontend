// Fonction pour récupération des informations sur l'objet en cours
export const infoObjet = async (objectName, setInfos) => {
    const response = await fetch(`http://localhost:3000/bodies/body/${objectName}`);
    const data = await response.json();
    if (data.result) {
        setInfos(data.body);
    }
};