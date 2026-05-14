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
// Garantit une séparation visuelle correcte même pour les systèmes compacts.
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
    if (!rade || rade <= 0) return 0.2;
    return Math.min(Math.max(rade * 0.036, 0.08), 2.2);
}

export function plPeriodToSpeed(period) {
    if (!period || period <= 0) return 0.05;
    return Math.min(Math.max(20 / period, 0.001), 0.3);
}

export function plEqtToColor(eqt) {
    if (!eqt || eqt <= 0) return { color: '#c8a060', emissive: '#3a2010' };
    if (eqt < 150) return { color: '#c8d8f0', emissive: '#1a2a4a' };    // glacé
    if (eqt < 280) return { color: '#4a9a60', emissive: '#0a2a10' };    // tempéré (habitable)
    if (eqt < 500) return { color: '#d07030', emissive: '#501800' };    // chaud/désertique
    if (eqt < 1000) return { color: '#e05010', emissive: '#601000' };   // brûlant
    return { color: '#ff4020', emissive: '#801000' };                    // monde de lave
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

        const sortedPlanets = [...planets]
            .filter((p) => p.pl_orbsmax != null)
            .sort((a, b) => (a.pl_orbsmax ?? 0) - (b.pl_orbsmax ?? 0));

        // Radii normalisés pour garantir une séparation visuelle
        const orbitRadii = normalizeOrbitRadii(sortedPlanets.map((p) => p.pl_orbsmax));

        const id = `exo_${host.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        return {
            id,
            name: host,
            milkyWayKey: host,
            starColor: color,
            starEmissive: emissive,
            starRadius: starRadiusToScene(star.st_rad),
            starInfo: {
                bodyType: 'Star',
                englishName: host,
                avgTemp: star.st_teff ? Math.round(star.st_teff) : undefined,
                mass: star.st_mass ? { massValue: parseFloat((+star.st_mass).toFixed(3)), massExponent: 30 } : undefined,
                meanRadius: star.st_rad ? Math.round(+star.st_rad * 695700) : undefined,
            },
            galaxyArmIndex,
            galaxyOrbitRadius,
            isExoplanet: true,
            planets: sortedPlanets.map((p, i) => {
                const pColor = plEqtToColor(p.pl_eqt);
                const earthRadiusKm = 6371;
                const earthMassKg = 5.972e24;
                return {
                    // Rendu 3D
                    name: p.pl_name,
                    r: orbitRadii[i],
                    size: plRadToScene(p.pl_rade),
                    color: pColor.color,
                    emissive: pColor.emissive,
                    speed: plPeriodToSpeed(p.pl_orbper),
                    tilt: (i * 7 + 3) % 30,
                    rotDir: i % 3 === 0 ? -1 : 1,
                    inclination: (i * 5 + 1) % 15,
                    // Panneau d'infos (champs reconnus par Informations.js)
                    englishName: p.pl_name,
                    bodyType: 'Exoplanet',
                    sideralOrbit: p.pl_orbper || undefined,
                    avgTemp: p.pl_eqt || undefined,
                    meanRadius: p.pl_rade ? Math.round(p.pl_rade * earthRadiusKm) : undefined,
                    mass: p.pl_bmasse
                        ? { massValue: parseFloat((p.pl_bmasse * earthMassKg / 1e24).toFixed(3)), massExponent: 24 }
                        : undefined,
                };
            }),
        };
    });
}
