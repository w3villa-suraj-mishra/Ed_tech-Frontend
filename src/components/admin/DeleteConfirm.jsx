import React from 'react';

export default function DeleteConfirm({ isOpen, onClose, onConfirm, title = 'Delete?', message = 'This action cannot be undone.', loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161D29] border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h3 className="text-lg font-bold text-[#F1F2FF] mb-2">{title}</h3>
        <p className="text-[#AFB2BF] text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-[#2C333F] text-[#AFB2BF] hover:bg-[#2C333F] transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm disabled:opacity-60"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
