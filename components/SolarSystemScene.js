'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Config ───────────────────────────────────────────────────────────────────

const PLANET_DATA = [
    //                                                                               tilt(°)  rotDir (+1=prograde, -1=rétrograde)
    { name: 'mercure', r: 10, size: 0.15, color: '#c8c8c8', emissive: '#555555', speed: 0.16,  tilt:   0.03, rotDir:  1 },
    { name: 'venus',   r: 13, size: 0.35, color: '#f0d080', emissive: '#6b4a00', speed: 0.10,  tilt: 177.4,  rotDir: -1 },
    { name: 'terre',   r: 16, size: 0.38, color: '#4a80c0', emissive: '#0a2a50', speed: 0.07,  tilt:  23.44, rotDir:  1 },
    { name: 'mars',    r: 19, size: 0.22, color: '#d05010', emissive: '#501800', speed: 0.04,  tilt:  25.19, rotDir:  1 },
    { name: 'jupiter', r: 28, size: 1.40, color: '#d8a060', emissive: '#4a2800', speed: 0.016, tilt:   3.13, rotDir:  1 },
    { name: 'saturne', r: 36, size: 1.20, color: '#ede0a0', emissive: '#504000', speed: 0.010, tilt:  26.73, rotDir:  1 },
    { name: 'uranus',  r: 45, size: 0.75, color: '#88eef0', emissive: '#104050', speed: 0.006, tilt:  97.77, rotDir: -1 },
    { name: 'neptune', r: 52, size: 0.72, color: '#3355e8', emissive: '#0c1555', speed: 0.004, tilt:  28.32, rotDir:  1 },
    { name: 'pluton',  r: 58, size: 0.12, color: '#9a8070', emissive: '#302520', speed: 0.002, tilt: 122.53, rotDir: -1 },
];

const DEFAULT_CAM_DIST = 90;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Arc de traîne 180° avec dégradé.
// reversed=false : φ=0 sombre (queue), φ=π lumineux (tête à la planète) — arc.rotation.y = Math.PI - angle
// reversed=true  : φ=0 lumineux (tête à la lune),  φ=π sombre (queue)   — arc.rotation.y = -angle
function makeTrailArc(radius, color = 0xffffff, opacity = 0.28, reversed = false) {
    const N = 128;
    const pts = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI, false, 0)
        .getPoints(N)
        .map(p => new THREE.Vector3(p.x, 0, p.y));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    const c = new THREE.Color(color);
    const colorArr = new Float32Array((N + 1) * 3);
    for (let i = 0; i <= N; i++) {
        const t = reversed ? 1 - i / N : i / N;
        colorArr[i * 3]     = c.r * t;
        colorArr[i * 3 + 1] = c.g * t;
        colorArr[i * 3 + 2] = c.b * t;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));

    const mat = new THREE.LineBasicMaterial({ vertexColors: true, opacity, transparent: true, depthWrite: false });
    return new THREE.Line(geo, mat);
}

function makeSphere(radius, color, emissive) {
    const geo = new THREE.SphereGeometry(radius, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
        color:             new THREE.Color(color),
        emissive:          new THREE.Color(emissive),
        emissiveIntensity: 2.5,
        specular:          new THREE.Color(0x2a2a3e),
        shininess:         18,
        transparent:       true,
        opacity:           1.0,
    });
    return new THREE.Mesh(geo, mat);
}

