import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/core/Dashboard/Sidebar';
import NotificationBell from '../components/Navbar/NotificationBell';

function Dashboard() {
  const { user } = useSelector((state) => state.profile);
  const { loading: authloading } = useSelector((state) => state.auth);
  const { loading: profileloading } = useSelector((state) => state.profile);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (profileloading || authloading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#070913]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#070913] flex flex-col">
      
      {/* ──────────────────────────────────────────────────────────── */}
      {/* MOBILE APPLICATION HEADER (Visible only on mobile < md)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-30 bg-[#0a0f1d] border-b border-blue-950/40 px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl bg-[#141728] border border-blue-500/30 text-blue-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            aria-label="Open Mobile Navigation Menu"
          >
            <span className="text-base leading-none">☰</span>
            <span>Menu</span>
          </button>

          <span className="text-xs font-bold text-white truncate max-w-[130px]">
            {user?.firstName ? `${user.firstName}'s Workspace` : 'Dashboard'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <img
            src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName || 'User'}`}
            alt={user?.firstName}
            className="w-7 h-7 rounded-full object-cover border border-blue-500/40"
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* APP BODY CONTAINER: Sidebar + Main Content                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] w-full mx-auto flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 flex-1">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        
        <main className="flex-1 min-w-0 py-6 md:py-8 lg:pl-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default Dashboard;