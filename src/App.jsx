import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scene3D from './components/canvas/Scene3D';
import AnnouncementTicker from './components/ui/AnnouncementTicker';
import Navbar from './components/ui/Navbar';
import HeroOverlay from './components/ui/HeroOverlay';
import AtmosphereSpotlight from './components/ui/AtmosphereSpotlight';
import ProductCard from './components/ui/ProductCard';
import ProductDetailModal from './components/ui/ProductDetailModal';
import CartDrawer from './components/ui/CartDrawer';
import SearchModal from './components/ui/SearchModal';
import SizeGuideModal from './components/ui/SizeGuideModal';
import CheckoutModal from './components/ui/CheckoutModal';
import OrderReceiptModal from './components/ui/OrderReceiptModal';
import PolicyModal from './components/ui/PolicyModal';
import VaultModal from './components/ui/VaultModal';
import CustomCursor from './components/ui/CustomCursor';
import InstagramLookbook from './components/ui/InstagramLookbook';
import Footer from './components/ui/Footer';
import { PRODUCTS } from './data/products';
import { useStore } from './store/useStore';
import { Filter, Layers, RefreshCw, X } from 'lucide-react';

export default function App() {
  const {
    isProductModalOpen,
    isCartOpen,
    isSearchOpen,
    isSizeGuideOpen,
    isCheckoutOpen,
    orderReceipt,
    policyModal,
    isVaultOpen,
    notification,
    clearNotification
  } = useStore();

  const [selectedGsm, setSelectedGsm] = useState('ALL'); // 'ALL' | '460' | '480' | '500'
  const [globalSide, setGlobalSide] = useState('front'); // 'front' | 'back'

  // Precision Body-Scroll Lock with layout-shift compensation
  const isAnyModalOpen = Boolean(
    isProductModalOpen ||
    isCartOpen ||
    isSearchOpen ||
    isSizeGuideOpen ||
    isCheckoutOpen ||
    orderReceipt ||
    policyModal ||
    isVaultOpen
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isAnyModalOpen]);

  // Filter products by GSM
  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedGsm === 'ALL') return true;
    return p.tagline.includes(selectedGsm) || p.description.includes(selectedGsm);
  });

  return (
    <div className="relative min-h-screen text-white select-none selection:bg-sky-400 selection:text-black">
      
      {/* Precision Chrome Reactive Cursor */}
      <CustomCursor />

      {/* 3D Photorealistic Cloud Flight Background Canvas (with 5 Switchable Atmospheres) */}
      <Scene3D />

      {/* Foreground UI Layer */}
      <div className="relative z-10">
        
        {/* Top Infinite Announcement Marquee */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnnouncementTicker />
        </div>

        {/* Navigation Bar */}
        <Navbar />

        {/* Hero Section with Centered 3D Rotating Gothic Logo */}
        <HeroOverlay />

        {/* Product Catalog / Drop Section */}
        <main id="shop" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-12 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/20 backdrop-blur-md mb-2 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-sky-300 font-bold">
                COLECCIÓN CÁPSULA // THE 5 ATMOSPHERES
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-display tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              5 SILUETAS INSPIRADAS EN CADA CIELO 3D
            </h2>
            <p className="text-xs font-mono text-white/80 tracking-wider uppercase max-w-xl mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              Cada prenda refleja un estado atmosférico del cielo en tiempo real. Algodón pesado de 460GSM a 500GSM, bordados 3M reflectantes y serigrafía de archivo.
            </p>
          </div>

          {/* Dynamic Active Atmosphere Spotlight Showcase */}
          <AtmosphereSpotlight />

          {/* Filter Toolbar & Capsule Silhouettes */}
          <div className="space-y-6">
            
            {/* Filter and View Controls Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/15 pb-4 gap-3 bg-slate-950/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
              
              {/* Left: GSM Filters */}
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <span className="text-white/60 uppercase font-bold tracking-wider hidden sm:inline flex items-center space-x-1">
                  <Filter size={11} className="inline mr-1" />
                  GRAMAJE:
                </span>
                {['ALL', '460', '480', '500'].map((gsm) => (
                  <button
                    key={gsm}
                    onClick={() => setSelectedGsm(gsm)}
                    className={`px-3 py-1 rounded-full border tracking-widest uppercase transition-all cursor-pointer ${
                      selectedGsm === gsm
                        ? 'bg-white text-slate-950 font-bold border-white shadow-glow-white'
                        : 'bg-white/5 border-white/20 text-white/70 hover:text-white hover:border-white/50'
                    }`}
                  >
                    {gsm === 'ALL' ? 'TODAS (5)' : `${gsm} GSM`}
                  </button>
                ))}
              </div>

              {/* Right: Global Front / Back Toggle */}
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <span className="text-white/60 uppercase font-bold tracking-wider hidden sm:inline">
                  VISTA GLOBAL:
                </span>
                <button
                  onClick={() => setGlobalSide('front')}
                  className={`px-3 py-1 rounded-full border tracking-wider uppercase transition-all cursor-pointer ${
                    globalSide === 'front'
                      ? 'bg-sky-400 text-slate-950 font-bold border-sky-400 shadow-glow-sm'
                      : 'bg-white/5 border-white/20 text-white/70 hover:text-white'
                  }`}
                >
                  FRENTE
                </button>
                <button
                  onClick={() => setGlobalSide('back')}
                  className={`px-3 py-1 rounded-full border tracking-wider uppercase transition-all cursor-pointer ${
                    globalSide === 'back'
                      ? 'bg-sky-400 text-slate-950 font-bold border-sky-400 shadow-glow-sm'
                      : 'bg-white/5 border-white/20 text-white/70 hover:text-white'
                  }`}
                >
                  ESPALDA
                </button>
              </div>

            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  forcedSide={globalSide}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 font-mono text-xs text-white/60">
                No hay prendas con el filtro seleccionado.
              </div>
            )}

          </div>

        </main>

        {/* Social Feed / Instagram Lookbook */}
        <InstagramLookbook />

        {/* Brand Footer with Policies and Newsletter */}
        <Footer />

      </div>

      {/* Global Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <SearchModal />
      <SizeGuideModal />
      <CheckoutModal />
      <OrderReceiptModal />
      <PolicyModal />
      <VaultModal />

      {/* Floating Real-Time Toast Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onClick={clearNotification}
            className={`fixed bottom-6 right-6 z-[9990] max-w-sm px-4 py-3 rounded-2xl glass-panel border flex items-center justify-between shadow-2xl cursor-pointer ${
              notification.type === 'warning'
                ? 'border-amber-400/60 bg-amber-950/85 text-amber-200'
                : notification.type === 'success'
                ? 'border-emerald-400/60 bg-emerald-950/85 text-emerald-200'
                : 'border-sky-400/60 bg-slate-950/90 text-white'
            }`}
          >
            <span className="text-xs font-mono font-bold tracking-wider mr-3">{notification.msg}</span>
            <X size={14} className="opacity-60 hover:opacity-100 flex-shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
