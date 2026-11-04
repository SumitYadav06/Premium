import React from 'react';

/** Neela verified tick — chhota sa component, taaki bade detail page ko
 *  sirf iske liye pehle load me na aana pade */
export const VerifiedBadge: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = ''
}) => (
  <span
    className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
    title="Verified Official Mod APK"
    style={{ width: size, height: size }}
  >
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className="w-full h-full drop-shadow-sm flex-shrink-0"
    >
      {/* Official Verified Blue Background Circle */}
      <circle cx="12" cy="12" r="10" fill="#0095F6" />
      {/* Crisp White Checkmark */}
      <path
        d="M8 12.2l2.8 2.8 5.4-5.6"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);
