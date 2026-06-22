import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path 
        d="M16 2L28.1244 9V23L16 30L3.87564 23V9L16 2Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />
      <circle cx="16" cy="11" r="2.5" fill="#2563EB" />
      <circle cx="11" cy="20" r="2.5" fill="#3B82F6" />
      <circle cx="21" cy="20" r="2.5" fill="#3B82F6" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      <path d="M16 13.5V14" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12.5 18.5L14.5 17.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19.5 18.5L17.5 17.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M13.5 20H18.5" stroke="currentColor" opacity="0.3" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
