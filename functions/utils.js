// Fonction pour récupération des informations sur l'objet en cours
export const infoObjet = async (objectName, setInfos) => {
    const response = await fetch(`https://space-odyssey-backend.vercel.app/bodies/body/${objectName}`);
    const data = await response.json();
    if (data.result) {
        setInfos(data.body);
    }
};