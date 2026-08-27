import React, { useEffect } from 'react';

const COLORS = [
  '#f43f5e', // rose
  '#ec4899', // pink
  '#d946ef', // fuchsia
  '#a855f7', // purple
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#eab308'  // yellow
];

export const HeartGlowOverlay: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  useEffect(() => {
    if (!enabled) return;

    const spawnHeart = (x: number, y: number) => {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const randomRot = (Math.random() - 0.5) * 45;
      const randomSize = Math.floor(Math.random() * 12) + 20; // 20-32px

      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.color = randomColor;
      heart.style.width = `${randomSize}px`;
      heart.style.height = `${randomSize}px`;
      heart.style.setProperty('--rot', `${randomRot}deg`);

      heart.innerHTML = `
        <svg viewBox="0 0 32 32" fill="currentColor" style="width: 100%; height: 100%; filter: drop-shadow(0 0 8px currentColor);">
          <path d="M16 28.5L14.1 26.8C7.1 20.4 2.5 16.2 2.5 11C2.5 6.8 5.8 3.5 10 3.5C12.4 3.5 14.7 4.6 16 6.4C17.3 4.6 19.6 3.5 22 3.5C26.2 3.5 29.5 6.8 29.5 11C29.5 16.2 24.9 20.4 17.9 26.8L16 28.5Z"/>
        </svg>
      `;

      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 750);
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      // Don't trigger on interactive input / text fields to avoid distraction
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (clientX && clientY) {
        spawnHeart(clientX, clientY);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [enabled]);

  return null;
};
