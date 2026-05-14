// Conversions NASA Exoplanet Archive → format scène Three.js

export function teffToStarColor(teff) {
    if (!teff || teff <= 0) return { color: '#ffe880', emissive: '#ffaa22' };
    if (teff < 3700) return { color: '#ff6644', emissive: '#cc2200' };   // M (naine rouge)
    if (teff < 5200) return { color: '#ffaa44', emissive: '#ff6600' };   // K (orange)
    if (teff < 6000) return { color: '#ffe880', emissive: '#ffaa22' };   // G (type solaire)
    if (teff < 7500) return { color: '#fff5dd', emissive: '#ffddaa' };   // F (blanc-jaune)
    if (teff < 10000) return { color: '#d8eaff', emissive: '#aaccff' };  // A (blanc-bleu)
    return { color: '#aabbff', emissive: '#6688ff' };                     // B/O (bleu)
}

export function starRadiusToScene(stRad) {
    if (!stRad || stRad <= 0) return 4.5;
    return Math.min(Math.max(stRad * 5.5, 2.5), 10.0);
}

// Niveau d'activité stellaire (0–1) : taches, éruptions, rotation rapide
export function getStarActivity(star) {
    let activity = 0;
    if (star.st_age && star.st_age < 2)   activity += 0.4; // jeune étoile
    if (star.st_rotp && star.st_rotp < 10) activity += 0.3; // rotation rapide
    if (star.st_teff > 7500)               activity += 0.2; // étoile chaude
    if (star.st_teff < 4000)               activity += 0.3; // naine froide très active
    return Math.min(activity, 1);
}

