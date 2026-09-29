import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []); // Run once on mount!

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Precision Chrome Crosshair Dot */}
      <div
        className={`fixed rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out ${
          isMouseDown ? 'w-3 h-3 bg-sky-300' : 'w-2 h-2'
        }`}
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />

      {/* Cyber Reticle Outer Ring */}
      <div
        className={`fixed rounded-full border -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out flex items-center justify-center ${
          isHovered
            ? 'w-10 h-10 border-white/80 bg-white/10 scale-110 shadow-glow-white'
            : isMouseDown
            ? 'w-5 h-5 border-sky-400 bg-sky-400/20 scale-90'
            : 'w-6 h-6 border-white/40 scale-100'
        }`}
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        {isHovered && (
          <div className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-ping" />
        )}
      </div>
    </div>
  );
}
