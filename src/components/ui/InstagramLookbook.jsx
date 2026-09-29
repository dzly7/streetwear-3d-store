import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { LOOKBOOK_POSTS } from '../../data/products';

function InstagramIcon({ size = 16, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function InstagramLookbook() {
  return (
    <section id="lookbook" className="relative py-20 px-4 sm:px-8 max-w-7xl mx-auto z-10 text-center">
      
      {/* Centered Instagram Callout en Español */}
      <div className="flex flex-col items-center justify-center space-y-3 mb-12">
        <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-[0.25em] uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          COMUNIDAD & LOOKBOOK VIRTUAL
        </h2>
        <p className="text-xs font-mono tracking-[0.15em] uppercase text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          SÍGUENOS EN NUESTRO CANAL OFICIAL PARA DROPS ANTICIPADOS Y PIEZAS ARCHIVADAS
        </p>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center space-x-2 px-8 py-2.5 rounded-full bg-white text-slate-950 hover:bg-sky-200 transition-all text-xs font-mono font-bold tracking-widest uppercase shadow-glow-white"
        >
          <InstagramIcon size={14} />
          <span>SEGUIR EN INSTAGRAM</span>
        </a>
      </div>

      {/* Grid of Lookbook Posts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
        {LOOKBOOK_POSTS.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group relative rounded-2xl border border-white/30 bg-white/5 backdrop-blur-sm p-3 overflow-hidden shadow-lg hover:border-white/70 transition-all"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-mono text-white">
                  <Heart size={14} className="text-red-400 fill-red-400" />
                  <span>{post.likes}</span>
                </div>
              </div>
            </div>

            <div className="px-1 pb-1">
              <span className="text-[10px] font-mono text-sky-300 block font-bold">
                {post.user}
              </span>
              <p className="text-[11px] font-mono text-white/80 line-clamp-2 mt-0.5">
                {post.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* About Us Block en Español */}
      <div id="about" className="mt-16 rounded-3xl border border-white/30 bg-white/5 backdrop-blur-md p-8 sm:p-12 text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <span className="text-[10px] font-mono text-sky-300 tracking-[0.3em] uppercase block font-bold">
            SOBRE NOSOTROS // MANIFIESTO
          </span>
          <p className="text-xs sm:text-sm font-mono text-white/90 leading-relaxed uppercase">
            SYNICAL ES UN ATELIER DE STREETWEAR VIRTUAL Y FÍSICO NACIDO EN LA INTERSECCIÓN ENTRE LA MODA SUBTERRÁNEA Y LA ALTA TECNOLOGÍA DIGITAL. REDEFINIMOS LAS SILUETAS MEDIANTE TEJIDOS DE ALGODÓN PESADO DE 480GSM, DROPS ESTRICTAMENTE LIMITADOS Y HERRAJES METÁLICOS DE CROMO LÍQUIDO.
          </p>
        </div>

        <div className="flex-shrink-0 select-none">
          <span className="font-gothic text-4xl sm:text-6xl text-white tracking-widest drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]">
            Synical
          </span>
        </div>
      </div>

    </section>
  );
}
