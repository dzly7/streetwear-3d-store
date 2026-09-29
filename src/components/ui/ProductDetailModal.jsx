import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Minus, Plus, Ruler, ShieldCheck, ChevronDown, ChevronUp, AlertCircle, Lock, Sparkles, Eye, ZoomIn, ZoomOut, ExternalLink, Shirt } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ProductDetailModal() {
  const {
    selectedProduct,
    isProductModalOpen,
    closeProductModal,
    addToCart,
    openSizeGuide,
    openCheckout,
    skyPresets,
    skyPresetIndex,
    setSkyPresetById,
    productModalInitialThumb
  } = useStore();

  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState('garment'); // 'garment' | 'clean' | 'artwork'
  const [side, setSide] = useState('front'); // 'front' | 'back'
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showCare, setShowCare] = useState(false);

  useEffect(() => {
    if (isProductModalOpen) {
      if (productModalInitialThumb === 'artwork') {
        setViewMode('artwork');
        setSide('front');
      } else if (productModalInitialThumb === 'clean' || productModalInitialThumb === 'clean_back') {
        setViewMode('clean');
        setSide('back');
      } else if (productModalInitialThumb === 'clean_front') {
        setViewMode('clean');
        setSide('front');
      } else if (productModalInitialThumb === 'back') {
        setViewMode('garment');
        setSide('back');
      } else {
        setViewMode('garment');
        setSide('front');
      }
      setIsZoomed(false);
      setQuantity(1);
    }
  }, [isProductModalOpen, productModalInitialThumb, selectedProduct]);

  if (!isProductModalOpen || !selectedProduct) return null;

  const currentStock = selectedProduct.stock?.[selectedSize] ?? 0;
  const isOutOfStock = currentStock <= 0;

  const handleViewerMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    let addedCount = 0;
    for (let i = 0; i < quantity; i++) {
      const res = addToCart(selectedProduct, selectedSize);
      if (res?.success) addedCount++;
    }
    if (addedCount > 0) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2200);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const res = addToCart(selectedProduct, selectedSize);
    if (res?.success) {
      closeProductModal();
      openCheckout();
    }
  };

  let currentDisplaySrc = '';
  let currentDownloadSrc = '';
  let currentLabel = '';

  if (viewMode === 'garment') {
    currentDisplaySrc = selectedProduct.images[side] || selectedProduct.images.front;
    currentDownloadSrc = currentDisplaySrc;
    currentLabel = side === 'front' 
      ? 'MOCKUP REAL: FRENTE // BORDADO PECHO Y HERRAJES' 
      : 'MOCKUP REAL: ESPALDA // CALIBRACIÓN DORSAL ANATÓMICA';
  } else if (viewMode === 'clean') {
    currentDisplaySrc = selectedProduct.cleanGraphics?.[side] || selectedProduct.images[side];
    currentDownloadSrc = currentDisplaySrc;
    currentLabel = side === 'front' 
      ? 'ARTE AISLADO 1:1: BORDADO PECHO // ALTA DEFINICIÓN VECTORIAL' 
      : 'ARTE AISLADO 1:1: SERIGRAFÍA DORSAL // TRANSPARENCIA PURA SIN FONDO';
  } else {
    currentDisplaySrc = selectedProduct.artworkBoard || selectedProduct.images.front;
    currentDownloadSrc = currentDisplaySrc;
    currentLabel = 'LÁMINA TÉCNICA HD // TECH-PACK & ESPECIFICACIONES (1200x1200PX)';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProductModal}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl rounded-3xl glass-panel p-5 sm:p-9 z-10 border border-white/25 shadow-2xl my-auto max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={closeProductModal}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full glass-pill hover:bg-white/20 text-white/90 hover:text-white transition-colors z-30 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
            
            {/* Left 6 Columns: Floating Garment & Multi-mode viewer */}
            <div className="lg:col-span-6 flex flex-col items-center">
              
              {/* Top View Mode Tabs */}
              <div className="w-full flex items-center justify-between p-1 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 mb-3 gap-1 shadow-lg">
                <button
                  onClick={() => { setViewMode('garment'); setIsZoomed(false); }}
                  className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    viewMode === 'garment'
                      ? 'bg-white text-slate-950 shadow-glow-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title="Ver prenda confeccionada completa"
                >
                  <Shirt size={12} />
                  <span>PRENDA</span>
                </button>

                <button
                  onClick={() => { setViewMode('clean'); setIsZoomed(false); }}
                  className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    viewMode === 'clean'
                      ? 'bg-sky-400 text-slate-950 font-black shadow-glow-sm'
                      : 'text-sky-300 hover:text-white hover:bg-sky-500/20'
                  }`}
                  title="Ver diseño aislado en 1:1 transparente sin prenda"
                >
                  <Sparkles size={12} className={viewMode === 'clean' ? 'text-slate-950' : 'text-sky-300'} />
                  <span>DISEÑO PURO</span>
                </button>

                {selectedProduct.artworkBoard && (
                  <button
                    onClick={() => { setViewMode('artwork'); setIsZoomed(false); }}
                    className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      viewMode === 'artwork'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-glow-sm'
                        : 'text-amber-300 hover:text-white hover:bg-amber-500/20'
                    }`}
                    title="Ver lámina técnica HD con especificaciones"
                  >
                    <Eye size={12} className={viewMode === 'artwork' ? 'text-slate-950' : 'text-amber-300'} />
                    <span>LÁMINA HD</span>
                  </button>
                )}
              </div>

              {/* Central Interactive Viewer with Real-Time Macro Lens Pan */}
              <div 
                onClick={() => setIsZoomed(!isZoomed)}
                onMouseMove={handleViewerMouseMove}
                className={`relative w-full h-80 sm:h-[420px] rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer group shadow-2xl transition-all duration-300 ${
                  viewMode === 'clean'
                    ? 'bg-slate-950 border-2 border-sky-400/40 shadow-[inset_0_0_60px_rgba(56,189,248,0.12)]'
                    : viewMode === 'artwork'
                    ? 'bg-slate-950 border border-amber-400/40'
                    : 'bg-white/5 border border-white/20'
                } ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                title={isZoomed ? 'Clic para alejar. Desliza para explorar la textura' : 'Clic para activar la Lupa Macro HD (inspección 2X)'}
              >
                {/* Millimeter Studio Grid for Clean 1:1 Artworks */}
                {viewMode === 'clean' && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}

                {/* Top-left Badge Indicator */}
                <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[9px] font-mono uppercase text-white/80 shadow-md flex items-center space-x-1.5 select-none">
                  {viewMode === 'clean' ? (
                    <>
                      <Sparkles size={10} className="text-sky-400" />
                      <span className="text-sky-300 font-bold">ARTE AISLADO 1:1</span>
                    </>
                  ) : viewMode === 'artwork' ? (
                    <>
                      <Eye size={10} className="text-amber-400" />
                      <span className="text-amber-300 font-bold">TECH-PACK HD</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>HEAVYWEIGHT FLEECE</span>
                    </>
                  )}
                </div>

                {/* Top-right Zoom indicator */}
                <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[9px] font-mono text-white/80 flex items-center space-x-1 shadow-sm select-none">
                  {isZoomed ? <ZoomOut size={12} className="text-sky-300" /> : <ZoomIn size={12} className="text-sky-300" />}
                  <span className="font-bold">{isZoomed ? 'LUPA MACRO 2X' : 'LUPA ZOOM'}</span>
                </div>

                {/* Main Image with Smooth Crossfade & Real Dynamic Pan */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${viewMode}-${side}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      scale: isZoomed ? (viewMode === 'clean' ? 2.2 : 1.95) : 1,
                      y: isZoomed || viewMode !== 'garment' ? 0 : [-3, 3, -3]
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      transformOrigin: isZoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : '50% 50%'
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      scale: { duration: 0.25 },
                      y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    src={currentDisplaySrc}
                    alt={`${selectedProduct.name} - ${currentLabel}`}
                    className={`max-h-full max-w-full object-contain select-none transition-transform duration-100 ${
                      viewMode === 'clean'
                        ? 'p-8 filter drop-shadow-[0_20px_35px_rgba(56,189,248,0.3)]'
                        : 'filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)]'
                    }`}
                  />
                </AnimatePresence>
              </div>

              {/* Sub-selector for Front / Back (when in Garment or Clean mode) */}
              {viewMode !== 'artwork' ? (
                <div className="flex items-center justify-center gap-2.5 mt-3">
                  <button
                    onClick={() => { setSide('front'); setIsZoomed(false); }}
                    className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-mono tracking-wider uppercase transition-all flex items-center space-x-1.5 cursor-pointer ${
                      side === 'front'
                        ? 'border-white bg-white/25 text-white font-bold shadow-glow-white'
                        : 'border-white/20 bg-white/5 hover:border-white/50 text-white/70'
                    }`}
                  >
                    <span>VISTA FRONTAL (PECHO)</span>
                  </button>

                  <button
                    onClick={() => { setSide('back'); setIsZoomed(false); }}
                    className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-mono tracking-wider uppercase transition-all flex items-center space-x-1.5 cursor-pointer ${
                      side === 'back'
                        ? 'border-white bg-white/25 text-white font-bold shadow-glow-white'
                        : 'border-white/20 bg-white/5 hover:border-white/50 text-white/70'
                    }`}
                  >
                    <span>VISTA DORSAL (ESPALDA)</span>
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-[10px] font-mono text-amber-300/90 text-center tracking-wider uppercase">
                  LÁMINA TÉCNICA OFICIAL // TIPOGRAFÍAS, COORDENADAS Y ESPECIFICACIONES
                </div>
              )}

              {/* Information bar and Fullscreen Link */}
              <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-3 px-1 text-[10px] font-mono text-white/60 gap-1.5">
                <span className="text-center sm:text-left text-white/80">
                  {currentLabel}
                </span>

                <a
                  href={currentDownloadSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:text-white underline uppercase flex items-center space-x-1 cursor-pointer font-bold shrink-0"
                  title="Abrir imagen original en una pestaña nueva"
                >
                  <span>PNG ORIGINAL [↗]</span>
                  <ExternalLink size={11} />
                </a>
              </div>

            </div>

            {/* Right 6 Columns: Details & Actions */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Title & Price */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-sky-300 uppercase px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30">
                    {selectedProduct.badge || 'DROP OFICIAL'}
                  </span>
                  {selectedProduct.atmosphereId && (
                    <button
                      onClick={() => setSkyPresetById(selectedProduct.atmosphereId)}
                      className={`flex items-center space-x-1.5 text-[9px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full transition-all border ${
                        skyPresets[skyPresetIndex]?.id === selectedProduct.atmosphereId
                          ? 'bg-sky-400/20 border-sky-400 text-sky-200 shadow-glow-sm'
                          : 'bg-white/5 border-white/20 text-white/70 hover:text-white hover:border-white/50'
                      }`}
                      title="Activar este cielo 3D en la tienda"
                    >
                      <Sparkles size={10} className={skyPresets[skyPresetIndex]?.id === selectedProduct.atmosphereId ? 'text-sky-300 animate-spin' : 'text-white/60'} />
                      <span>{skyPresets[skyPresetIndex]?.id === selectedProduct.atmosphereId ? 'CIELO 3D ACTIVO' : 'ACTIVAR CIELO 3D'}</span>
                    </button>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-[0.18em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] pt-1">
                  {selectedProduct.name}
                </h2>

                <div className="flex items-baseline space-x-3 pt-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                    ${selectedProduct.price.toFixed(2)} {selectedProduct.currency}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
                    IMPUESTOS INCLUIDOS • ENVÍO GRATIS DISPONIBLE
                  </span>
                </div>
              </div>

              {/* Size Selector + Size Guide Button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/80 font-semibold">
                    SELECCIONA TU TALLA:
                  </span>
                  <button
                    onClick={openSizeGuide}
                    className="flex items-center space-x-1.5 text-[10px] font-mono text-sky-300 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    <Ruler size={13} />
                    <span className="underline">GUÍA DE TALLAS</span>
                  </button>
                </div>

                <div className="flex space-x-2.5">
                  {selectedProduct.sizes.map((size) => {
                    const sizeStock = selectedProduct.stock?.[size] ?? 0;
                    const isSizeEmpty = sizeStock <= 0;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        className={`relative min-w-12 py-2 px-3.5 rounded-full font-mono text-xs font-bold tracking-wider transition-all duration-200 border ${
                          selectedSize === size
                            ? isSizeEmpty
                              ? 'bg-rose-500/20 text-rose-300 border-rose-400'
                              : 'bg-white text-slate-950 border-white shadow-glow-white scale-105'
                            : isSizeEmpty
                            ? 'bg-white/5 text-white/30 border-white/10 opacity-60 line-through'
                            : 'bg-white/5 text-white border-white/25 hover:border-white hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Scarcity Alert for selected size */}
                <div className={`mt-2.5 flex items-center space-x-1.5 text-[10px] font-mono px-3 py-1.5 rounded-lg border ${
                  isOutOfStock 
                    ? 'text-rose-300 bg-rose-950/40 border-rose-500/30' 
                    : currentStock <= 2 
                    ? 'text-amber-300 bg-amber-500/10 border-amber-400/20' 
                    : 'text-sky-300 bg-sky-500/10 border-sky-400/20'
                }`}>
                  <AlertCircle size={13} className="flex-shrink-0" />
                  <span>
                    {isOutOfStock
                      ? `TALLA ${selectedSize} AGOTADA TEMPORALMENTE (SOLD OUT)`
                      : currentStock <= 2
                      ? `¡ÚLTIMAS ${currentStock} PIEZAS DISPONIBLES EN TALLA ${selectedSize}! DROP LIMITADO SIN RESTOCK.`
                      : `DISPONIBLE EN TALLA ${selectedSize} (${currentStock} UNIDADES EN INVENTARIO)`}
                  </span>
                </div>
              </div>

              {/* Quantity Counter */}
              <div>
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/80 block mb-2 font-semibold">
                  CANTIDAD:
                </span>
                <div className="inline-flex items-center space-x-3 px-3 py-1.5 rounded-full border border-white/30 bg-white/5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="p-1 hover:text-sky-300 text-white transition-colors disabled:opacity-30"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-mono text-sm px-2">{isOutOfStock ? 0 : quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= currentStock}
                    className="p-1 hover:text-sky-300 text-white transition-colors disabled:opacity-30"
                  >
                    <Plus size={13} />
                  </button>
                </div>
                {quantity >= currentStock && currentStock > 0 && (
                  <span className="text-[9px] font-mono text-amber-300/80 block mt-1">
                    * Has alcanzado el límite máximo en stock para esta talla.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 rounded-full font-mono text-xs sm:text-sm font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-2 border transition-all duration-300 ${
                    isOutOfStock
                      ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                      : 'glass-pill hover:bg-white/20 text-white border-white/40 shadow-glass'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>TALLA AGOTADA // SOLD OUT</span>
                  ) : addedSuccess ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      <span>¡AGREGADO A TU BOLSA!</span>
                    </>
                  ) : (
                    <span>AGREGAR A LA BOLSA</span>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 rounded-full font-mono text-xs sm:text-sm font-black tracking-[0.2em] uppercase flex items-center justify-center space-x-2 transition-all duration-300 ${
                    isOutOfStock
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-white text-slate-950 hover:bg-sky-200 shadow-glow-white hover:scale-101'
                  }`}
                >
                  <Lock size={14} />
                  <span>{isOutOfStock ? 'PRODUCTO AGOTADO' : 'COMPRAR AHORA'}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-white/60">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Pago 100% Seguro (Apple Pay, Visa, MC)</span>
                </div>
                <div>
                  <span>Garantía de cambio 14 días</span>
                </div>
              </div>

              {/* Product Information Text Block */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/80 block font-bold">
                  ESPECIFICACIONES DE LA PRENDA:
                </span>
                <p className="text-xs font-mono text-white/70 leading-relaxed uppercase">
                  {selectedProduct.description}
                </p>

                {/* Bullets */}
                <ul className="list-disc list-inside space-y-1 text-[11px] font-mono text-white/60 pt-1">
                  {selectedProduct.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* Care Accordion */}
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowCare(!showCare)}
                  className="w-full flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-white/80 hover:text-white py-1 transition-colors"
                >
                  <span className="font-bold">INSTRUCCIONES DE LAVADO Y CUIDADO</span>
                  {showCare ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showCare && (
                  <div className="pt-2 space-y-1 text-[11px] font-mono text-white/60 bg-white/5 p-3 rounded-xl border border-white/10 mt-1">
                    {selectedProduct.care.map((c, i) => (
                      <p key={i}>• {c}</p>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
