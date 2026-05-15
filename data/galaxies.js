export const GALAXIES = [
    {
        id: 'milkyway',
        selectionValue: null,
        name: 'Voie Lactée',
        englishName: 'Milky Way',
        bodyType: 'Galaxy',
        image: '/milkyway.jpeg',
        orbitalImage: '/milkyway_background.png',
        hasStars: true,
        subtitle: 'Galaxie spirale barrée',
        accent: '~200–400 Md étoiles',
        meta: '100 000 al de diamètre',
        numberOfStars: 100000000000,
        numberOfPlanets: 100000000000,
    },
];

export const KNOWN_GALAXY_FALLBACKS = [
    { sourceId: 'M31', name: 'Galaxie d’Andromède', subtitle: 'Galaxie spirale', meta: 'Constellation Andromeda' },
    { sourceId: 'M33', name: 'Galaxie du Triangle', subtitle: 'Galaxie spirale', meta: 'Constellation Triangulum' },
    { sourceId: 'M51', name: 'Galaxie du Tourbillon', subtitle: 'Galaxie spirale', meta: 'Constellation Canes Venatici' },
    { sourceId: 'M81', name: 'Galaxie de Bode', subtitle: 'Galaxie spirale', meta: 'Constellation Ursa Major' },
    { sourceId: 'M82', name: 'Galaxie du Cigare', subtitle: 'Galaxie irrégulière', meta: 'Constellation Ursa Major' },
    { sourceId: 'M87', name: 'Virgo A', subtitle: 'Galaxie elliptique', meta: 'Constellation Virgo' },
    { sourceId: 'M104', name: 'Galaxie du Sombrero', subtitle: 'Galaxie spirale', meta: 'Constellation Virgo' },
    { sourceId: 'M101', name: 'Galaxie du Moulinet', subtitle: 'Galaxie spirale', meta: 'Constellation Ursa Major' },
    { sourceId: 'M63', name: 'Galaxie du Tournesol', subtitle: 'Galaxie spirale', meta: 'Constellation Canes Venatici' },
    { sourceId: 'M64', name: 'Galaxie de l’Œil noir', subtitle: 'Galaxie spirale', meta: 'Constellation Coma Berenices' },
    { sourceId: 'M74', name: 'Galaxie Fantôme', subtitle: 'Galaxie spirale', meta: 'Constellation Pisces' },
    { sourceId: 'M94', name: 'Galaxie de l’Œil du Crocodile', subtitle: 'Galaxie spirale', meta: 'Constellation Canes Venatici' },
    { sourceId: 'M90', name: 'M90', subtitle: 'Galaxie spirale', meta: 'Constellation Virgo' },
    { sourceId: 'M95', name: 'M95', subtitle: 'Galaxie spirale barrée', meta: 'Constellation Leo' },
    { sourceId: 'M96', name: 'M96', subtitle: 'Galaxie spirale', meta: 'Constellation Leo' },
    { sourceId: 'M98', name: 'M98', subtitle: 'Galaxie spirale', meta: 'Constellation Coma Berenices' },
    { sourceId: 'M99', name: 'M99', subtitle: 'Galaxie spirale', meta: 'Constellation Coma Berenices' },
    { sourceId: 'M100', name: 'M100', subtitle: 'Galaxie spirale', meta: 'Constellation Coma Berenices' },
    { sourceId: 'M106', name: 'M106', subtitle: 'Galaxie spirale', meta: 'Constellation Canes Venatici' },
    { sourceId: 'NGC 253', name: 'Galaxie du Sculpteur', subtitle: 'Galaxie spirale', meta: 'Constellation Sculptor' },
    { sourceId: 'NGC 300', name: 'NGC 300', subtitle: 'Galaxie spirale', meta: 'Constellation Sculptor' },
    { sourceId: 'NGC 891', name: 'NGC 891', subtitle: 'Galaxie spirale', meta: 'Constellation Andromeda' },
    { sourceId: 'NGC 1300', name: 'NGC 1300', subtitle: 'Galaxie spirale barrée', meta: 'Constellation Eridanus' },
    { sourceId: 'NGC 1316', name: 'Fornax A', subtitle: 'Galaxie lenticulaire', meta: 'Constellation Fornax' },
    { sourceId: 'NGC 1365', name: 'NGC 1365', subtitle: 'Galaxie spirale barrée', meta: 'Constellation Fornax' },
    { sourceId: 'NGC 1398', name: 'NGC 1398', subtitle: 'Galaxie spirale barrée', meta: 'Constellation Fornax' },
    { sourceId: 'NGC 1672', name: 'NGC 1672', subtitle: 'Galaxie spirale barrée', meta: 'Constellation Dorado' },
    { sourceId: 'NGC 2403', name: 'NGC 2403', subtitle: 'Galaxie spirale', meta: 'Constellation Camelopardalis' },
    { sourceId: 'NGC 2903', name: 'NGC 2903', subtitle: 'Galaxie spirale barrée', meta: 'Constellation Leo' },
    { sourceId: 'NGC 2997', name: 'NGC 2997', subtitle: 'Galaxie spirale', meta: 'Constellation Antlia' },
    { sourceId: 'NGC 3031', name: 'NGC 3031', subtitle: 'Galaxie spirale', meta: 'Constellation Ursa Major' },
    { sourceId: 'NGC 4038', name: 'Les Antennes', subtitle: 'Galaxies en interaction', meta: 'Constellation Corvus' },
    { sourceId: 'NGC 4258', name: 'NGC 4258', subtitle: 'Galaxie spirale', meta: 'Constellation Canes Venatici' },
    { sourceId: 'NGC 4261', name: 'NGC 4261', subtitle: 'Galaxie elliptique', meta: 'Constellation Virgo' },
    { sourceId: 'NGC 4303', name: 'NGC 4303', subtitle: 'Galaxie spirale', meta: 'Constellation Virgo' },
    { sourceId: 'NGC 4321', name: 'NGC 4321', subtitle: 'Galaxie spirale', meta: 'Constellation Coma Berenices' },
    { sourceId: 'NGC 4388', name: 'NGC 4388', subtitle: 'Galaxie spirale', meta: 'Constellation Virgo' },
    { sourceId: 'NGC 4449', name: 'NGC 4449', subtitle: 'Galaxie irrégulière', meta: 'Constellation Canes Venatici' },
    { sourceId: 'NGC 4565', name: 'Galaxie de l’Aiguille', subtitle: 'Galaxie spirale', meta: 'Constellation Coma Berenices' },
    { sourceId: 'NGC 4631', name: 'Galaxie de la Baleine', subtitle: 'Galaxie spirale', meta: 'Constellation Canes Venatici' },
    { sourceId: 'NGC 4656', name: 'Crosse de hockey', subtitle: 'Galaxie spirale', meta: 'Constellation Canes Venatici' },
    { sourceId: 'NGC 4696', name: 'NGC 4696', subtitle: 'Galaxie elliptique', meta: 'Constellation Centaurus' },
    { sourceId: 'NGC 4945', name: 'NGC 4945', subtitle: 'Galaxie spirale', meta: 'Constellation Centaurus' },
    { sourceId: 'NGC 5128', name: 'Centaurus A', subtitle: 'Galaxie lenticulaire', meta: 'Constellation Centaurus' },
    { sourceId: 'NGC 5236', name: 'Galaxie du Moulinet austral', subtitle: 'Galaxie spirale', meta: 'Constellation Hydra' },
    { sourceId: 'NGC 5457', name: 'NGC 5457', subtitle: 'Galaxie spirale', meta: 'Constellation Ursa Major' },
    { sourceId: 'NGC 6744', name: 'NGC 6744', subtitle: 'Galaxie spirale', meta: 'Constellation Pavo' },
    { sourceId: 'NGC 6822', name: 'Galaxie de Barnard', subtitle: 'Galaxie irrégulière', meta: 'Constellation Sagittarius' },
    { sourceId: 'NGC 6946', name: 'Galaxie du Feu d’artifice', subtitle: 'Galaxie spirale', meta: 'Constellation Cepheus' },
    { sourceId: 'NGC 7331', name: 'NGC 7331', subtitle: 'Galaxie spirale', meta: 'Constellation Pegasus' },
    { sourceId: 'IC 342', name: 'IC 342', subtitle: 'Galaxie spirale', meta: 'Constellation Camelopardalis' },
];

export function isGalaxyOverviewSelection(selection) {
    return selection == null || String(selection).startsWith('galaxy:');
}

export function getGalaxyBySelection(selection, dynamicGalaxies = []) {
    if (selection == null) {
        return GALAXIES.find((galaxy) => galaxy.id === 'milkyway') ?? null;
    }

    if (!String(selection).startsWith('galaxy:')) return null;
    const selectedId = String(selection).slice('galaxy:'.length);
    return dynamicGalaxies.find((galaxy) => galaxy.id === selectedId) ?? null;
}
