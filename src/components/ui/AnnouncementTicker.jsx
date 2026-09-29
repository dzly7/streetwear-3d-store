import React from 'react';
import { Sparkles, Flame, ShieldCheck } from 'lucide-react';

export default function AnnouncementTicker() {
  const announcements = [
    { icon: <Flame size={12} className="text-amber-400" />, text: "DROP 01 OTOÑO/INVIERNO DISPONIBLE // EDICIÓN LIMITADA // NO RESTOCKS" },
    { icon: <Sparkles size={12} className="text-purple-400" />, text: "ALGODÓN FRANCÉS PESADO 480GSM // HERRAJES EN CROMO SÓLIDO" },
    { icon: <ShieldCheck size={12} className="text-sky-400" />, text: "ENVÍO GRATIS A PARTIR DE $200 USD // GARANTÍA DE SATISFACCIÓN 14 DÍAS" },
    { icon: <Flame size={12} className="text-rose-400" />, text: "CUPÓN 'SYNICAL10' PARA 10% DE DESCUENTO EN TU PRIMERA ORDEN" }
  ];

  return (
    <div className="relative w-full bg-slate-950/85 backdrop-blur-md border-b border-white/15 overflow-hidden py-1.5 z-40 select-none">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {/* Double array for seamless infinite marquee loop */}
        {[...announcements, ...announcements, ...announcements].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-2.5 mx-6 text-[10px] font-mono tracking-[0.22em] text-white/90 uppercase whitespace-nowrap"
          >
            {item.icon}
            <span>{item.text}</span>
            <span className="text-white/30 ml-4 font-bold">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
