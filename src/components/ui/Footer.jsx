import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Footer() {
  const { openPolicyModal, openSizeGuide } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  return (
    <footer className="relative border-t border-white/10 pt-16 pb-12 px-4 sm:px-8 max-w-7xl mx-auto z-10 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        
        {/* Brand identity */}
        <div className="space-y-4">
          <h4 className="text-xl font-black font-display tracking-[0.2em] uppercase text-white">
            SYNICAL™
          </h4>
          <p className="text-xs font-mono text-white/60 leading-relaxed">
            Diseñado para realidades físicas a través de dimensiones virtuales. Todas las siluetas y acabados protegidos bajo registro de marca internacional.
          </p>
        </div>

        {/* Collections links */}
        <div>
          <h5 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-white/90 mb-4">
            ARCHIVO & DROPS
          </h5>
          <ul className="space-y-2.5 text-xs font-mono text-white/60">
            <li><a href="#shop" className="hover:text-sky-300 transition-colors">Colección Otoño/Invierno</a></li>
            <li><a href="#shop" className="hover:text-sky-300 transition-colors">Hoodies Volumétricos 480GSM</a></li>
            <li><a href="#shop" className="hover:text-sky-300 transition-colors">Herrajes en Cromo Templado</a></li>
            <li><a href="#shop" className="hover:text-sky-300 transition-colors">Teñidos Minerales Vintage</a></li>
          </ul>
        </div>

        {/* Customer Care / Policies */}
        <div>
          <h5 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-white/90 mb-4">
            ATENCIÓN & POLÍTICAS
          </h5>
          <ul className="space-y-2.5 text-xs font-mono text-white/60">
            <li>
              <button onClick={() => openPolicyModal('shipping')} className="hover:text-sky-300 transition-colors text-left uppercase">
                Envíos y Rastreo Global
              </button>
            </li>
            <li>
              <button onClick={openSizeGuide} className="hover:text-sky-300 transition-colors text-left uppercase">
                Tabla de Medidas y Tallas
              </button>
            </li>
            <li>
              <button onClick={() => openPolicyModal('returns')} className="hover:text-sky-300 transition-colors text-left uppercase">
                Garantía y Devoluciones (14 Días)
              </button>
            </li>
            <li>
              <button onClick={() => openPolicyModal('care')} className="hover:text-sky-300 transition-colors text-left uppercase">
                Cuidado de la Prenda y Cromo
              </button>
            </li>
            <li>
              <button onClick={() => openPolicyModal('contact')} className="hover:text-sky-300 transition-colors text-left uppercase">
                Contacto Directo y Concierge
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup en Español */}
        <div>
          <h5 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-white/90 mb-2">
            SUSCRÍBETE AL DROP LIST
          </h5>
          <p className="text-[11px] font-mono text-white/60 mb-4">
            Recibe códigos de acceso prioritario 30 minutos antes de los lanzamientos públicos.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="INGRESA TU CORREO"
              required
              className="w-full px-4 py-3 rounded-full glass-panel-subtle text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400 border border-white/20 pr-12"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-full bg-white text-slate-950 hover:bg-sky-300 transition-colors flex items-center justify-center"
              aria-label="Suscribirse"
            >
              {subscribed ? <Check size={14} className="text-emerald-700" /> : <ArrowRight size={14} />}
            </button>
          </form>
          {subscribed && (
            <p className="text-[10px] font-mono text-emerald-400 mt-2">
              ✓ YA ESTÁS EN LA LISTA VIP PARA EL SIGUIENTE DROP.
            </p>
          )}
        </div>

      </div>

      {/* Bottom Legal bar */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/40 space-y-4 sm:space-y-0">
        <div>
          © 2026 SYNICAL STUDIOS INC. TODOS LOS DERECHOS RESERVADOS.
        </div>
        <div className="flex space-x-6">
          <button onClick={() => openPolicyModal('returns')} className="hover:text-white transition-colors uppercase">
            TÉRMINOS
          </button>
          <button onClick={() => openPolicyModal('shipping')} className="hover:text-white transition-colors uppercase">
            ENVÍOS
          </button>
          <button onClick={() => openPolicyModal('contact')} className="hover:text-white transition-colors uppercase">
            AYUDA
          </button>
        </div>
      </div>
    </footer>
  );
}
