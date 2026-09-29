import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PRODUCTS } from '../../data/products';

export default function AtmosphereSpotlight() {
  const { skyPresets, skyPresetIndex, openProductModal, addToCart } = useStore();
  const currentSky = skyPresets[skyPresetIndex];
  
  // Find matching product for current 3D sky atmosphere
  const activeProduct = PRODUCTS.find((p) => p.atmosphereId === currentSky?.id) || PRODUCTS[0];

  return (
    <div className="mb-16">
      {/* Editorial Spotlight Card */}
      <motion.div
        key={activeProduct.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl glass-panel border border-white/30 overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.35)] p-6 sm:p-10"
        style={{
          boxShadow: `0 0 50px ${activeProduct.accentColor}25, 0 12px 45px rgba(0,0,0,0.35)`
        }}
      >
        {/* Soft background ambient radial wash */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full filter blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: activeProduct.accentColor }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full filter blur-3xl opacity-15 pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: activeProduct.accentColor }}
        />

        {/* Header Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-white/10 pb-5">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-sky-300">
              PIEZA VINCULADA AL CIELO ACTUAL // {currentSky?.badge || 'ATMÓSFERA'}
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
            DROP 01 • EDICIÓN OFICIAL 460-500GSM
          </span>
        </div>

        {/* Main Showcase Layout: Two Large Garments Side-by-Side (Front & Back) + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Garment Images: Front & Back Dual Showcase (Cols 1-7) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Front View */}
            <div 
              onClick={() => openProductModal(activeProduct)}
              className="relative aspect-square rounded-2xl bg-white/5 border border-white/20 hover:border-white/50 transition-all p-3 sm:p-4 flex flex-col items-center justify-center group cursor-pointer overflow-hidden shadow-inner"
            >
              <span className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[8px] font-mono tracking-widest uppercase text-white/80 border border-white/10">
                VISTA FRONTAL // BORDADO
              </span>
              <motion.img
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                src={activeProduct.images.front}
                alt={`${activeProduct.name} - Front`}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.65)] group-hover:scale-108 transition-transform duration-300"
              />
              <span className="absolute bottom-2 text-[9px] font-mono tracking-wider text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                CLIC PARA INSPECCIONAR
              </span>
            </div>

            {/* Back View */}
            <div 
              onClick={() => openProductModal(activeProduct)}
              className="relative aspect-square rounded-2xl bg-white/5 border border-white/20 hover:border-white/50 transition-all p-3 sm:p-4 flex flex-col items-center justify-center group cursor-pointer overflow-hidden shadow-inner"
            >
              <span className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[8px] font-mono tracking-widest uppercase text-white/80 border border-white/10">
                VISTA DORSAL // ARTE COMPLETO
              </span>
              <motion.img
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                src={activeProduct.images.back}
                alt={`${activeProduct.name} - Back`}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.65)] group-hover:scale-108 transition-transform duration-300"
              />
              <span className="absolute bottom-2 text-[9px] font-mono tracking-wider text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                CLIC PARA INSPECCIONAR
              </span>
            </div>

          </div>

          {/* Details & Action Panel (Cols 8-12) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono tracking-widest text-sky-300 uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30">
                  {activeProduct.badge}
                </span>
                <span className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                  {activeProduct.color}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-[0.15em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                {activeProduct.name}
              </h3>

              <p className="text-xs font-mono text-sky-200/90 tracking-wide uppercase">
                {activeProduct.tagline}
              </p>

              <p className="text-xs text-white/70 font-mono leading-relaxed uppercase pt-1 line-clamp-3">
                {activeProduct.description}
              </p>

              <div className="pt-2 flex items-baseline space-x-3">
                <span className="text-2xl font-bold font-mono text-white">
                  ${activeProduct.price.toFixed(2)} {activeProduct.currency}
                </span>
                <span className="text-[10px] font-mono text-white/50 tracking-wider uppercase">
                  ENVÍO EXPRESS INTERNACIONAL INCLUIDO
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openProductModal(activeProduct, 'front')}
                  className="flex-1 py-3 px-5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-sky-200 transition-all flex items-center justify-center space-x-2 shadow-glow-white cursor-pointer"
                >
                  <Eye size={15} />
                  <span>INSPECCIONAR PRENDA</span>
                </button>

                <button
                  onClick={() => addToCart(activeProduct, 'L')}
                  className="py-3 px-6 rounded-full glass-pill hover:bg-white/20 text-white font-mono text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-2 border border-white/30 cursor-pointer"
                >
                  <ShoppingBag size={15} />
                  <span>AÑADIR (TALLA L)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => openProductModal(activeProduct, 'clean')}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-500/20 border border-sky-400/40 hover:bg-sky-500/30 hover:border-sky-300 text-sky-200 font-mono text-[10px] font-bold tracking-[0.14em] uppercase transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                  title="Ver el arte vectorial aislado sin prenda"
                >
                  <Sparkles size={12} className="text-sky-300" />
                  <span>VER DISEÑO PURO 1:1</span>
                </button>

                {activeProduct.artworkBoard && (
                  <button
                    onClick={() => openProductModal(activeProduct, 'artwork')}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-400/40 hover:bg-amber-500/25 hover:border-amber-300 text-amber-200 font-mono text-[10px] font-bold tracking-[0.14em] uppercase transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    title="Ver la lámina técnica HD (1200x1200px)"
                  >
                    <Eye size={12} className="text-amber-300" />
                    <span>LÁMINA TÉCNICA HD</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
