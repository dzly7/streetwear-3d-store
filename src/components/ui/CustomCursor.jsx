import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOverInput, setIsOverInput] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    document.body.classList.add('custom-cursor-enabled');

    let rafId;
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    const render = () => {
      // Smooth lerp for outer reticle ring (but instant for inner dot)
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);

      const target = e.target;
      if (!target) return;

      // If hovering over input, textarea, select, or native-cursor zone, let OS cursor handle it
      const isInput = Boolean(
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('.native-cursor') ||
        target.closest('.admin-portal')
      );
      setIsOverInput(isInput);

      // Check for interactive clickable targets
      const isInteractive = Boolean(
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer')
      );
      setIsHovered(isInteractive && !isInput);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // When over inputs or not visible, hide custom elements so native cursor works flawlessly
  const shouldShow = isVisible && !isOverInput;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-150 ${
        shouldShow ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Precision Chrome Crosshair Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,1)] transition-[width,height,background-color] duration-75 ease-out ${
          isMouseDown ? 'w-3.5 h-3.5 bg-sky-300' : 'w-2 h-2'
        }`}
      />

      {/* Cyber Reticle Outer Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-[width,height,border-color,background-color] duration-150 ease-out flex items-center justify-center ${
          isHovered
            ? 'w-10 h-10 border-white/90 bg-white/10 shadow-glow-white scale-110'
            : isMouseDown
            ? 'w-5 h-5 border-sky-400 bg-sky-400/20 scale-90'
            : 'w-6 h-6 border-white/40 scale-100'
        }`}
      >
        {isHovered && (
          <div className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-ping" />
        )}
      </div>
    </div>
  );
}
