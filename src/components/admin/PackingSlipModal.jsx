import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, CheckSquare, Shield, AlertTriangle, Truck } from 'lucide-react';

export default function PackingSlipModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const orderNum = order.orderNumber || order.order_number || 'SYN-000000';
  const customer = order.customer || {};
  const items = order.items || [];
  const status = order.fulfillment_status || order.status || 'processing';

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop (hidden on print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md print:hidden"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 font-mono my-auto print:shadow-none print:rounded-none print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white"
        >
          {/* Action Header (Hidden when printing) */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>ALBARÁN DE EMPAQUE // PACKING SLIP</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-slate-800">LISTO PARA IMPRESIÓN</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                <Printer size={15} />
                <span>Imprimir / Guardar PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ================= PRINTABLE CONTENT ================= */}
          <div className="print-packing-slip space-y-6">
            
            {/* Top Brand & Barcode Header */}
            <div className="flex flex-wrap items-start justify-between border-b-2 border-black pb-4 gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-[0.2em] font-sans uppercase">SYNICAL™</h1>
                <p className="text-[10px] tracking-widest text-slate-600 uppercase font-bold">
                  ATELIER DE ALTA DENSIDAD & CONFECCIÓN // ARCHIVE LOGISTICS
                </p>
                <p className="text-[9px] text-slate-500 mt-1">
                  Matriz: Av. Presidente Masaryk 390, Polanco, CDMX • atelier@synical.com
                </p>
              </div>

              {/* Barcode Graphic Simulation */}
              <div className="text-right">
                <div className="inline-block p-2 bg-slate-50 border border-slate-300 rounded">
                  <div className="flex items-center gap-[2px] h-9 mb-1 justify-center">
                    {/* Simulated High-Contrast Barcode */}
                    <div className="w-[3px] h-full bg-black" />
                    <div className="w-[1px] h-full bg-black" />
                    <div className="w-[4px] h-full bg-black" />
                    <div className="w-[2px] h-full bg-black" />
                    <div className="w-[1px] h-full bg-black" />
                    <div className="w-[3px] h-full bg-black" />
                    <div className="w-[5px] h-full bg-black" />
                    <div className="w-[1px] h-full bg-black" />
                    <div className="w-[2px] h-full bg-black" />
                    <div className="w-[4px] h-full bg-black" />
                    <div className="w-[2px] h-full bg-black" />
                    <div className="w-[3px] h-full bg-black" />
                    <div className="w-[1px] h-full bg-black" />
                    <div className="w-[5px] h-full bg-black" />
                    <div className="w-[2px] h-full bg-black" />
                    <div className="w-[4px] h-full bg-black" />
                  </div>
                  <span className="text-xs font-bold font-mono tracking-widest block text-center">
                    {orderNum}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">N° DE PEDIDO</span>
                <strong className="text-sm text-slate-900">{orderNum}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">FECHA EMISIÓN</span>
                <span className="text-slate-800">{order.date || new Date().toLocaleDateString('es-MX')}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">ESTADO DE ENVÍO</span>
                <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                  {status === 'delivered' ? '✓ Entregado' : status === 'shipped' ? '🚚 Despachado' : '⚙️ En Preparación'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">PAQUETERÍA / GUÍA</span>
                <span className="text-slate-800 font-bold block truncate">
                  {order.trackingCarrier || 'DHL Express'}: {order.trackingNumber || 'Por Asignar'}
                </span>
              </div>
            </div>

            {/* Shipping Address / Recipient Block */}
            <div className="border border-slate-300 rounded-xl p-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Truck size={13} /> DESTINATARIO & DIRECCIÓN DE ENTREGA
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{customer.name || 'Cliente Particular'}</p>
                  <p className="text-slate-700 mt-1">{customer.address || order.shipping_address || 'Dirección no especificada'}</p>
                  <p className="text-slate-700">
                    {customer.city || order.shipping_city || ''}, {customer.state || ''} {customer.postalCode || order.shipping_postal || ''}
                  </p>
                  <p className="text-slate-700 font-bold">{customer.country || order.shipping_country || 'México'}</p>
                </div>
                <div className="text-slate-600 space-y-1 sm:text-right">
                  <p><strong className="text-slate-800">Email:</strong> {customer.email || 'N/A'}</p>
                  <p><strong className="text-slate-800">Tel:</strong> {customer.phone || '+52 (55) 0000 0000'}</p>
                  <p><strong className="text-slate-800">Método:</strong> {order.shippingMethod || 'Envío Estándar Prioritario'}</p>
                </div>
              </div>
            </div>

            {/* Garments Table */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                DETALLE DE PRENDAS A DESPACHAR ({items.length} ARTÍCULOS)
              </h2>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-left text-[10px] text-slate-600 uppercase border-b border-slate-300">
                    <th className="p-2.5 w-10 text-center">CHECK</th>
                    <th className="p-2.5">PRENDA // ESPECIFICACIÓN</th>
                    <th className="p-2.5 w-20 text-center">TALLA</th>
                    <th className="p-2.5 w-16 text-center">CANT.</th>
                    <th className="p-2.5 w-24 text-right">PRECIO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-400 text-slate-900 cursor-pointer"
                        />
                      </td>
                      <td className="p-2.5">
                        <strong className="text-slate-900 block">{it.name || it.product_name}</strong>
                        <span className="text-[10px] text-slate-500 block">
                          SKU: {it.sku || `SYN-${(it.id || 'ITEM').toUpperCase()}-${it.size}`} • Algodón Pesado 460-500GSM
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="inline-block px-2.5 py-1 bg-black text-white font-bold rounded text-xs">
                          {it.size}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900 text-sm">
                        {it.quantity}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ${Number(it.price || it.unit_price || 0).toFixed(2)} USD
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                    <td colSpan={3} className="p-2.5 text-right text-[10px] uppercase text-slate-600">
                      TOTAL DECLARADO:
                    </td>
                    <td className="p-2.5 text-center">
                      {items.reduce((acc, i) => acc + Number(i.quantity || 1), 0)}
                    </td>
                    <td className="p-2.5 text-right text-sm text-slate-900">
                      ${Number(order.total || 0).toFixed(2)} USD
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Quality Control & Fulfillment Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-[10px]">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block uppercase">
                  CONTROL DE CALIDAD ATELIER (CHECKLIST):
                </span>
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded" /> Inspección de costuras y gramaje 500GSM
                </label>
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded" /> Planchado térmico a vapor industrial
                </label>
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded" /> Certificado de Autenticidad numerado incluido
                </label>
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded" /> Bolsa antipolvo zipper sellada
                </label>
              </div>

              <div className="flex flex-col justify-between pt-2 sm:pt-0 sm:border-l sm:border-slate-200 sm:pl-4">
                <div>
                  <span className="font-bold text-slate-700 block uppercase">NOTAS DE MANEJO:</span>
                  <p className="text-slate-500 mt-1 italic">
                    "Prendas de archivo textil de alto gramaje. Mantener protegido de humedad y calor extremo."
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-300 mt-3 text-center">
                  <div className="h-6" />
                  <span className="text-[9px] text-slate-400 block border-t border-slate-300 pt-1 uppercase">
                    FIRMA / SELLO DE RESPONSABLE DE DESPACHO
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-200">
              DOCUMENTO INTERNO DE ALMACÉN Y PREPARACIÓN DE PEDIDOS • SYNICAL™ CLOUD STREETWEAR SYSTEM
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
