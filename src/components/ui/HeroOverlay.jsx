import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroOverlay() {
  const scrollToShop = () => {
    const el = document.getElementById('shop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-end items-center pb-12 sm:pb-14 px-4 z-10 pointer-events-none">

      {/* Middle Interactive Hotspot over the 3D Rotating Gothic Logo */}
      <div 
        onClick={scrollToShop}
        className="pointer-events-auto my-auto w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center cursor-pointer"
        title="Haz clic para entrar a la colección"
      />

      {/* Bottom CTA Button en Español */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="pointer-events-auto flex flex-col items-center space-y-4"
      >
        <button
          onClick={scrollToShop}
          className="group flex items-center space-x-3 px-8 py-3 rounded-full glass-pill hover:bg-white hover:text-slate-950 transition-all duration-300 text-xs font-bold tracking-[0.25em] uppercase text-white shadow-glass hover:shadow-glass-hover"
        >
          <span>ENTRAR A LA TIENDA</span>
          <ChevronDown size={15} className="group-hover:translate-y-1 transition-transform" />
        </button>

        <span className="text-[10px] font-mono tracking-[0.3em] text-white/60 uppercase">
          DESLIZA PARA EXPLORAR EL DROP
        </span>
      </motion.div>

    </section>
  );
}
