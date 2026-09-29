import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Sparkles, User, Menu, X, Volume2, VolumeX, Key, Lock } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Navbar() {
  const {
    cart,
    toggleCart,
    skyPresets,
    skyPresetIndex,
    nextSkyPreset,
    openSearch,
    isSoundEnabled,
    toggleSound,
    openPolicyModal,
    openVault
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const year = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTimeString(`${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentSky = skyPresets[skyPresetIndex];

  return (
    <header className="fixed top-7 sm:top-8 left-0 right-0 z-40 px-5 sm:px-10 py-3 sm:py-4 pointer-events-auto transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Links: En Español */}
        <div className="hidden md:flex flex-col space-y-1 text-xs font-mono font-bold tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          <div className="flex items-center space-x-7">
            <a href="#shop" className="hover:text-sky-300 transition-colors">CATÁLOGO</a>
            <a href="#shop" className="hover:text-sky-300 transition-colors">COLECCIONES</a>
            <button onClick={() => openPolicyModal('contact')} className="hover:text-sky-300 transition-colors uppercase cursor-pointer">
              CONTACTO
            </button>
          </div>
          <div>
            <a href="#lookbook" className="hover:text-sky-300 transition-colors text-white/80">LOOKBOOK VIRTUAL</a>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white glass-pill rounded-full cursor-pointer"
          aria-label="Abrir navegación"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Center: Gothic "Synical" + Live Clock */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer select-none flex flex-col items-center text-center group pt-1.5 sm:pt-2"
        >
          <span className="font-gothic text-2xl sm:text-3xl text-white tracking-widest drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)] group-hover:scale-105 transition-transform leading-tight">
            Synical
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.22em] text-white/80 uppercase mt-0.5 select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {timeString || '9/28/2026 8:15:10 PM'}
          </span>
        </div>

        {/* Right Actions: Atmosphere Switcher, Sound, Search, Account, Bag */}
        <div className="flex items-center space-x-2.5 sm:space-x-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          
          {/* Atmosphere Preset Switcher */}
          <button
            onClick={nextSkyPreset}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full glass-pill hover:bg-white/20 transition-all text-[10px] font-mono font-bold tracking-widest uppercase text-white shadow-glass cursor-pointer"
            title="Cambiar atmósfera 3D"
          >
            <Sparkles size={12} className="text-sky-300 animate-spin" />
            <span className="hidden sm:inline">{currentSky.badge}</span>
          </button>

          {/* Sound Design Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-full border transition-all text-xs cursor-pointer ${
              isSoundEnabled
                ? 'bg-purple-500/25 border-purple-400/60 text-purple-300 shadow-glow-sm'
                : 'glass-pill border-white/20 text-white/70 hover:text-white'
            }`}
            title={isSoundEnabled ? "Silenciar audio cyber" : "Activar audio ambiental cyber"}
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Search Trigger */}
          <button
            onClick={openSearch}
            className="p-1.5 hover:text-sky-300 transition-colors cursor-pointer"
            aria-label="Buscar productos"
            title="Buscar productos (Ctrl+K)"
          >
            <Search size={19} />
          </button>

          {/* VIP Drop Vault Trigger */}
          <button
            onClick={openVault}
            className="p-1.5 hover:text-purple-300 transition-colors cursor-pointer relative group"
            aria-label="Acceso VIP // Drop Vault"
            title="Acceso VIP // Drop Vault"
          >
            <Lock size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          </button>

          {/* Cart Bag */}
          <button
            onClick={toggleCart}
            className="relative p-1.5 hover:text-sky-300 transition-colors cursor-pointer"
            aria-label="Bolsa de compras"
            title="Ver tu bolsa"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-white text-slate-950 text-[10px] font-mono font-bold shadow-glow-white">
                {totalItems}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 mx-2 p-5 rounded-2xl glass-panel space-y-4 text-center text-xs font-mono font-bold tracking-widest uppercase shadow-2xl border border-white/25">
          <a href="#shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white hover:text-sky-300">
            Catálogo Completo
          </a>
          <button onClick={() => { setMobileMenuOpen(false); openVault(); }} className="block w-full py-2 text-purple-300 hover:text-white uppercase font-bold">
            🔐 Acceso VIP // Drop Vault
          </button>
          <a href="#lookbook" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white/80 hover:text-sky-300">
            Lookbook Virtual
          </a>
          <button onClick={() => { setMobileMenuOpen(false); openPolicyModal('contact'); }} className="block w-full py-2 text-white hover:text-sky-300 uppercase">
            Contacto y Soporte
          </button>
        </div>
      )}
    </header>
  );
}
