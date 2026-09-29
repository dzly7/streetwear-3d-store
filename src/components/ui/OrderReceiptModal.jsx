import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Printer, ArrowRight, Download, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function OrderReceiptModal() {
  const { orderReceipt, clearOrderReceipt } = useStore();

  if (!orderReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md print:hidden"
        />

        {/* Thermal Receipt Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-md bg-stone-100 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 font-mono space-y-6 border border-stone-300 print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none"
        >
          {/* Top Zig-zag Receipt Header */}
          <div className="text-center space-y-1 border-b border-dashed border-stone-400 pb-5">
            <span className="font-gothic text-3xl text-slate-900 tracking-widest block leading-none">
              Synical
            </span>
            <span className="text-[10px] tracking-[0.25em] text-stone-600 uppercase block font-bold">
              RECIBO OFICIAL DE COMPRA // DROP 01
            </span>
            <div className="flex items-center justify-center space-x-1.5 text-emerald-600 font-bold text-xs pt-1">
              <CheckCircle2 size={15} />
              <span>PAGO CONFIRMADO Y ASEGURADO</span>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700 border-b border-dashed border-stone-300 pb-4">
            <div>
              <span className="text-stone-500 block text-[9px] uppercase">NÚMERO DE ORDEN:</span>
              <strong className="text-slate-950">{orderReceipt.orderNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-stone-500 block text-[9px] uppercase">FECHA Y HORA:</span>
              <span>{orderReceipt.date}</span>
            </div>
            <div className="col-span-2 pt-1">
              <span className="text-stone-500 block text-[9px] uppercase">ENTREGA A:</span>
              <span className="font-bold text-slate-900">{orderReceipt.customer.name}</span>
              <span className="block text-stone-600">{orderReceipt.customer.address}, {orderReceipt.customer.city}</span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-2.5 border-b border-dashed border-stone-400 pb-4">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
              ARTÍCULOS CONFECCIONADOS ({orderReceipt.items.reduce((s, i) => s + i.quantity, 0)}):
            </span>

            {orderReceipt.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold block text-slate-950">{item.name}</span>
                  <span className="text-[10px] text-stone-500">
                    Talla: {item.size} • Cant: {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-slate-950">
                  ${(item.price * item.quantity).toFixed(2)} USD
                </span>
              </div>
            ))}
          </div>

          {/* Cost Totals */}
          <div className="space-y-1.5 text-xs border-b border-dashed border-stone-400 pb-4">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>${orderReceipt.subtotal.toFixed(2)} USD</span>
            </div>

            {orderReceipt.appliedDiscount && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Descuento ({orderReceipt.appliedDiscount.code})</span>
                <span>-${orderReceipt.discountAmount.toFixed(2)} USD</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>Envío ({orderReceipt.shippingMethod})</span>
              <span>
                {orderReceipt.shippingCost === 0 ? 'GRATIS' : `$${orderReceipt.shippingCost.toFixed(2)} USD`}
              </span>
            </div>

            <div className="flex justify-between pt-2 text-sm font-black text-slate-950 border-t border-stone-300">
              <span>TOTAL PAGADO</span>
              <span className="text-base font-bold text-slate-950">
                ${orderReceipt.total.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Barcode Graphic (Decorative Japanese / Streetwear style) */}
          <div className="text-center pt-1 space-y-1">
            <div className="h-10 w-full flex items-center justify-center space-x-1 opacity-80 overflow-hidden">
              {[4, 2, 6, 1, 3, 5, 2, 7, 3, 1, 4, 6, 2, 5, 1, 3, 6, 2, 4, 7, 2, 1, 4, 3, 6, 2].map((w, i) => (
                <div
                  key={i}
                  className="h-full bg-slate-950"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <span className="text-[9px] text-stone-500 tracking-[0.3em] uppercase block">
              * {orderReceipt.orderNumber} *
            </span>
            <p className="text-[10px] text-stone-500 pt-1 leading-snug">
              Te hemos enviado la guía de rastreo y confirmación a <strong>{orderReceipt.customer.email}</strong>.
            </p>
          </div>

          {/* Actions: Print and Close (hidden on print) */}
          <div className="pt-2 flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 rounded-full border border-stone-400 hover:bg-stone-200 text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5"
            >
              <Printer size={13} />
              <span>IMPRIMIR / PDF</span>
            </button>

            <button
              onClick={clearOrderReceipt}
              className="flex-1 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>CONTINUAR</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
