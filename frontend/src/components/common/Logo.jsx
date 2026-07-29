import React from 'react';

const Logo = ({ 
  className = "w-9 h-9", 
  iconSize = "w-5 h-5",
  textClassName = "text-2xl font-bold font-heading tracking-tight text-neutral-900", 
  showText = true 
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none group">
      <div className={`${className} bg-green-700 text-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-green-800 transition-all p-1.5 shrink-0`}>
        {/* Vectored Link & Node Symbol */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={iconSize}>
          <path d="M9 17H7A5 5 0 0 1 7 7h2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 7h2a5 5 0 1 1 0 10h-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className={textClassName}>
          Nano<span className="text-green-700">Link</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
