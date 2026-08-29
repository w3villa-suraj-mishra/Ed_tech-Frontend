import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    Published: 'bg-green-500/15 text-green-400 border-green-500/30',
    Draft:     'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    Superadmin:'bg-[#FFD60A]/15 text-[#FFD60A] border-[#FFD60A]/30',
    Admin:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Instructor:'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Student:   'bg-[#AFB2BF]/15 text-[#AFB2BF] border-[#AFB2BF]/30',
    Scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Live:      'bg-red-500/15 text-red-400 border-red-500/30',
    Ended:     'bg-[#AFB2BF]/15 text-[#AFB2BF] border-[#AFB2BF]/30',
    true:      'bg-green-500/15 text-green-400 border-green-500/30',
    false:     'bg-red-500/15 text-red-400 border-red-500/30',
  };
  const key = status === true ? 'true' : status === false ? 'false' : String(status);
  const cls = map[key] || 'bg-[#AFB2BF]/15 text-[#AFB2BF] border-[#AFB2BF]/30';
  const label = status === true ? 'Active' : status === false ? 'Inactive' : status;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-lg border border-[#2C333F] text-[#AFB2BF] hover:bg-[#2C333F] disabled:opacity-40 text-sm transition-colors"
      >← Prev</button>
      <span className="text-sm text-[#AFB2BF]">Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-lg border border-[#2C333F] text-[#AFB2BF] hover:bg-[#2C333F] disabled:opacity-40 text-sm transition-colors"
      >Next →</button>
    </div>
  );
}

export function AdminInput({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-[#AFB2BF] mb-1">{label}</label>}
      <input
        {...props}
        className={`w-full bg-[#000814] border ${error ? 'border-red-500' : 'border-[#2C333F]'} rounded-lg px-4 py-2.5 text-[#F1F2FF] placeholder-[#585D69] text-sm focus:outline-none focus:border-[#FFD60A] transition-colors`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function AdminSelect({ label, error, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-[#AFB2BF] mb-1">{label}</label>}
      <select
        {...props}
        className={`w-full bg-[#000814] border ${error ? 'border-red-500' : 'border-[#2C333F]'} rounded-lg px-4 py-2.5 text-[#F1F2FF] text-sm focus:outline-none focus:border-[#FFD60A] transition-colors`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function AdminTextarea({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-[#AFB2BF] mb-1">{label}</label>}
      <textarea
        {...props}
        className={`w-full bg-[#000814] border ${error ? 'border-red-500' : 'border-[#2C333F]'} rounded-lg px-4 py-2.5 text-[#F1F2FF] placeholder-[#585D69] text-sm focus:outline-none focus:border-[#FFD60A] transition-colors resize-none`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function StatCard({ label, value, icon, color = 'yellow' }) {
  const colors = {
    yellow: 'from-[#FFD60A]/10 to-transparent border-[#FFD60A]/20 text-[#FFD60A]',
    blue:   'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    green:  'from-green-500/10 to-transparent border-green-500/20 text-green-400',
    purple: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    red:    'from-red-500/10 to-transparent border-red-500/20 text-red-400',
    gray:   'from-[#585D69]/10 to-transparent border-[#585D69]/20 text-[#AFB2BF]',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} bg-[#161D29] border rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value ?? '—'}</span>
      </div>
      <p className="text-sm text-[#AFB2BF] font-medium">{label}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-[#2C333F]">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-[#2C333F] rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message = 'No records found.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-[#AFB2BF] mb-4">{message}</p>
      {action}
    </div>
  );
}

export function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}');

  if (!adminToken) {
    window.location.href = '/admin/login';
    return null;
  }
  
  if (user?.accountType !== 'Admin' && user?.accountType !== 'Superadmin') {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl font-bold mb-4">✕</div>
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          You are currently logged in as a <strong>{user?.accountType || 'Student/Instructor'}</strong>. Please log in with an Admin account to manage articles.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
          }}
          className="px-5 py-2.5 bg-[#FFD60A] text-[#000814] rounded-xl font-bold text-xs"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  return children;
}