function makeSaturnRings(planetRadius) {
    const inner = planetRadius * 1.45;
    const outer = planetRadius * 2.35;
    const geo = new THREE.RingGeometry(inner, outer, 128);

    // Remapper les UVs pour une texture radiale (U=0 bord interne, U=1 bord externe)
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        const r = Math.sqrt(x * x + y * y);
        uv.setXY(i, (r - inner) / (outer - inner), 0.5);
    }
    uv.needsUpdate = true;

    const mat = new THREE.MeshBasicMaterial({
        color: 0xd4c088, side: THREE.DoubleSide,
        transparent: true, opacity: 0.75,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = Math.PI * 0.42;
    return ring;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function SolarSystemScene({
    selectedPlanet,
    moons = [],
    nbMoons = 0,
    focusPlanet,
    focusMoon,
    setFocusOnPlanet,
    setFocusOnMoon,
}) {
    const mountRef = useRef(null);
    const frameRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const ctrlRef = useRef(null);
    const planetsRef = useRef({});   // name → { group, mesh, arc, angle, r, speed }
    const moonsRef = useRef([]);   // [{ mesh, arc, angle, speed, radius, parentName }]
    const moonTexRef = useRef(null); // texture lune partagée

    const selectedPlanetRef = useRef(selectedPlanet);
    const targetCamDistRef = useRef(DEFAULT_CAM_DIST);

    useEffect(() => {
        selectedPlanetRef.current = selectedPlanet;
        if (selectedPlanet) {
            const p = PLANET_DATA.find(c => c.name === selectedPlanet);
            targetCamDistRef.current = p ? Math.max(p.size * 22, 2.5) : DEFAULT_CAM_DIST;
        } else {
            targetCamDistRef.current = DEFAULT_CAM_DIST;
        }
    }, [selectedPlanet]);

    // ── Init scène ────────────────────────────────────────────────────────
    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 2000);
        camera.position.set(0, 24, 36);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x020508);
        el.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.65;
        ctrlRef.current = controls;

        // Étoiles
        const sp = new Float32Array(5000 * 3);
        for (let i = 0; i < sp.length; i++) sp[i] = (Math.random() - 0.5) * 900;
        const starsGeo = new THREE.BufferGeometry();
        starsGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
        scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, sizeAttenuation: true })));

        // Éclairage
        // Ambiance faible → côté nuit sombre, côté jour tranché
        scene.add(new THREE.AmbientLight(0x334466, 1.8));
        // Soleil : distance=0 (pas de coupure), decay=1 (1/r au lieu de 1/r²) pour atteindre les planètes lointaines
        const sunLight = new THREE.PointLight(0xfff5e0, 800, 0, 1);
        scene.add(sunLight);

        // Soleil
        const sunMesh = makeSphere(5.5, '#ffe880', '#000000');
        sunMesh.material.emissive.set(0xffaa22);
        sunMesh.material.emissiveIntensity = 2.5;
        sunMesh.userData = { type: 'sun' };
        scene.add(sunMesh);

        // Planètes
        PLANET_DATA.forEach((cfg, i) => {
            // Arc de traîne 180° — sera tourné chaque frame
            const arc = makeTrailArc(cfg.r);
            scene.add(arc);

            const group = new THREE.Group();

            // tiltGroup : axe de rotation incliné, fixe
            const tiltGroup = new THREE.Group();
            tiltGroup.rotation.z = THREE.MathUtils.degToRad(cfg.tilt);
            group.add(tiltGroup);

            const mesh = makeSphere(cfg.size, cfg.color, cfg.emissive);
            mesh.userData = { type: 'planet', name: cfg.name };
            tiltGroup.add(mesh);
            if (cfg.name === 'saturne') tiltGroup.add(makeSaturnRings(cfg.size));

            const initAngle = (i / PLANET_DATA.length) * Math.PI * 2;
            group.position.set(Math.cos(initAngle) * cfg.r, 0, Math.sin(initAngle) * cfg.r);
            scene.add(group);

            planetsRef.current[cfg.name] = { group, mesh, arc, angle: initAngle, r: cfg.r, speed: cfg.speed };
        });

        // Textures planètes
        const loader = new THREE.TextureLoader();
        const PLANET_TEXTURES = {
            mercure: '/textures/texture_mercure.jpg',
            venus: '/textures/texture_venus.jpg',
            terre: '/textures/texture_terre.jpg',
            mars: '/textures/texture_mars.jpg',
            jupiter: '/textures/texture_jupiter.jpg',
            saturne: '/textures/texture_saturne.jpg',
            uranus: '/textures/texture_uranus.jpg',
            neptune: '/textures/texture_neptune.jpg',
        };
        Object.entries(PLANET_TEXTURES).forEach(([name, path]) => {
            loader.load(path, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                const planet = planetsRef.current[name];
                if (!planet) return;
                planet.mesh.material.map = tex;
                planet.mesh.material.color.set(0xffffff);
                planet.mesh.material.emissive.set(0x000000);
                planet.mesh.material.emissiveIntensity = 0;
                planet.mesh.material.needsUpdate = true;
            });
        });

        // Texture du Soleil
        loader.load('/textures/texture_soleil.jpg', (tex) => { // Ajustez l'extension (.jpg, .png) si nécessaire
            tex.colorSpace = THREE.SRGBColorSpace;

            // On applique la texture comme couleur de base
            sunMesh.material.map = tex;
            // On l'applique aussi sur l'émission pour qu'elle brille avec ses propres motifs
            sunMesh.material.emissiveMap = tex;

            // On réinitialise les couleurs à blanc pour que la texture s'affiche avec ses couleurs réelles
            sunMesh.material.color.set(0xffffff);
            sunMesh.material.emissive.set(0xffffff);

            sunMesh.material.needsUpdate = true;
        });

        // Texture lune
        loader.load('/textures/texture_moon.jpg', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            moonTexRef.current = tex;
            moonsRef.current.forEach(m => {
                m.mesh.material.map = tex;
                m.mesh.material.color.set(0xffffff);
                m.mesh.material.emissive.set(0x000000);
                m.mesh.material.emissiveIntensity = 0;
                m.mesh.material.needsUpdate = true;
            });
        });

        // Texture anneaux Saturne
        loader.load('/textures/texture_saturne_anneaux.png', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            const saturn = planetsRef.current['saturne'];
            if (!saturn) return;
            let ring = null;
            saturn.group.traverse(obj => {
                if (obj.geometry?.type === 'RingGeometry') ring = obj;
            });
            if (!ring) return;
            ring.material.map = tex;
            ring.material.color.set(0xffffff);
            ring.material.needsUpdate = true;
        });

        // Resize
        const onResize = () => {
            const w = el.clientWidth, h = el.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        // ── Boucle de rendu ────────────────────────────────────────────────
        const camDir = new THREE.Vector3();

        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);

            const sel = selectedPlanetRef.current;

            PLANET_DATA.forEach(cfg => {
                const p = planetsRef.current[cfg.name];
                if (!p) return;

                // Orbite
                p.angle += THREE.MathUtils.degToRad(cfg.speed);
                p.group.position.set(Math.cos(p.angle) * cfg.r, 0, Math.sin(p.angle) * cfg.r);
                p.mesh.rotation.y += 0.004 * cfg.rotDir;

                // Arc rotatif : rotation.y = -angle aligne le début de l'arc sur la planète
                // (correction du sens de rotation Three.js vs EllipseCurve)
                p.arc.rotation.y = Math.PI - p.angle;

                // Opacité : fondu des planètes non sélectionnées
                const targetOpacity = sel && cfg.name !== sel ? 0.06 : 1.0;
                p.mesh.material.opacity = THREE.MathUtils.lerp(p.mesh.material.opacity, targetOpacity, 0.05);
                p.arc.material.opacity = THREE.MathUtils.lerp(p.arc.material.opacity, sel && cfg.name !== sel ? 0.04 : 0.28, 0.05);
            });

            // Lunes
            moonsRef.current.forEach(m => {
                m.angle -= THREE.MathUtils.degToRad(m.speed);
                m.mesh.position.set(Math.cos(m.angle) * m.radius, 0, Math.sin(m.angle) * m.radius);
                m.arc.rotation.y = -m.angle;
                m.mesh.rotation.y -= 0.008;
            });

            // Suivi cible
            if (sel && planetsRef.current[sel]) {
                controls.target.lerp(planetsRef.current[sel].group.position, 0.04);
            } else {
                controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.02);
            }

            // Zoom programmé
            camDir.subVectors(camera.position, controls.target);
            const currentDist = camDir.length();
            const desiredDist = targetCamDistRef.current;
            if (Math.abs(currentDist - desiredDist) > 0.005) {
                const newDist = THREE.MathUtils.lerp(currentDist, desiredDist, 0.04);
                camera.position.copy(controls.target.clone().add(camDir.normalize().multiplyScalar(newDist)));
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameRef.current);
            controls.dispose();
            renderer.dispose();
            window.removeEventListener('resize', onResize);
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Lunes ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        moonsRef.current.forEach(m => {
            const parent = planetsRef.current[m.parentName];
            if (parent) { parent.group.remove(m.mesh); parent.group.remove(m.arc); }
            m.mesh.geometry.dispose(); m.mesh.material.dispose();
            m.arc.geometry.dispose(); m.arc.material.dispose();
        });
        moonsRef.current = [];

        if (!selectedPlanet || !moons.length) return;

        const pData = PLANET_DATA.find(c => c.name === selectedPlanet);
        const parent = planetsRef.current[selectedPlanet];
        if (!pData || !parent) return;

        moons.slice(0, nbMoons).forEach((moonData, i) => {
            const moonOrbitR = pData.size * 2.2 + i * pData.size * 1.4;

            // Arc de lune 180° — dans l'espace local du groupe planète
            const arc = makeTrailArc(moonOrbitR, 0xaaaaaa, 0.20, true);
            parent.group.add(arc);

            const moonSize = Math.max(pData.size * 0.20, 0.04);
            const mesh = makeSphere(moonSize, '#c0c0c0', '#0a0a0a');
            mesh.userData = { type: 'moon', name: moonData.id, parentName: selectedPlanet };
            if (moonTexRef.current) {
                mesh.material.map = moonTexRef.current;
                mesh.material.color.set(0xffffff);
                mesh.material.emissive.set(0x000000);
                mesh.material.emissiveIntensity = 0;
                mesh.material.needsUpdate = true;
            }
            parent.group.add(mesh);

            moonsRef.current.push({
                mesh, arc,
                angle: (i / moons.length) * Math.PI * 2,
                // Vitesse lente : 0.06 à 0.25 deg/frame selon l'orbite
                speed: Math.max(0.06, 0.5 / (i + 1)),
                radius: moonOrbitR,
                parentName: selectedPlanet,
            });
        });
    }, [selectedPlanet, moons, nbMoons]);

    // ── Raycasting ────────────────────────────────────────────────────────
    const pointerRef = useRef({ down: false, moved: false });
    const handlePointerDown = useCallback(() => { pointerRef.current = { down: true, moved: false }; }, []);
    const handlePointerMove = useCallback(() => { if (pointerRef.current.down) pointerRef.current.moved = true; }, []);

    const handlePointerUp = useCallback((e) => {
        const { down, moved } = pointerRef.current;
        pointerRef.current = { down: false, moved: false };
        if (!down || moved) return;

        const el = mountRef.current, cam = cameraRef.current, sc = sceneRef.current;
        if (!el || !cam || !sc) return;

        const rect = el.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            ((e.clientY - rect.top) / rect.height) * -2 + 1,
        );
        const rc = new THREE.Raycaster();
        rc.setFromCamera(mouse, cam);

        const meshes = [
            ...Object.values(planetsRef.current).map(p => p.mesh),
            ...moonsRef.current.map(m => m.mesh),
        ];
        const hits = rc.intersectObjects(meshes);
        if (!hits.length) return;

        const { type, name, parentName } = hits[0].object.userData;
        if (type === 'planet') { setFocusOnPlanet(p => !p); focusPlanet(name); }
        else if (type === 'moon') { setFocusOnMoon(p => !p); focusMoon(name, parentName); }
    }, [focusPlanet, focusMoon, setFocusOnPlanet, setFocusOnMoon]);

    return (
        <div
            ref={mountRef}
            style={{ position: 'absolute', inset: 0, cursor: 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        />
    );
}
