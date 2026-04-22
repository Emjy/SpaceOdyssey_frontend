'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Couleurs de base — seront remplacées par les textures plus tard
const PLANET_COLORS = {
    mercure: { color: '#b0a898', emissive: '#1a1510' },
    venus:   { color: '#e8c87a', emissive: '#1e1400' },
    terre:   { color: '#3d6ea8', emissive: '#040d18' },
    mars:    { color: '#c1440e', emissive: '#1a0400' },
    jupiter: { color: '#c8914a', emissive: '#120800' },
    saturne: { color: '#e4d090', emissive: '#181400' },
    uranus:  { color: '#7de8e8', emissive: '#041414' },
    neptune: { color: '#2244cc', emissive: '#020410' },
    pluton:  { color: '#8a7060', emissive: '#0a0806' },
};

// Taille interne fixe — CSS gère le scaling visuel
const RENDER_SIZE = 256;

export default function PlanetSphere({ name }) {
    const mountRef = useRef(null);
    const frameRef = useRef(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;

        const cfg = PLANET_COLORS[name] ?? { color: '#888888', emissive: '#080808' };

        // --- Scène ---
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.z = 2.8;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(RENDER_SIZE, RENDER_SIZE);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        el.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.borderRadius = '50%';

        // --- Sphère ---
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(cfg.color),
            emissive: new THREE.Color(cfg.emissive),
            specular: new THREE.Color(0x1a1a2a),
            shininess: 12,
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.castShadow = true;
        scene.add(sphere);

        // Lumière ambiante très faible → côté nuit bien sombre
        scene.add(new THREE.AmbientLight(0x111122, 0.25));

        // Lumière du soleil — forte + légèrement chaude
        const sunLight = new THREE.DirectionalLight(0xfff4d0, 2.8);
        sunLight.position.set(5, 2, 3);
        sunLight.castShadow = false; // Pas besoin de shadow map sur la sphère elle-même
        scene.add(sunLight);

        // Lumière de remplissage très douce (côté ombre légèrement visible)
        const fillLight = new THREE.DirectionalLight(0x4455aa, 0.15);
        fillLight.position.set(-3, -1, -2);
        scene.add(fillLight);

        // --- OrbitControls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.rotateSpeed = 0.6;

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
            if (!isUserControlling) sphere.rotation.y += 0.004;
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
            if (el.contains(renderer.domElement)) {
                el.removeChild(renderer.domElement);
            }
        };
    }, [name]);

    return (
        <div
            ref={mountRef}
            style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}
            onMouseDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => {
                if (isDraggingRef.current) {
                    e.stopPropagation();
                    isDraggingRef.current = false;
                }
            }}
        />
    );
}
