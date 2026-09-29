import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ProductCard({ product, index, forcedSide }) {
  const { openProductModal, skyPresets, skyPresetIndex, setSkyPresetById } = useStore();
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [viewSide, setViewSide] = useState('front');

  useEffect(() => {
    if (forcedSide) {
      setViewSide(forcedSide);
    }
  }, [forcedSide]);

  const currentSky = skyPresets[skyPresetIndex];
  const isActiveAtmosphere = currentSky?.id === product.atmosphereId;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.04);
    setRotateY(x * 0.04);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const toggleViewSide = (e) => {
    e.stopPropagation();
    setViewSide((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handleAtmosphereClick = (e) => {
    e.stopPropagation();
    if (product.atmosphereId) {
      setSkyPresetById(product.atmosphereId);
    }
  };

  const currentImage = product.images?.[viewSide] || product.images?.front;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col items-center cursor-pointer group"
      onClick={() => openProductModal(product)}
    >
      {/* Outer Card Frame */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
          boxShadow: isActiveAtmosphere
            ? `0 0 30px ${product.accentColor}40, 0 8px 32px rgba(0,0,0,0.3)`
            : '0 8px 32px rgba(0,0,0,0.15)',
        }}
        className={`w-full aspect-[4/5] rounded-3xl border bg-white/5 backdrop-blur-[2px] transition-all duration-300 p-2.5 sm:p-3.5 flex items-center justify-center relative overflow-hidden ${
          isActiveAtmosphere
            ? 'border-white/90 bg-white/10 ring-1 ring-white/30'
            : 'border-white/40 hover:border-white/80 hover:bg-white/10'
        }`}
      >
        {/* Top-Left: Atmosphere Badge with Sync Action */}
        <div
          onClick={handleAtmosphereClick}
          className={`absolute top-3.5 left-3.5 z-20 px-2.5 py-1 rounded-full backdrop-blur-md text-[8px] font-mono tracking-widest uppercase transition-all flex items-center space-x-1 cursor-pointer select-none ${
            isActiveAtmosphere
              ? 'bg-slate-950/85 border border-sky-300 text-sky-200 shadow-glow-sm scale-105'
              : 'bg-slate-950/70 border border-white/20 text-white/70 hover:text-white hover:border-white/50'
          }`}
          title="Haz clic para activar esta atmósfera en el fondo 3D"
        >
          {isActiveAtmosphere ? (
            <>
              <Sparkles size={10} className="text-sky-300 animate-spin" />
              <span>CIELO ACTIVO</span>
            </>
          ) : (
            <span>{product.badge || 'VER CIELO'}</span>
          )}
        </div>

        {/* Top-Right: Front/Back Quick Switch Pill */}
        <button
          onClick={toggleViewSide}
          className="absolute top-3.5 right-3.5 z-20 px-2.5 py-1 rounded-full bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md border border-white/30 hover:border-white text-[8px] font-mono tracking-wider text-white uppercase transition-all flex items-center space-x-1 shadow-md cursor-pointer"
          title="Alternar vista frontal / trasera"
        >
          <RefreshCw size={9} className="opacity-80 group-hover:rotate-180 transition-transform duration-300" />
          <span className="font-bold">{viewSide === 'front' ? 'VER ESPALDA' : 'VER FRENTE'}</span>
        </button>

        {/* Soft radial glow behind hoodie */}
        <div
          className={`absolute inset-0 filter blur-2xl transition-opacity duration-500 pointer-events-none ${
            isActiveAtmosphere ? 'opacity-40' : 'opacity-10 group-hover:opacity-35'
          }`}
          style={{ backgroundColor: product.accentColor }}
        />

        {/* Floating Streetwear Cutout Hoodie with Crossfade on Side Flip */}
        <AnimatePresence mode="wait">
          <motion.img
            key={viewSide}
            initial={{ opacity: 0.7, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1.06 }}
            exit={{ opacity: 0.7, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            src={currentImage}
            alt={`${product.name} (${viewSide})`}
            className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] group-hover:scale-112 group-hover:-translate-y-1.5 transition-all duration-500 ease-out select-none z-10"
          />
        </AnimatePresence>

        {/* Quick View Hover Pill */}
        <div className="absolute bottom-3 inset-x-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
          <span className="px-3.5 py-1 rounded-full bg-white text-slate-950 text-[10px] font-mono font-bold tracking-widest uppercase shadow-glow-white">
            VER DETALLES
          </span>
        </div>
      </div>

      {/* Typography Underneath Card */}
      <div className="mt-4 text-center space-y-1">
        <h3 className="text-xs font-bold font-mono tracking-[0.18em] text-white uppercase group-hover:text-sky-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          {product.name}
        </h3>
        <p className="text-xs font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          ${product.price.toFixed(2)} {product.currency}
        </p>
      </div>
    </motion.div>
  );
}
