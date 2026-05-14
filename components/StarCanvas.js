'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeStarShaderMaterial(hexColor, hexEmissive, activity, radius) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor:     { value: new THREE.Color(hexColor) },
            uEmissive:  { value: new THREE.Color(hexEmissive) },
            uTime:      { value: 0 },
            uActivity:  { value: activity },
            uAmplitude: { value: radius * 0.022 },
        },
        vertexShader: /* glsl */`
            uniform float uTime;
            uniform float uAmplitude;
            varying vec3  vNormal;
            varying vec3  vWorldPos;

            float h(vec3 p) {
                p  = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }
            float fbm(vec3 p) {
                float v = 0.0, a = 0.5;
                for (int i = 0; i < 3; i++) {
                    v += a * h(p);
                    p  = p * 2.1 + vec3(5.2, 1.3, 8.7);
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
                vec3 n  = normalize(position);
                float t = uTime * 0.00032;
                float d = (fbm(n * 4.5 + vec3(t, t * 0.71, t * 1.3)) - 0.5) * uAmplitude;
                vec3 displaced = position + normal * d;
                vec4 wp = modelMatrix * vec4(displaced, 1.0);
                vWorldPos   = wp.xyz;
                gl_Position = projectionMatrix * viewMatrix * wp;
            }
        `,
        fragmentShader: /* glsl */`
            uniform vec3  uColor;
            uniform vec3  uEmissive;
            uniform float uTime;
            uniform float uActivity;
            varying vec3  vNormal;
            varying vec3  vWorldPos;

            float h(vec3 p) {
                p  = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }
            float n3(vec3 p) {
                vec3 i = floor(p), f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(mix(h(i),             h(i+vec3(1,0,0)), f.x),
                        mix(h(i+vec3(0,1,0)), h(i+vec3(1,1,0)), f.x), f.y),
                    mix(mix(h(i+vec3(0,0,1)), h(i+vec3(1,0,1)), f.x),
                        mix(h(i+vec3(0,1,1)), h(i+vec3(1,1,1)), f.x), f.y),
                    f.z);
            }
            float fbm(vec3 p) {
                float v = 0.0, a = 0.5;
                for (int i = 0; i < 4; i++) {
                    v += a * n3(p);
                    p  = p * 2.3 + vec3(5.2, 1.3, 8.7);
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec3  N    = normalize(vNormal);
                vec3  V    = normalize(cameraPosition - vWorldPos);
                float NdV  = max(dot(N, V), 0.0);

                float t    = uTime * 0.00028;
                float gran = fbm(N * 7.0 + vec3(t, t * 0.74, t * 1.29));
                float cell = smoothstep(0.35, 0.72, gran);
                float surf = 0.78 + cell * 0.32;

                float spots = 1.0;
                if (uActivity > 0.05) {
                    float st = uTime * 0.000035;
                    for (int i = 0; i < 6; i++) {
                        float fi  = float(i);
                        vec3 axis = normalize(vec3(
                            sin(fi * 2.13 + 1.3 + st * (0.8 + fi * 0.15)),
                            cos(fi * 1.74 + 0.9),
                            sin(fi * 3.31 + 1.5 + st * 0.6)
                        ));
                        float dotNA = dot(N, axis);
                        float sz    = 0.018 + h(vec3(fi, 1.5, 2.2)) * 0.028;
                        float edge  = smoothstep(sz * 2.2, sz * 0.5, 1.0 - dotNA);
                        spots      -= uActivity * 0.38 * edge;
                    }
                    spots = max(spots, 0.42);
                }

                float limb = pow(NdV, 0.55);
                float dark = mix(0.22, 1.0, limb);
                float core = pow(NdV, 2.5) * 0.12;

                vec3 col = uColor * surf * spots * dark * 1.1;
                col     += uEmissive * (0.20 + core) * limb;
                col      = min(col, vec3(1.0));

                float alpha = smoothstep(0.0, 0.18, NdV);
                gl_FragColor = vec4(col, alpha);
            }
        `,
    });
}

export default function StarCanvas({ sys, size = 320 }) {
    const canvasRef  = useRef(null);
    const rendererRef = useRef(null);

    // Init : uniquement quand l'étoile change (pas quand size change)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const color    = sys.starColor    ?? '#ffe880';
        const emissive = sys.starEmissive ?? (sys.isSolar ? '#ffaa22' : color);
        const activity = sys.starActivity ?? (sys.isSolar ? 0.12 : 0.2);
        const radius   = 1.0;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(size, size, true);
        rendererRef.current = renderer;

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0, 3.2);

        const mat  = makeStarShaderMaterial(color, emissive, activity, radius);
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), mat);
        scene.add(mesh);
        scene.add(new THREE.AmbientLight(0xffffff, 0.1));

        let rafId;
        const t0 = performance.now();
        function animate() {
            rafId = requestAnimationFrame(animate);
            mat.uniforms.uTime.value = performance.now() - t0;
            renderer.render(scene, camera);
        }
        animate();

        return () => {
            cancelAnimationFrame(rafId);
            mat.dispose();
            mesh.geometry.dispose();
            renderer.dispose();
            rendererRef.current = null;
        };
    }, [sys.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Resize : sans recréer le renderer
    useEffect(() => {
        const renderer = rendererRef.current;
        if (!renderer) return;
        renderer.setSize(size, size, true);
    }, [size]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: size,
                height: size,
                display: 'block',
            }}
        />
    );
}
