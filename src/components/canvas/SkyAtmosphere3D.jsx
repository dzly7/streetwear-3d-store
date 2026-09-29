import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clouds, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

// Vertex shader for full-screen atmospheric quad
const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader: Infinite 3D procedural cloud flight over a boundless sky ocean
const fragmentShader = `
uniform float uTime;
uniform float uSpeed;
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;
uniform vec3 uCloudSunColor;
uniform vec3 uCloudShadowColor;
uniform vec3 uSunPosition;
uniform vec3 uSunColor;
uniform vec3 uFogColor;
uniform float uHasStars;
uniform vec2 uMouse;

varying vec2 vUv;
varying vec3 vPosition;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 5-octave Fractal Brownian Motion
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x += uMouse.x * 0.06;
  uv.y += uMouse.y * 0.04;

  float horizon = -0.12;
  vec3 color = vec3(0.0);
  vec3 sunDir = normalize(uSunPosition);

  if (uv.y > horizon) {
    // Upper Sky Dome
    float skyT = clamp((uv.y - horizon) / (1.0 - horizon), 0.0, 1.0);
    vec3 skyGrad = mix(uSkyHorizon, uSkyZenith, pow(skyT, 0.7));

    // Sun corona & glow
    vec2 sunScreenPos = vec2(sunDir.x * 0.45, sunDir.y * 0.45);
    float sunDist = length(uv - sunScreenPos);
    float sunCorona = exp(-sunDist * 3.2);
    float sunDisk = smoothstep(0.05, 0.015, sunDist);
    vec3 sunLight = uSunColor * (sunDisk * 2.5 + sunCorona * 0.85);

    color = skyGrad + sunLight;

    if (uHasStars > 0.5) {
      float starVal = pow(hash(floor(uv * 160.0)), 26.0);
      float twinkle = sin(uTime * 3.5 + hash(floor(uv * 160.0)) * 6.28) * 0.5 + 0.5;
      color += vec3(starVal * twinkle * 1.8);
    }
  } else {
    // Lower Cloud Flight Sea (Perspective Projection)
    float depth = horizon - uv.y;
    float z = 1.0 / max(depth, 0.005);
    float x = uv.x * z * 0.85;

    // Forward flight vector
    vec2 cloudCoord = vec2(x * 0.16, z * 0.24 + uTime * uSpeed);

    float baseFbm = fbm(cloudCoord);
    float billow = abs(fbm(cloudCoord * 1.5 + vec2(uTime * uSpeed * 0.25, 0.0)) - 0.5) * 2.0;
    float cloudDensity = clamp(baseFbm * 0.65 + billow * 0.5, 0.0, 1.0);

    // Sun rim scattering
    float sunAngle = dot(normalize(vec2(x, z)), normalize(sunDir.xz));
    float silverLining = pow(clamp(sunAngle * 0.5 + 0.5, 0.0, 1.0), 3.0) * 0.65;
    float heightHighlight = pow(cloudDensity, 1.4);

    vec3 cloudLit = mix(uCloudShadowColor, uCloudSunColor, heightHighlight);
    cloudLit += uSunColor * (silverLining * heightHighlight * 0.55);

    // Atmospheric aerial perspective distance fog
    float fogFactor = clamp(1.0 - exp(-z * 0.085), 0.0, 1.0);
    color = mix(cloudLit, uFogColor, fogFactor);
  }

  // Soft atmospheric transition at the horizon seam
  float seamDist = abs(uv.y - horizon);
  if (seamDist < 0.06) {
    float blendT = smoothstep(0.0, 0.06, seamDist);
    color = mix(uSkyHorizon, color, blendT);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function SkyAtmosphere3D() {
  const { skyPresets, skyPresetIndex } = useStore();
  const currentPreset = skyPresets[skyPresetIndex] || skyPresets[0];

  const meshRef = useRef();
  const cloudGroupRef = useRef();

  // Color targets for smooth interpolation
  const targetZenith = useMemo(() => new THREE.Color(currentPreset.skyZenith), [currentPreset]);
  const targetHorizon = useMemo(() => new THREE.Color(currentPreset.skyHorizon), [currentPreset]);
  const targetCloudSun = useMemo(() => new THREE.Color(currentPreset.cloudSunColor), [currentPreset]);
  const targetCloudShadow = useMemo(() => new THREE.Color(currentPreset.cloudShadowColor), [currentPreset]);
  const targetSunColor = useMemo(() => new THREE.Color(currentPreset.sunColor), [currentPreset]);
  const targetFogColor = useMemo(() => new THREE.Color(currentPreset.fogColor), [currentPreset]);

  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 0.12 },
    uSkyZenith: { value: new THREE.Color(currentPreset.skyZenith) },
    uSkyHorizon: { value: new THREE.Color(currentPreset.skyHorizon) },
    uCloudSunColor: { value: new THREE.Color(currentPreset.cloudSunColor) },
    uCloudShadowColor: { value: new THREE.Color(currentPreset.cloudShadowColor) },
    uSunPosition: { value: new THREE.Vector3(...currentPreset.sunPosition) },
    uSunColor: { value: new THREE.Color(currentPreset.sunColor) },
    uFogColor: { value: new THREE.Color(currentPreset.fogColor) },
    uHasStars: { value: currentPreset.stars ? 1.0 : 0.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const mat = meshRef.current.material;
      mat.uniforms.uTime.value += delta;

      // Smooth color transitions between presets
      mat.uniforms.uSkyZenith.value.lerp(targetZenith, 0.08);
      mat.uniforms.uSkyHorizon.value.lerp(targetHorizon, 0.08);
      mat.uniforms.uCloudSunColor.value.lerp(targetCloudSun, 0.08);
      mat.uniforms.uCloudShadowColor.value.lerp(targetCloudShadow, 0.08);
      mat.uniforms.uSunColor.value.lerp(targetSunColor, 0.08);
      mat.uniforms.uFogColor.value.lerp(targetFogColor, 0.08);

      mat.uniforms.uHasStars.value = THREE.MathUtils.lerp(
        mat.uniforms.uHasStars.value, 
        currentPreset.stars ? 1.0 : 0.0, 
        0.1
      );

      // Mouse parallax in shader
      mat.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
        mat.uniforms.uMouse.value.x, 
        state.pointer.x, 
        0.05
      );
      mat.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
        mat.uniforms.uMouse.value.y, 
        state.pointer.y, 
        0.05
      );
    }

    // Gentle motion for 3D midground volumetric clouds
    if (cloudGroupRef.current) {
      cloudGroupRef.current.position.y = -1.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      cloudGroupRef.current.rotation.y = state.pointer.x * 0.05;
    }
  });

  return (
    <>
      {/* 1. Deep 3D Atmospheric Sky & Infinite Cloud Flight Plane (Far background) */}
      <mesh ref={meshRef} position={[0, 0, -25]}>
        <planeGeometry args={[110, 70]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          depthWrite={false}
        />
      </mesh>

      {/* 2. True 3D Midground Volumetric Clouds (Floating around and behind the Gothic Logo) */}
      <group ref={cloudGroupRef} position={[0, -1.2, -4]}>
        <Clouds material={THREE.MeshLambertMaterial} limit={200} range={200}>
          {/* Left flank cloud cluster */}
          <Cloud
            seed={101}
            scale={1.8}
            volume={4}
            color={currentPreset.cloudSunColor}
            fade={40}
            speed={0.12}
            position={[-5, -0.6, -2]}
            opacity={0.7}
          />
          {/* Right flank cloud cluster */}
          <Cloud
            seed={202}
            scale={1.9}
            volume={4.5}
            color={currentPreset.cloudSunColor}
            fade={40}
            speed={0.15}
            position={[5.2, -0.8, -3]}
            opacity={0.75}
          />
          {/* Low billowing cloud deck just under the logo */}
          <Cloud
            seed={303}
            scale={2.2}
            volume={5}
            color={currentPreset.cloudShadowColor}
            fade={50}
            speed={0.1}
            position={[0, -2.4, -1]}
            opacity={0.65}
          />
        </Clouds>
      </group>
    </>
  );
}
