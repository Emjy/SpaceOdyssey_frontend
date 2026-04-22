'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const RENDER_SIZE = 256;

export default function EarthSphere() {
    const mountRef = useRef(null);
    const frameRef = useRef(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;

        // --- Scène ---
        const scene = new THREE.Scene();

        // Caméra carrée (1:1) alignée sur l'axe Z
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.z = 2.8;

        // Renderer transparent, taille interne fixe — CSS s'occupe du scaling
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(RENDER_SIZE, RENDER_SIZE);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.borderRadius = '50%';

        // --- Texture Terre ---
        const loader = new THREE.TextureLoader();
        const texture = loader.load('/textures/texture_terre.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;

        // --- Sphère ---
        // SphereGeometry mappe les textures en projection équirectangulaire.
        // On crée un groupe pour séparer l'inclinaison axiale (fixe) de la rotation (dynamique).
        const earthGroup = new THREE.Group();
        // Inclinaison axiale réelle de la Terre : 23.4°
        earthGroup.rotation.z = THREE.MathUtils.degToRad(23.4);
        scene.add(earthGroup);

        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            specular: new THREE.Color(0x112244),
            shininess: 25,
        });
        const sphere = new THREE.Mesh(geometry, material);
        earthGroup.add(sphere);

        // --- Lumières ---
        scene.add(new THREE.AmbientLight(0x223355, 0.7));

        const sunLight = new THREE.DirectionalLight(0xffeedd, 2.4);
        sunLight.position.set(5, 2, 3);
        scene.add(sunLight);

        // --- OrbitControls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.rotateSpeed = 0.6;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;

        // Suivi du drag pour distinguer click vs. rotation
        let isUserControlling = false;
        let resumeTimer = null;

        controls.addEventListener('start', () => {
            isDraggingRef.current = false;
            isUserControlling = true;
            if (resumeTimer) clearTimeout(resumeTimer);
        });
        controls.addEventListener('change', () => {
            isDraggingRef.current = true;
        });
        controls.addEventListener('end', () => {
            resumeTimer = setTimeout(() => { isUserControlling = false; }, 1500);
        });

        // --- Boucle de rendu ---
        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);
            // Rotation automatique de la surface (pause quand l'utilisateur contrôle)
            if (!isUserControlling) {
                sphere.rotation.y += 0.004;
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameRef.current);
            if (resumeTimer) clearTimeout(resumeTimer);
            controls.dispose();
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            texture.dispose();
            if (el.contains(renderer.domElement)) {
                el.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                // Les events passent au canvas Three.js pour OrbitControls
                // Le click bubbles jusqu'au parent Planet sauf si l'user a dragué
            }}
            // Empêcher le drag sur la sphère d'incliner le système solaire
            onMouseDown={(e) => e.stopPropagation()}
            // Empêcher le scroll sur la sphère de zoomer le système solaire
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => {
                // Si l'user a fait un drag → ne pas déclencher focusPlanet
                if (isDraggingRef.current) {
                    e.stopPropagation();
                    isDraggingRef.current = false;
                }
            }}
        />
    );
}
