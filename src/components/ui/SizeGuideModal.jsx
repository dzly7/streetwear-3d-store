import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function SizeGuideModal() {
  const { isSizeGuideOpen, closeSizeGuide, selectedProduct } = useStore();
  const [unit, setUnit] = useState('cm'); // 'cm' | 'in'

  if (!isSizeGuideOpen) return null;

  const measurements = selectedProduct?.measurements || {
    S: { chest: 62, length: 68, shoulder: 58, sleeve: 61 },
    M: { chest: 65, length: 70, shoulder: 60, sleeve: 62 },
    L: { chest: 68, length: 72, shoulder: 62, sleeve: 63 },
    XL: { chest: 71, length: 74, shoulder: 64, sleeve: 64 }
  };

  const convert = (val) => {
    if (unit === 'in') {
      return (val / 2.54).toFixed(1);
    }
    return val;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSizeGuide}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-xl rounded-2xl glass-panel p-6 sm:p-8 border border-white/25 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15">
            <div className="flex items-center space-x-2.5">
              <Ruler size={18} className="text-sky-300" />
              <div>
                <h3 className="text-sm sm:text-base font-mono font-bold tracking-widest uppercase text-white">
                  GUÍA DE TALLAS Y MEDIDAS
                </h3>
                <span className="text-[10px] font-mono text-white/60 tracking-wider">
                  CORTE BOXY OVERSIZED // UNISEX
                </span>
              </div>
            </div>

            <button
              onClick={closeSizeGuide}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-full border border-white/10">
            <span className="text-[10px] font-mono tracking-wider text-white/70 pl-3 uppercase">
              UNIDAD DE MEDIDA:
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                  unit === 'cm'
                    ? 'bg-white text-slate-950 shadow-glow-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                CENTÍMETROS (CM)
              </button>
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                  unit === 'in'
                    ? 'bg-white text-slate-950 shadow-glow-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                PULGADAS (IN)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/20 text-[10px] text-white/60 tracking-wider uppercase">
                  <th className="py-2.5 px-3">TALLA</th>
                  <th className="py-2.5 px-3">PECHO ({unit})</th>
                  <th className="py-2.5 px-3">LARGO ({unit})</th>
                  <th className="py-2.5 px-3">HOMBRO ({unit})</th>
                  <th className="py-2.5 px-3">MANGA ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {Object.entries(measurements).map(([size, dims]) => (
                  <tr key={size} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{size}</td>
                    <td className="py-3 px-3 text-white/80">{convert(dims.chest)}</td>
                    <td className="py-3 px-3 text-white/80">{convert(dims.length)}</td>
                    <td className="py-3 px-3 text-white/80">{convert(dims.shoulder)}</td>
                    <td className="py-3 px-3 text-white/80">{convert(dims.sleeve)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fit recommendations */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 text-xs font-mono text-white/80 leading-relaxed">
            <div className="flex items-center space-x-2 text-sky-300 font-bold text-[11px] tracking-wider uppercase">
              <CheckCircle size={14} />
              <span>RECOMENDACIÓN DE AJUSTE (FIT)</span>
            </div>
            <p className="text-[11px] text-white/70">
              Todas nuestras sudaderas están diseñadas con un <strong>corte boxy y hombros caídos</strong> de alta costura streetwear. Si buscas el look relajado característico de la marca, elige tu talla habitual. Si deseas un ajuste más pegado al cuerpo, te recomendamos pedir una talla menos.
            </p>
            <div className="pt-2 border-t border-white/10 text-[10px] text-white/60">
              <strong>Referencia del modelo:</strong> 1.83 m de estatura, 76 kg, viste talla <strong>L</strong>.
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={closeSizeGuide}
            className="w-full py-2.5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold tracking-widest uppercase hover:bg-sky-200 transition-colors"
          >
            ENTENDIDO, VOLVER AL PRODUCTO
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
