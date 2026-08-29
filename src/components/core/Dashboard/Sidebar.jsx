import React, { useState, useEffect } from 'react';
import { sidebarLinks } from '../../../data/dashboard-links';
import { logout } from '../../../services/operations/authAPI';
import { useDispatch, useSelector } from 'react-redux';
import SidebarLink from './SidebarLink';
import { useNavigate } from 'react-router-dom';
import { VscSignOut, VscClose, VscAccount, VscSettingsGear } from 'react-icons/vsc';
import ConfirmationModal from '../../Common/ConfirmationModal';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Close mobile drawer on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen?.(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  if (profileLoading || authLoading) {
    return (
      <div className="hidden md:grid h-[calc(100vh-4rem)] w-64 items-center border-r border-blue-950/30 bg-[#070913] sticky top-16">
        <div className="spinner mx-auto"></div>
      </div>
    );
  }

  const userRole = user?.accountType || user?.account_type;

  const renderNavLinks = (closeDrawer = false) => (
    <div className="flex flex-col gap-1">
      <SidebarLink
        link={{ name: 'My Profile', path: '/dashboard/my-profile' }}
        iconName="VscAccount"
        onClick={() => closeDrawer && setIsMobileOpen?.(false)}
      />
      {sidebarLinks.map((link) => {
        if (link.type && userRole !== link.type) return null;
        return (
          <SidebarLink
            key={link.id}
            link={link}
            iconName={link.icon}
            onClick={() => closeDrawer && setIsMobileOpen?.(false)}
          />
        );
      })}
    </div>
  );

  return (
    <>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. DESKTOP SIDEBAR (Visible only on md and larger)          */}
      {/* ──────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col border-r border-blue-950/30 bg-[#070913] py-6 shrink-0 w-64 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto custom-scrollbar justify-between">
        <div className="flex flex-col gap-1">
          {renderNavLinks(false)}
        </div>

        <div className="flex flex-col gap-1 pt-4 border-t border-blue-950/40 mt-4">
          <SidebarLink
            link={{ name: 'Settings', path: '/dashboard/settings' }}
            iconName="VscSettingsGear"
          />
          <button
            onClick={() =>
              setConfirmationModal({
                text1: 'Are you sure?',
                text2: 'You will be logged out of your account.',
                btn1Text: 'Logout',
                btn2Text: 'Cancel',
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className="px-4 py-2.5 mx-2 my-0.5 text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left cursor-pointer"
          >
            <div className="flex items-center gap-x-3 px-2">
              <VscSignOut className="text-lg text-red-400" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. MOBILE NAVIGATION DRAWER OVERLAY (Visible when open)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* Semi-transparent Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileOpen?.(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[290px] max-w-[85vw] bg-[#070913] border-r border-blue-950/40 z-[101] flex flex-col justify-between py-5 px-3 shadow-2xl overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between px-3 pb-4 mb-4 border-b border-blue-950/40">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName || 'User'}`}
                    alt={user?.firstName}
                    className="w-9 h-9 rounded-full object-cover border border-blue-500/40 shadow-sm"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white truncate max-w-[140px]">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      {userRole || 'Student'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileOpen?.(false)}
                  className="p-2 rounded-xl text-richblack-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close Drawer"
                >
                  <VscClose className="text-xl" />
                </button>
              </div>

              {/* Navigation Links */}
              {renderNavLinks(true)}
            </div>

            {/* Bottom Links: Settings & Logout */}
            <div className="flex flex-col gap-1 pt-4 border-t border-blue-950/40 mt-4">
              <SidebarLink
                link={{ name: 'Settings', path: '/dashboard/settings' }}
                iconName="VscSettingsGear"
                onClick={() => setIsMobileOpen?.(false)}
              />
              <button
                onClick={() => {
                  setIsMobileOpen?.(false);
                  setConfirmationModal({
                    text1: 'Are you sure?',
                    text2: 'You will be logged out of your account.',
                    btn1Text: 'Logout',
                    btn2Text: 'Cancel',
                    btn1Handler: () => dispatch(logout(navigate)),
                    btn2Handler: () => setConfirmationModal(null),
                  });
                }}
                className="px-4 py-2.5 mx-2 my-0.5 text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left cursor-pointer"
              >
                <div className="flex items-center gap-x-3 px-2">
                  <VscSignOut className="text-lg text-red-400" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Logout */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
};

export default Sidebar;
