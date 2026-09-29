import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function ChromeLogo({ scrollY = 0 }) {
  const meshRef = useRef();
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle continuous rotation
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;

      // Mouse tracking inertia
      const mouseX = state.pointer.x * 0.4;
      const mouseY = state.pointer.y * 0.4;
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, -mouseX, 0.05);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
      <group ref={groupRef} position={[0, 0.4, 0]}>
        {/* Core Chrome Emblem - Complex Torus Knot / Monogram */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <torusKnotGeometry args={[1.3, 0.38, 160, 32, 2, 3]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.98}
            roughness={0.06}
            reflectivity={1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* Orbiting Glass Halo Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.2, 0.04, 32, 100]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
    </Float>
  );
}
