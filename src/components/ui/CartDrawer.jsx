import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, Truck } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    openCheckout,
    appliedDiscount,
    discountError,
    applyDiscount,
    removeDiscount
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 200.0;
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) / 100 : 0;
  const finalSubtotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput) {
      applyDiscount(couponInput);
    }
  };

  const handleProceedToCheckout = () => {
    openCheckout();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md glass-panel border-l border-white/20 p-5 sm:p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag size={20} className="text-sky-300" />
                    <h2 className="text-sm sm:text-base font-bold font-mono tracking-[0.2em] uppercase text-white">
                      TU BOLSA ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </h2>
                  </div>
                  <button
                    onClick={closeCart}
                    className="p-2 rounded-full glass-pill hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                    aria-label="Cerrar bolsa"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Free shipping progress bar */}
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center space-x-1.5 text-white/80">
                      <Truck size={13} className="text-sky-300" />
                      <span>
                        {remainingForFreeShipping > 0 ? (
                          <>¡Agrega <strong className="text-sky-300">${remainingForFreeShipping.toFixed(2)} USD</strong> más para <strong>ENVÍO GRATIS</strong>!</>
                        ) : (
                          <strong className="text-emerald-400">✓ ¡TIENES ENVÍO GRATIS ASEGURADO!</strong>
                        )}
                      </span>
                    </div>
                    <span className="text-white/40">{Math.round(progressToFreeShipping)}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        remainingForFreeShipping === 0
                          ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                          : 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
                      }`}
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3 my-4 max-h-[46vh] overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-white/60 font-mono text-xs space-y-4">
                      <ShoppingBag size={34} className="mx-auto text-white/30" />
                      <div className="space-y-1">
                        <p className="font-bold text-white uppercase tracking-widest">TU BOLSA ESTÁ VACÍA</p>
                        <p className="text-[10px] text-white/50">Explora las siluetas del Drop 01 para agregar tu talla.</p>
                      </div>
                      <button
                        onClick={() => {
                          closeCart();
                          const el = document.getElementById('shop');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-glow-white hover:bg-sky-200 transition-all cursor-pointer"
                      >
                        EXPLORAR EL DROP
                      </button>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div
                        key={`${item.id}-${item.size}-${index}`}
                        className="flex items-center space-x-3.5 p-3 rounded-2xl glass-panel-subtle border border-white/10"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-contain rounded-xl bg-black/40 p-1 flex-shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold font-mono tracking-wider text-white truncate uppercase">
                            {item.name}
                          </h4>
                          <p className="text-[10px] font-mono text-sky-200 mt-0.5">
                            Talla: {item.size} • ${item.price.toFixed(2)} USD
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                              aria-label="Restar una unidad"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-mono text-xs px-1">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              disabled={Boolean(item.maxStock && item.quantity >= item.maxStock)}
                              className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 cursor-pointer"
                              aria-label="Sumar una unidad"
                            >
                              <Plus size={11} />
                            </button>
                            {item.maxStock && item.quantity >= item.maxStock && (
                              <span className="text-[8px] font-mono text-amber-300">
                                (STOCK MÁX)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove item */}
                        <button
                          onClick={() => removeFromCart(index)}
                          className="p-1.5 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar de la bolsa"
                          aria-label="Eliminar de la bolsa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer: Coupon, Subtotal & Checkout */}
              {cart.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-3.5">
                  
                  {/* Coupon input */}
                  <div>
                    <form onSubmit={handleApplyCoupon} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="CUPÓN (ej. SYNICAL10)"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-white/40 uppercase tracking-wider focus:outline-none focus:border-white"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white text-white hover:text-slate-950 font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer"
                      >
                        APLICAR
                      </button>
                    </form>

                    {appliedDiscount && (
                      <div className="flex items-center justify-between mt-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-mono text-emerald-300">
                        <div className="flex items-center space-x-1.5">
                          <Tag size={11} />
                          <span>{appliedDiscount.code} (-{appliedDiscount.percent}%)</span>
                        </div>
                        <button onClick={removeDiscount} className="text-emerald-200 hover:text-white underline cursor-pointer">
                          Quitar
                        </button>
                      </div>
                    )}

                    {discountError && (
                      <p className="text-[10px] font-mono text-rose-400 mt-1 pl-1">{discountError}</p>
                    )}
                  </div>

                  {/* Subtotals */}
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between items-center text-white/70">
                      <span>SUBTOTAL</span>
                      <span className="font-bold text-white">${subtotal.toFixed(2)} USD</span>
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span>DESCUENTO ({appliedDiscount.percent}%)</span>
                        <span>-${discountAmount.toFixed(2)} USD</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold text-white">
                      <span>TOTAL ESTIMADO</span>
                      <span className="text-sky-300">${finalSubtotal.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 rounded-full bg-white text-slate-950 font-mono text-xs sm:text-sm font-black tracking-[0.2em] uppercase shadow-glow-white hover:bg-sky-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>INICIAR CHECKOUT</span>
                    <ArrowRight size={15} />
                  </button>

                  <div className="flex items-center justify-center space-x-1.5 text-[9px] font-mono text-white/50">
                    <ShieldCheck size={11} className="text-emerald-400" />
                    <span>Pago Seguro Encriptado SSL • Envío Asegurado</span>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