function hashHostname(hostname) {
    let h = 0;
    for (let i = 0; i < hostname.length; i++) {
        h = (h * 31 + hostname.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(h);
}

export function hostnameToGalaxyConfig(hostname) {
    const h = hashHostname(hostname);
    return {
        galaxyArmIndex: h % 4,
        galaxyOrbitRadius: 35 + (h % 40),
    };
}

// Normalise les orbites d'un système entier sur [minR, maxR] en log-scale.
export function normalizeOrbitRadii(smaxValues, minR = 8, maxR = 55) {
    if (!smaxValues || smaxValues.length === 0) return [];
    if (smaxValues.length === 1) return [22];
    const logs = smaxValues.map((v) => Math.log10(Math.max(v, 1e-6)));
    const minLog = Math.min(...logs);
    const maxLog = Math.max(...logs);
    return logs.map((logV) => {
        if (maxLog === minLog) return (minR + maxR) / 2;
        const t = (logV - minLog) / (maxLog - minLog);
        return minR + t * (maxR - minR);
    });
}

export function plRadToScene(rade) {
    if (!rade || rade <= 0) return 0.10;
    return Math.min(Math.max(Math.pow(rade, 0.6) * 0.10, 0.06), 2.2);
}

export function plPeriodToSpeed(period) {
    if (!period || period <= 0) return 0.05;
    return Math.min(Math.max(20 / period, 0.001), 0.3);
}

// Preset visuel procédural basé sur les données physiques de la planète
export function getPlanetVisual(p) {
    const rade = p.pl_rade ?? 1;
    const temp = p.pl_eqt ?? 500;

    // Géante gazeuse (> 6 R⊕)
    if (rade > 6) {
        const isHot = temp > 900; // hot Jupiter
        return {
            visualType: 'gas-giant',
            color:          isHot ? '#c87840' : temp > 400 ? '#c8a870' : '#a0b8d0',
            emissive:       isHot ? '#1a0800' : '#080c12',
            atmosphereColor: isHot ? '#ff7722' : temp > 400 ? '#aabbcc' : '#6688bb',
            hasAtmosphere: true,
            hasClouds: !isHot,
        };
    }

    // Monde de lave (> 700 K)
    if (temp > 700) {
        return {
            visualType: 'lava-world',
            color:          '#1a0a08',
            emissive:       '#cc3300',
            atmosphereColor: '#ff4400',
            hasAtmosphere: temp < 2500,
            hasClouds: false,
        };
    }

    // Monde glacé (< 180 K)
    if (temp < 180) {
        return {
            visualType: 'ice-world',
            color:          '#c8e4f8',
            emissive:       '#000000',
            atmosphereColor: '#aaccee',
            hasAtmosphere: rade > 0.5,
            hasClouds: false,
        };
    }

    // Monde tempéré / potentiellement habitable (180–350 K)
    if (temp <= 350) {
        return {
            visualType: 'temperate',
            color:          '#1a4a8a',
            emissive:       '#000000',
            atmosphereColor: '#4488ff',
            hasAtmosphere: true,
            hasClouds: true,
        };
    }

    // Monde désertique / rocailleux chaud (350–700 K)
    return {
        visualType: 'rocky',
        color:          temp > 500 ? '#8c5030' : '#8c7a55',
        emissive:       '#000000',
        atmosphereColor: '#aa8855',
        hasAtmosphere: rade > 0.4,
        hasClouds: false,
    };
}

export function parseExoplanetSystems(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    // Groupe par hostname
    const byHost = {};
    for (const row of rows) {
        const host = row.hostname;
        if (!host) continue;
        if (!byHost[host]) byHost[host] = { star: row, planets: [] };
        byHost[host].planets.push(row);
    }

    // Tous les systèmes multi-planètes, triés par nombre de planètes décroissant
    const systems = Object.values(byHost)
        .filter((s) => s.planets.length >= 2)
        .sort((a, b) => b.planets.length - a.planets.length);

    return systems.map(({ star, planets }) => {
        const host = star.hostname;
        const { color, emissive } = teffToStarColor(star.st_teff);
        const { galaxyArmIndex, galaxyOrbitRadius } = hostnameToGalaxyConfig(host);
        const activity = getStarActivity(star);

        const sortedPlanets = [...planets]
            .filter((p) => p.pl_orbsmax != null)
            .sort((a, b) => (a.pl_orbsmax ?? 0) - (b.pl_orbsmax ?? 0));

        // Zone habitable
        const hzLum = star.st_lum ?? Math.pow(star.st_rad ?? 1, 2) * Math.pow((star.st_teff ?? 5778) / 5778, 4);
        const hzInnerAU = Math.sqrt(hzLum / 1.1);
        const hzOuterAU = Math.sqrt(hzLum / 0.53);

        // Inclure les AU de la HZ dans la normalisation
        const allSmax = [...sortedPlanets.map(p => p.pl_orbsmax), hzInnerAU, hzOuterAU];
        const allNorm = normalizeOrbitRadii(allSmax);
        const orbitRadii = allNorm.slice(0, sortedPlanets.length);
        const [hzInnerR, hzOuterR] = allNorm.slice(sortedPlanets.length);

        const id = `exo_${host.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const earthRadiusKm = 6371;
        const earthMassKg   = 5.972e24;

        return {
            id,
            name: host,
            milkyWayKey: host,
            starColor: color,
            starEmissive: emissive,
            starRadius: starRadiusToScene(star.st_rad),
            starActivity: activity,
            starInfo: {
                bodyType: 'Star',
                englishName: host,
                avgTemp: star.st_teff ? Math.round(star.st_teff) : undefined,
                mass: star.st_mass
                    ? { massValue: parseFloat((+star.st_mass).toFixed(3)), massExponent: 30 }
                    : undefined,
                meanRadius: star.st_rad ? Math.round(+star.st_rad * 695700) : undefined,
            },
            galaxyArmIndex,
            galaxyOrbitRadius,
            isExoplanet: true,
            habitableZone: { innerR: hzInnerR, outerR: hzOuterR },
            planets: sortedPlanets.map((p, i) => {
                const visual = getPlanetVisual(p);
                return {
                    // Rendu 3D
                    name:        p.pl_name,
                    r:           orbitRadii[i],
                    size:        plRadToScene(p.pl_rade),
                    color:       visual.color,
                    emissive:    visual.emissive,
                    visualType:      visual.visualType,
                    atmosphereColor: visual.atmosphereColor,
                    hasAtmosphere:   visual.hasAtmosphere,
                    hasClouds:       visual.hasClouds,
                    speed:    plPeriodToSpeed(p.pl_orbper),
                    tilt:     (i * 7 + 3) % 30,
                    rotDir:   i % 3 === 0 ? -1 : 1,
                    inclination: (i * 5 + 1) % 15,
                    massEarth: p.pl_bmasse ?? 0,
                    // Panneau d'infos
                    englishName: p.pl_name,
                    bodyType:    'Exoplanet',
                    sideralOrbit: p.pl_orbper || undefined,
                    avgTemp:      p.pl_eqt    || undefined,
                    meanRadius:   p.pl_rade   ? Math.round(p.pl_rade * earthRadiusKm) : undefined,
                    mass: p.pl_bmasse
                        ? { massValue: parseFloat((p.pl_bmasse * earthMassKg / 1e24).toFixed(3)), massExponent: 24 }
                        : undefined,
                };
            }),
        };
    });
}
