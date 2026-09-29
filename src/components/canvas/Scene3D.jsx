import React, { useRef, Component, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { Sparkles } from 'lucide-react';
import SkyAtmosphere3D from './SkyAtmosphere3D';
import GothicRotatingLogo3D from './GothicRotatingLogo3D';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error("Canvas error caught:", error);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function FloatingLogoHolder() {
  const holderRef = useRef();

  useFrame(() => {
    if (holderRef.current) {
      // High-performance scroll tracking directly inside the 60/120fps render loop
      // Zero React state updates, zero re-renders during scrolling!
      const currentScroll = typeof window !== 'undefined' ? window.scrollY : 0;
      const factor = Math.max(0, 1 - currentScroll / 420);
      holderRef.current.scale.setScalar(Math.max(0.0001, factor));
      holderRef.current.position.y = (1 - factor) * 1.2;
    }
  });

  return (
    <group ref={holderRef}>
      <GothicRotatingLogo3D />
    </group>
  );
}

export default function Scene3D() {
  const { skyPresets, skyPresetIndex, nextSkyPreset } = useStore();
  const currentPreset = skyPresets[skyPresetIndex] || skyPresets[0];

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#0c1a30]">
      
      {/* 100% Real-time 3D WebGL Canvas (NO VIDEO PLAYER) */}
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Real-time Dynamic Atmospheric Lighting */}
          <ambientLight 
            color={currentPreset.ambientColor} 
            intensity={currentPreset.ambientIntensity} 
          />
          <directionalLight 
            position={currentPreset.sunPosition} 
            intensity={currentPreset.sunIntensity} 
            color={currentPreset.sunColor} 
          />
          <directionalLight 
            position={[-10, -5, -5]} 
            intensity={1.2} 
            color={currentPreset.skyHorizon} 
          />
          <pointLight 
            position={[0, 0, 4]} 
            intensity={2.6} 
            color="#ffffff" 
          />

          <Suspense fallback={null}>
            {/* 1. Procedural 3D Atmospheric Sky & Continuous Cloud Flight */}
            <SkyAtmosphere3D />

            {/* 2. Real 3D Extruded Gothic Chrome Emblem ("Synical" + Cyber Star) */}
            <FloatingLogoHolder />

            {/* 3. HDRI Environment for Liquid Chrome Reflections */}
            <Environment preset="city" />

            {/* 4. Cinematic Post-Processing Bloom for Neon & Chrome Flare */}
            <EffectComposer multisampling={0} disableNormalPass>
              <Bloom
                intensity={1.1}
                luminanceThreshold={0.86}
                luminanceSmoothing={0.35}
                mipmapBlur
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {/* Atmospheric Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-transparent to-sky-950/35 pointer-events-none" />

      {/* Interactive Bottom-Left Atmosphere Mode Selector (The 5 Real-Time 3D Environments) */}
      <div className="absolute bottom-5 left-5 z-30 pointer-events-auto flex items-center space-x-2">
        <button
          onClick={nextSkyPreset}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-full glass-pill hover:bg-white/30 text-[10px] font-mono tracking-widest uppercase text-white/95 transition-all shadow-glass active:scale-95"
          title="Cambiar atmósfera 3D"
        >
          <Sparkles size={12} className="text-sky-300 animate-pulse" />
          <span className="font-semibold">{currentPreset.name}</span>
          <span className="text-[8px] text-sky-200/70 bg-white/10 px-1.5 py-0.5 rounded-full">
            {skyPresetIndex + 1}/5
          </span>
        </button>
      </div>

    </div>
  );
}
