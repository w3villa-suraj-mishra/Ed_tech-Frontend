import React from 'react';

// Generic reusable modal
export default function AdminModal({ isOpen, title, onClose, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-[#161D29] border border-[#2C333F] rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-[#2C333F] shrink-0">
          <h2 className="text-lg font-bold text-[#F1F2FF]">{title}</h2>
          <button onClick={onClose} className="text-[#AFB2BF] hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
