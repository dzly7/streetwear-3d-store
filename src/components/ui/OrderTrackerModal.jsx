import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Package, Truck, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { storeService } from '../../services/supabase';

export default function OrderTrackerModal() {
  const { isOrderTrackerOpen, closeOrderTracker, showNotification } = useStore();
  const [orderQuery, setOrderQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOrderTrackerOpen) return null;

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    const clean = orderQuery.trim().toUpperCase();
    if (!clean) {
      showNotification('Ingresa un número de pedido (ej. SYN-123456)', 'warning');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // 1. Intentar consultar endpoint o Supabase
      let result = null;
      try {
        const res = await fetch(`/api/orders/${clean}`);
        if (res.ok) {
          result = await res.json();
        }
      } catch {}

      if (!result) {
        result = await storeService.getOrderByNumber(clean);
      }

      setOrderData(result);
      if (!result) {
        showNotification('No se encontró ningún pedido con ese código', 'info');
      }
    } catch (err) {
      console.error('[TRACKER] Error:', err);
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getFulfillmentStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'unfulfilled':
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 2;
    }
  };

  const currentStep = getFulfillmentStep(orderData?.fulfillment_status || orderData?.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeOrderTracker}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl z-10 my-auto"
        >
          {/* Close button */}
          <button
            onClick={closeOrderTracker}
            className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar rastreo"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="space-y-1 mb-6">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-sky-400 font-bold block">
              SISTEMA DE LOGÍSTICA & SEGUIMIENTO EN TIEMPO REAL
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-wider uppercase text-white flex items-center gap-2">
              <Package className="text-sky-400" size={24} />
              RASTREAR PEDIDO SYNICAL™
            </h2>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchOrder} className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
                placeholder="EJEMPLO: SYN-842915"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 font-bold font-mono text-xs tracking-widest uppercase hover:bg-sky-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'BUSCANDO...' : 'CONSULTAR'}
            </button>
          </form>

          {/* Results Area */}
          {orderData ? (
            <div className="space-y-6">
              
              {/* Order Info Bar */}
              <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-white/50 block">NÚMERO DE PEDIDO</span>
                  <span className="font-mono text-lg font-bold text-sky-300">{orderData.order_number || orderData.orderNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-white/50 block">ESTADO DEL PAGO</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={12} />
                    PAGADO & VERIFICADO
                  </span>
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                <span className="text-[11px] font-mono tracking-wider text-white/60 block uppercase">
                  LÍNEA DE TIEMPO DEL PAQUETE
                </span>
                
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { step: 1, label: 'Confirmado', icon: CheckCircle2 },
                    { step: 2, label: 'En Confección', icon: Clock },
                    { step: 3, label: 'En Tránsito', icon: Truck },
                    { step: 4, label: 'Entregado', icon: Package }
                  ].map((s) => {
                    const isPassed = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;
                    const Icon = s.icon;

                    return (
                      <div key={s.step} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                            isPassed
                              ? 'bg-sky-400 border-sky-300 text-slate-950 font-bold shadow-glow-sky'
                              : 'bg-white/5 border-white/15 text-white/30'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          className={`text-[10px] font-mono tracking-wider uppercase ${
                            isCurrent
                              ? 'text-sky-300 font-bold'
                              : isPassed
                              ? 'text-white/80'
                              : 'text-white/30'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Summary */}
              {orderData.items && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-white/50 tracking-wider uppercase block">
                    PRENDAS EN ESTE ENVÍO:
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {orderData.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                        <div>
                          <span className="text-white font-bold">{it.name || it.product_name}</span>
                          <span className="text-white/50 ml-2">(Talla {it.size}) × {it.quantity}</span>
                        </div>
                        <span className="text-sky-300 font-bold">${((it.price || it.unit_price) * it.quantity).toFixed(2)} USD</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="text-[11px] font-mono text-white/60 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/40 block text-[9px] mb-1">DESTINO DE ENTREGA</span>
                {orderData.customer?.address || orderData.shipping_address}, {orderData.customer?.city || orderData.shipping_city}, {orderData.customer?.country || orderData.shipping_country}
              </div>

            </div>
          ) : hasSearched && !isLoading ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <AlertCircle className="mx-auto text-amber-400" size={32} />
              <p className="text-sm font-mono text-white">No encontramos el pedido {orderQuery}</p>
              <p className="text-xs font-mono text-white/50">
                Verifica que el código empiece con "SYN-" o revisa el recibo generado en tu última compra.
              </p>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 space-y-2 text-white/50 font-mono text-xs">
              <Package className="mx-auto text-white/30 mb-2" size={32} />
              <p>Ingresa tu código de pedido para ver en tiempo real el estado de confección y guía de paquetería.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
