import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

function ExtrudedMesh({ shapes, depth, bevelThickness, bevelSize, materialProps, position = [0, 0, 0] }) {
  const geom = useMemo(() => {
    if (!shapes || shapes.length === 0) return null;
    return new THREE.ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 5,
      curveSegments: 16,
    });
  }, [shapes, depth, bevelThickness, bevelSize]);

  if (!geom) return null;

  return (
    <mesh geometry={geom} position={position} castShadow receiveShadow>
      <meshPhysicalMaterial {...materialProps} />
    </mesh>
  );
}

export default function GothicRotatingLogo3D() {
  const groupRef = useRef();

  // Load the SVGs: Clean Gothic letters and the Gothic Cross (Option 4)
  const lettersSvg = useLoader(SVGLoader, '/gothic_letters.svg');
  const crossSvg = useLoader(SVGLoader, '/gothic_cross.svg');

  // Convert SVG paths to 2D Shapes for 3D Extrusion
  const letterShapes = useMemo(() => {
    if (!lettersSvg?.paths) return [];
    return lettersSvg.paths.flatMap((path) => path.toShapes(true));
  }, [lettersSvg]);

  const crossShapes = useMemo(() => {
    if (!crossSvg?.paths) return [];
    return crossSvg.paths.flatMap((path) => path.toShapes(true));
  }, [crossSvg]);

  // Continuous 360 rotation and mouse parallax
  useFrame((state, delta) => {
    if (groupRef.current) {
      // 360 Continuous Smooth Rotation on Y axis
      groupRef.current.rotation.y += delta * 0.75;

      // Mouse parallax tilt
      const mouseX = state.pointer.x * 0.28;
      const mouseY = state.pointer.y * 0.18;
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouseX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY, 0.05);
    }
  });

  return (
    <Float speed={2.0} rotationIntensity={0.08} floatIntensity={0.15}>
      <group ref={groupRef} position={[0, 0.10, 0]} scale={0.70}>
        <Center>
          
          {/* 1. Option 4: 3D Gothic Chrome Cross / Dagger Behind the Letters (Chrome Hearts / Trapstar style) */}
          <ExtrudedMesh
            shapes={crossShapes}
            depth={0.18}
            bevelThickness={0.045}
            bevelSize={0.035}
            position={[0, 0.08, -0.10]}
            materialProps={{
              color: '#f1f5f9',
              metalness: 0.99,
              roughness: 0.05,
              clearcoat: 1.0,
              clearcoatRoughness: 0.03,
              reflectivity: 1.0,
              envMapIntensity: 3.2,
            }}
          />

          {/* 2. Main 3D Gothic Letters ("Synical") + Cyber Apex Star (Clean, without any thick backplate/bisel) */}
          <ExtrudedMesh
            shapes={letterShapes}
            depth={0.28}
            bevelThickness={0.055}
            bevelSize={0.04}
            position={[0, 0, 0.06]}
            materialProps={{
              color: '#ffffff',
              metalness: 0.99,
              roughness: 0.02,
              clearcoat: 1.0,
              clearcoatRoughness: 0.015,
              reflectivity: 1.0,
              envMapIntensity: 3.8,
            }}
          />

          {/* 3. Floating Cyber Star & Cross Diamond Sparkles (ToneMapped false for intense Neon Bloom) */}
          <mesh position={[0, 1.25, 0.2]}>
            <octahedronGeometry args={[0.085]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh position={[0, 2.05, 0.05]}>
            <octahedronGeometry args={[0.06]} />
            <meshBasicMaterial color="#f0abfc" toneMapped={false} />
          </mesh>
          <mesh position={[0, -1.85, 0.05]}>
            <octahedronGeometry args={[0.06]} />
            <meshBasicMaterial color="#c084fc" toneMapped={false} />
          </mesh>
          <mesh position={[-1.4, 0.95, 0.05]}>
            <octahedronGeometry args={[0.05]} />
            <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
          </mesh>
          <mesh position={[1.4, 0.95, 0.05]}>
            <octahedronGeometry args={[0.05]} />
            <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
          </mesh>
          <mesh position={[-2.1, 0.18, 0.15]}>
            <octahedronGeometry args={[0.05]} />
            <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
          </mesh>
          <mesh position={[2.1, -0.05, 0.15]}>
            <octahedronGeometry args={[0.05]} />
            <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
          </mesh>

        </Center>
      </group>
    </Float>
  );
}
