import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Truck, Check, Lock, Tag, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import confetti from 'canvas-confetti';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    closeCheckout,
    cart,
    appliedDiscount,
    discountError,
    applyDiscount,
    removeDiscount,
    setOrderReceipt,
    showNotification
  } = useStore();

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('free'); // 'free' | 'express'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'apple'
  const [couponInput, setCouponInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Clean initial state with no hardcoded fake customer data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'México',
    cardNumber: '',
    cardExp: '',
    cardCvc: ''
  });

  const [errors, setErrors] = useState({});

  if (!isCheckoutOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) / 100 : 0;
  const shippingCost = shippingMethod === 'express' ? 15.0 : 0.0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length >= 3) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    return clean;
  };

  const handleInputChange = (field, val) => {
    let finalVal = val;
    if (field === 'cardNumber') {
      finalVal = formatCardNumber(val).slice(0, 19);
    } else if (field === 'cardExp') {
      finalVal = formatExpiry(val).slice(0, 5);
    } else if (field === 'cardCvc') {
      finalVal = val.replace(/[^0-9]/g, '').slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [field]: finalVal }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput) {
      applyDiscount(couponInput);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Ingresa tu nombre completo';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = 'Ingresa tu dirección completa de entrega';
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      newErrors.city = 'Ingresa tu ciudad o municipio';
    }

    if (!formData.postalCode.trim() || formData.postalCode.trim().length < 4) {
      newErrors.postalCode = 'Código postal requerido (mín. 4 dígitos)';
    }

    if (paymentMethod === 'card') {
      const rawCard = formData.cardNumber.replace(/\s/g, '');
      if (rawCard.length < 15) {
        newErrors.cardNumber = 'Ingresa un número de tarjeta válido (16 dígitos)';
      }
      if (formData.cardExp.length < 5) {
        newErrors.cardExp = 'Fecha requerida (MM/AA)';
      }
      if (formData.cardCvc.length < 3) {
        newErrors.cardCvc = 'CVC requerido (3 dígitos)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteOrder = () => {
    if (cart.length === 0) {
      showNotification('Tu bolsa está vacía', 'warning');
      return;
    }

    if (!validateForm()) {
      showNotification('Por favor revisa los campos requeridos marcados en rojo', 'warning');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });

      const orderNumber = `SYN-${Math.floor(100000 + Math.random() * 900000)}`;
      const date = new Date().toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const cardLast4 = formData.cardNumber.replace(/\s/g, '').slice(-4) || '4242';

      setOrderReceipt({
        orderNumber,
        date,
        items: [...cart],
        customer: { ...formData },
        subtotal,
        discountAmount,
        appliedDiscount,
        shippingCost,
        shippingMethod: shippingMethod === 'express' ? 'Envío Express 24-48h' : 'Envío Estándar Asegurado (Gratis)',
        total,
        paymentMethod: paymentMethod === 'apple' ? 'Apple Pay / Google Wallet' : `Tarjeta terminada en •••• ${cardLast4}`
      });
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCheckout}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-4xl rounded-3xl glass-panel p-6 sm:p-10 border border-white/25 shadow-2xl z-10 max-h-[92vh] overflow-y-auto my-auto"
        >
          {/* Close button */}
          <button
            onClick={closeCheckout}
            className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-white/20 text-white/80 transition-colors z-20 cursor-pointer"
            aria-label="Cerrar checkout"
          >
            <X size={18} />
          </button>

          {/* Grid Layout: Left form, Right order summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (7 cols): Checkout Steps */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Brand Title */}
              <div>
                <span className="font-gothic text-2xl text-white tracking-widest block leading-none">
                  Synical
                </span>
                <span className="text-[10px] font-mono tracking-[0.25em] text-white/60 uppercase">
                  PASARELA DE PAGO SEGURO // ENCRIPTACIÓN SSL 256-BIT
                </span>
              </div>

              {/* Step 1: Dirección de Envío */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold tracking-widest uppercase text-white">
                  <Truck size={14} className="text-sky-300" />
                  <span>1. INFORMACIÓN DE ENTREGA</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-white/60 block mb-1">NOMBRE COMPLETO *</label>
                    <input
                      type="text"
                      placeholder="ej. Mateo Valdés"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-white focus:outline-none tracking-wider transition-colors ${
                        errors.name ? 'border-rose-500 bg-rose-950/20' : 'border-white/20 focus:border-white'
                      }`}
                    />
                    {errors.name && <span className="text-[10px] text-rose-400 mt-1 block">{errors.name}</span>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-white/60 block mb-1">CORREO ELECTRÓNICO (PARA NÚMERO DE GUÍA) *</label>
                    <input
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-white focus:outline-none tracking-wider transition-colors ${
                        errors.email ? 'border-rose-500 bg-rose-950/20' : 'border-white/20 focus:border-white'
                      }`}
                    />
                    {errors.email && <span className="text-[10px] text-rose-400 mt-1 block">{errors.email}</span>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-white/60 block mb-1">CALLE, NÚMERO Y COLONIA *</label>
                    <input
                      type="text"
                      placeholder="ej. Av. Masaryk 310, Polanco"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-white focus:outline-none tracking-wider transition-colors ${
                        errors.address ? 'border-rose-500 bg-rose-950/20' : 'border-white/20 focus:border-white'
                      }`}
                    />
                    {errors.address && <span className="text-[10px] text-rose-400 mt-1 block">{errors.address}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">CIUDAD / MUNICIPIO *</label>
                    <input
                      type="text"
                      placeholder="ej. Ciudad de México"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-white focus:outline-none tracking-wider transition-colors ${
                        errors.city ? 'border-rose-500 bg-rose-950/20' : 'border-white/20 focus:border-white'
                      }`}
                    />
                    {errors.city && <span className="text-[10px] text-rose-400 mt-1 block">{errors.city}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] text-white/60 block mb-1">CÓDIGO POSTAL *</label>
                    <input
                      type="text"
                      placeholder="ej. 11560"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={`w-full bg-white/5 border rounded-xl px-3.5 py-2.5 text-white focus:outline-none tracking-wider transition-colors ${
                        errors.postalCode ? 'border-rose-500 bg-rose-950/20' : 'border-white/20 focus:border-white'
                      }`}
                    />
                    {errors.postalCode && <span className="text-[10px] text-rose-400 mt-1 block">{errors.postalCode}</span>}
                  </div>
                </div>
              </div>

              {/* Step 2: Método de Envío */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-white block">
                  2. MÉTODO DE ENVÍO
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div
                    onClick={() => setShippingMethod('free')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'free'
                        ? 'border-white bg-white/15 shadow-glow-white'
                        : 'border-white/20 bg-white/5 hover:border-white/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white uppercase text-[11px]">ESTÁNDAR ASEGURADO</span>
                      <span className="text-emerald-400 font-bold">GRATIS</span>
                    </div>
                    <p className="text-[10px] text-white/60">3 a 5 días hábiles con rastreo FedEx / DHL.</p>
                  </div>

                  <div
                    onClick={() => setShippingMethod('express')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-white bg-white/15 shadow-glow-white'
                        : 'border-white/20 bg-white/5 hover:border-white/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white uppercase text-[11px]">EXPRESS PRIORITARIO</span>
                      <span className="text-white font-bold">$15.00 USD</span>
                    </div>
                    <p className="text-[10px] text-white/60">24 a 48 horas con entrega garantizada.</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Método de Pago */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold tracking-widest uppercase text-white">
                  <CreditCard size={14} className="text-purple-300" />
                  <span>3. MÉTODO DE PAGO</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 font-bold transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-white bg-white/20 text-white shadow-glow-white'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>TARJETA</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('apple')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 font-bold transition-all cursor-pointer ${
                      paymentMethod === 'apple'
                        ? 'border-white bg-white/20 text-white shadow-glow-white'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white'
                    }`}
                  >
                    <span>APPLE PAY / GOOGLE</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3 text-xs font-mono">
                    <div>
                      <label className="text-[10px] text-white/60 block mb-1">NÚMERO DE TARJETA *</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white font-mono tracking-widest focus:outline-none ${
                          errors.cardNumber ? 'border-rose-500' : 'border-white/20 focus:border-white'
                        }`}
                      />
                      {errors.cardNumber && <span className="text-[10px] text-rose-400 mt-1 block">{errors.cardNumber}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-white/60 block mb-1">EXPIRACIÓN (MM/AA) *</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={formData.cardExp}
                          onChange={(e) => handleInputChange('cardExp', e.target.value)}
                          className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white font-mono tracking-widest focus:outline-none ${
                            errors.cardExp ? 'border-rose-500' : 'border-white/20 focus:border-white'
                          }`}
                        />
                        {errors.cardExp && <span className="text-[10px] text-rose-400 mt-1 block">{errors.cardExp}</span>}
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60 block mb-1">CVC / CVV *</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={formData.cardCvc}
                          onChange={(e) => handleInputChange('cardCvc', e.target.value)}
                          className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white font-mono tracking-widest focus:outline-none ${
                            errors.cardCvc ? 'border-rose-500' : 'border-white/20 focus:border-white'
                          }`}
                        />
                        {errors.cardCvc && <span className="text-[10px] text-rose-400 mt-1 block">{errors.cardCvc}</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/15 text-center font-mono text-xs text-white/80 space-y-2">
                    <p>Pago en 1 toque activo con Apple Pay / Google Wallet.</p>
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      ✓ AUTENTICACIÓN BIOMÉTRICA LISTA AL CONFIRMAR
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de Confirmación */}
              <div className="pt-4">
                <button
                  onClick={handleCompleteOrder}
                  disabled={isProcessing || cart.length === 0}
                  className="w-full py-4 rounded-full bg-white text-slate-950 font-mono text-sm font-black tracking-[0.2em] uppercase shadow-glow-white hover:bg-sky-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>PROCESANDO PAGO SEGURO...</span>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>PAGAR ${total.toFixed(2)} USD</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center space-x-2 text-[10px] font-mono text-white/60 mt-3">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Transacción asegurada de 256 bits. Garantía de reembolso en 14 días.</span>
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Order Summary & Coupon */}
            <div className="lg:col-span-5 rounded-2xl bg-white/5 border border-white/15 p-5 sm:p-6 space-y-5">
              
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-white border-b border-white/15 pb-3">
                RESUMEN DE TU PEDIDO ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${item.size}-${idx}`} className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-2">
                    <div className="flex items-center space-x-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-black/40 p-1 border border-white/10" />
                      <div>
                        <h4 className="font-bold text-white text-[11px] uppercase">{item.name}</h4>
                        <span className="text-[10px] text-white/60">Talla: {item.size} • Cant: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-[10px] font-mono text-white/60 block uppercase">CÓDIGO PROMOCIONAL // VIP</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="ej. SYNICAL10 o DROP01"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white uppercase tracking-wider focus:outline-none focus:border-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white text-slate-950 font-mono text-xs font-bold uppercase hover:bg-sky-200 transition-colors"
                  >
                    APLICAR
                  </button>
                </div>
                {appliedDiscount && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg">
                    <span>✓ {appliedDiscount.label} (-{appliedDiscount.percent}%)</span>
                    <button type="button" onClick={removeDiscount} className="text-white/60 hover:text-white underline">Quitar</button>
                  </div>
                )}
                {discountError && (
                  <span className="text-[10px] font-mono text-rose-400 block">{discountError}</span>
                )}
              </form>

              {/* Financial Calculation */}
              <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)} USD</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento ({appliedDiscount.percent}%):</span>
                    <span>-${discountAmount.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Envío ({shippingMethod === 'express' ? 'Express' : 'Estándar'}):</span>
                  <span>{shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)} USD`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/20">
                  <span>TOTAL FINAL:</span>
                  <span className="text-sky-300">${total.toFixed(2)} USD</span>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
