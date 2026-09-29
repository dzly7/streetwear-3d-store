import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, RotateCcw, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function PolicyModal() {
  const { policyModal, closePolicyModal, openPolicyModal } = useStore();

  if (!policyModal) return null;

  const tabs = [
    { id: 'shipping', label: 'ENVÍOS Y ENTREGAS', icon: <Truck size={14} /> },
    { id: 'returns', label: 'DEVOLUCIONES (14 DÍAS)', icon: <RotateCcw size={14} /> },
    { id: 'care', label: 'CUIDADO DEL CROMO Y TELA', icon: <Sparkles size={14} /> },
    { id: 'contact', label: 'ATENCIÓN AL CLIENTE', icon: <Mail size={14} /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePolicyModal}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-9 border border-white/25 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15">
            <div>
              <span className="font-gothic text-2xl text-white tracking-widest block leading-none">
                Synical
              </span>
              <span className="text-[10px] font-mono tracking-[0.22em] text-white/60 uppercase">
                POLÍTICAS OFICIALES Y GARANTÍA DE MARCA
              </span>
            </div>

            <button
              onClick={closePolicyModal}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => openPolicyModal(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full font-mono text-[10px] tracking-wider uppercase transition-all ${
                  policyModal === tab.id
                    ? 'bg-white text-slate-950 font-bold shadow-glow-white'
                    : 'bg-white/5 text-white/70 hover:text-white border border-white/15 hover:border-white/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="font-mono text-xs text-white/80 leading-relaxed space-y-4 pt-2">
            {policyModal === 'shipping' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Truck size={16} className="text-sky-300" />
                  <span>POLÍTICA DE ENVÍOS GLOBALES Y NACIONALES</span>
                </h4>
                <p>
                  Todos nuestros pedidos son preparados y despachados desde nuestro centro de distribución bajo un estricto control de calidad individual.
                </p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-white">
                    <span className="font-bold uppercase">Envío Estándar Asegurado:</span>
                    <span className="text-emerald-400 font-bold">GRATIS en compras superiores a $200 USD</span>
                  </div>
                  <p className="text-[11px] text-white/60">Tiempo estimado: 3 a 5 días hábiles mediante FedEx Express o DHL.</p>
                  <div className="flex justify-between items-center text-white pt-2 border-t border-white/10">
                    <span className="font-bold uppercase">Envío Express Prioritario:</span>
                    <span className="text-white font-bold">$15.00 USD</span>
                  </div>
                  <p className="text-[11px] text-white/60">Tiempo estimado: 24 a 48 horas con entrega con firma garantizada.</p>
                </div>
                <p className="text-[11px] text-white/60">
                  Una vez enviado tu paquete, recibirás automáticamente por correo tu número de rastreo activo en tiempo real.
                </p>
              </div>
            )}

            {policyModal === 'returns' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <RotateCcw size={16} className="text-purple-300" />
                  <span>GARANTÍA DE CAMBIO Y DEVOLUCIÓN (14 DÍAS)</span>
                </h4>
                <p>
                  Queremos que estés 100% satisfecho con tu prenda. Si la talla no te queda perfecta o el corte no es el que esperabas, cuentas con <strong>14 días naturales</strong> a partir de la recepción para solicitar un cambio de talla sin costo o la devolución total de tu dinero.
                </p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 text-[11px]">
                  <strong className="text-white block uppercase">Condiciones para devolución:</strong>
                  <ul className="list-disc list-inside space-y-1 text-white/70">
                    <li>La prenda no debe haber sido lavada ni presentar marcas de perfume o uso.</li>
                    <li>Debe conservar todas sus etiquetas originales y la cadena de marca en el cuello.</li>
                    <li>Se debe devolver en su empaque original con bolsa antipolvo protectora.</li>
                  </ul>
                </div>
              </div>
            )}

            {policyModal === 'care' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles size={16} className="text-amber-300" />
                  <span>CUIDADO Y MANTENIMIENTO DEL ALGODÓN Y CROMO</span>
                </h4>
                <p>
                  Nuestras piezas de 480GSM y 500GSM están confeccionadas para durar décadas si se les da el cuidado adecuado.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <strong className="text-white block uppercase">1. LAVADO EN FRÍO</strong>
                    <p className="text-white/60">Lavar siempre con agua fría (máx. 30°C) del revés y con el cierre subido para proteger los dientes metálicos.</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <strong className="text-white block uppercase">2. SECADO NATURAL</strong>
                    <p className="text-white/60">No utilizar secadora caliente. Secar al aire extendido en plano a la sombra para preservar el tinte mineral.</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <strong className="text-white block uppercase">3. PLANCHADO</strong>
                    <p className="text-white/60">Planchar a baja temperatura y nunca pasar la plancha directo sobre los tiradores ni sobre bordados 3D.</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                    <strong className="text-white block uppercase">4. HERRAJES DE CROMO</strong>
                    <p className="text-white/60">El cromo líquido pulido puede limpiarse suavemente con un paño de microfibra seco para devolverle su brillo espejo.</p>
                  </div>
                </div>
              </div>
            )}

            {policyModal === 'contact' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Mail size={16} className="text-sky-300" />
                  <span>CANALES DE ATENCIÓN DIRECTA AL CLIENTE</span>
                </h4>
                <p>
                  Nuestro equipo de concierge está disponible de lunes a sábado para asistirte con tallas, dudas sobre drops o seguimiento de órdenes.
                </p>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase block">CORREO DIRECTO:</span>
                    <a href="mailto:soporte@synical.com" className="text-sky-300 font-bold hover:underline">
                      soporte@synical.com
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 uppercase block">HORARIO DE RESPUESTA:</span>
                    <span className="text-white">Lunes a Sábado: 9:00 AM – 8:00 PM (Tiempo de respuesta menor a 2 horas)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 uppercase block">ESTUDIO / ATELIER:</span>
                    <span className="text-white/80">Tokio • Los Ángeles • Ciudad de México</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={closePolicyModal}
            className="w-full py-2.5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold tracking-widest uppercase hover:bg-sky-200 transition-colors"
          >
            ENTENDIDO
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
