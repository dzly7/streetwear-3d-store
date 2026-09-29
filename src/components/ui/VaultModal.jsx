import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Key, Unlock, Sparkles, Check, ArrowRight, ShieldAlert } from 'lucide-react';
import { useStore } from '../../store/useStore';
import confetti from 'canvas-confetti';

export default function VaultModal() {
  const { isVaultOpen, closeVault, applyDiscount, showNotification } = useStore();
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isVaultOpen) return null;

  const validCodes = ['SYNICAL-VAULT', 'VAULT25', 'SYNICAL', 'VIP20', 'DROP01'];

  const handleUnlock = (e) => {
    e.preventDefault();
    const clean = passcode.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('Ingresa la clave de acceso');
      return;
    }

    if (validCodes.includes(clean)) {
      setIsUnlocked(true);
      setErrorMsg('');
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.5 }
      });
      applyDiscount('VIP20');
      showNotification('¡Acceso VIP Concedido! Cupón VIP20 aplicado automáticamente (-20%)', 'success');
    } else {
      setErrorMsg('CLAVE DENEGADA. CÓDIGO INCORRECTO O EXPIRADO.');
    }
  };

  const handleKeyClick = (char) => {
    if (passcode.length < 15) {
      setPasscode((prev) => prev + char);
      setErrorMsg('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeVault}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-white/30 shadow-[0_0_60px_rgba(192,132,252,0.25)] z-10 my-auto text-center"
        >
          {/* Close button */}
          <button
            onClick={closeVault}
            className="absolute top-4 right-4 p-2 rounded-full glass-pill hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
            aria-label="Cerrar bóveda"
          >
            <X size={18} />
          </button>

          {!isUnlocked ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-glow-sm">
                  <Lock size={26} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-mono tracking-[0.25em] uppercase text-white">
                  DROP VAULT // ACCESO VIP
                </h2>
                <p className="text-[11px] font-mono text-white/60 tracking-wider uppercase max-w-xs">
                  Ingresa tu clave de invitación para desbloquear muestras de archivo, descuentos prioritarios y preventa.
                </p>
              </div>

              {/* Passcode Form */}
              <form onSubmit={handleUnlock} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="INGRESAR CLAVE O TOKEN..."
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    className="w-full bg-black/60 border border-white/25 rounded-2xl py-3 px-4 text-center font-mono text-sm tracking-[0.3em] uppercase text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.3)]"
                  />
                  {passcode && (
                    <button
                      type="button"
                      onClick={() => setPasscode('')}
                      className="absolute right-3 top-3 text-white/40 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {errorMsg && (
                  <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 py-1.5 px-3 rounded-xl">
                    <ShieldAlert size={12} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold tracking-[0.2em] uppercase shadow-glow-white hover:bg-purple-200 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Key size={14} />
                  <span>AUTENTICAR CLAVE</span>
                </button>
              </form>

              {/* Secret Hint */}
              <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-white/40">
                <span>¿No tienes clave? Prueba: </span>
                <button
                  onClick={() => setPasscode('SYNICAL-VAULT')}
                  className="text-purple-300 hover:text-white underline font-bold"
                >
                  SYNICAL-VAULT
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                <Unlock size={28} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 tracking-[0.3em] uppercase font-bold">
                  AUTENTICACIÓN EXITOSA // NIVEL SYNICAL VIP
                </span>
                <h3 className="text-xl font-bold font-mono tracking-wider uppercase text-white">
                  ¡BIENVENIDO AL ARCHIVO PRIVADO!
                </h3>
                <p className="text-xs font-mono text-white/70 leading-relaxed">
                  Has desbloqueado el cupón exclusivo <strong>VIP20</strong> (-20% OFF en toda la tienda) y acceso garantizado al Drop 02 antes de su lanzamiento global.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-emerald-300 font-bold">
                  <span>ESTADO VIP:</span>
                  <span>ACTIVO PERMANENTE</span>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span>DESCUENTO APLICADO:</span>
                  <span className="text-white font-bold">20% EN TU BOLSA</span>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span>ENVÍO PRIORITARIO:</span>
                  <span className="text-sky-300 font-bold">INCLUIDO</span>
                </div>
              </div>

              <button
                onClick={closeVault}
                className="w-full py-3.5 rounded-full bg-white text-slate-950 font-mono text-xs font-bold tracking-[0.2em] uppercase shadow-glow-white hover:bg-sky-200 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>CONTINUAR A LA TIENDA CON VIP</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
