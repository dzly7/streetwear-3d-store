import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PRODUCTS } from '../../data/products';

export default function SearchModal() {
  const { isSearchOpen, closeSearch, openProductModal } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useStore.getState().openSearch();
      }
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const filteredProducts = PRODUCTS.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const handleSelectProduct = (product) => {
    closeSearch();
    openProductModal(product);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSearch}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl glass-panel p-5 sm:p-7 border border-white/25 shadow-2xl z-10 space-y-5"
        >
          {/* Header with Search Input */}
          <div className="relative flex items-center border-b border-white/20 pb-4">
            <Search size={18} className="text-sky-300 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por prenda, color o silueta (ej. Washed Black, Azul)..."
              className="w-full bg-transparent text-sm sm:text-base font-mono text-white placeholder-white/40 focus:outline-none tracking-wider"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:text-white text-white/50 transition-colors mr-2"
              >
                <X size={15} />
              </button>
            )}
            <button
              onClick={closeSearch}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2 text-[10px] font-mono tracking-wider text-white/60">
            <span className="self-center mr-1 text-white/40 uppercase">SUGERENCIAS:</span>
            {['Negro Deslavado', 'Piedra Mineral', 'Crema Natural', 'Azul Océano'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-2.5 py-1 rounded-full border border-white/20 hover:border-white hover:text-white transition-colors bg-white/5"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block">
              RESULTADOS ({filteredProducts.length})
            </span>

            {filteredProducts.length === 0 ? (
              <div className="py-10 text-center text-white/50 font-mono text-xs space-y-2">
                <p>No se encontraron piezas con "{query}".</p>
                <p className="text-[10px] text-white/30">Prueba con palabras como "hoodie", "black" o "stone".</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 p-1 flex items-center justify-center flex-shrink-0">
                      <img
                        src={product.images.front}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold tracking-wider text-white group-hover:text-sky-300 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] font-mono text-white/60 mt-0.5">
                        {product.tagline} • <span className="text-white/80">{product.color}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <span className="font-mono text-xs font-bold text-white">
                      ${product.price.toFixed(2)} USD
                    </span>
                    <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer hotkey note */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>Presiona ESC para cerrar</span>
            <span>SYNICAL™ DROP 01</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
