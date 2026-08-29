import React, { useState } from 'react';
import { sidebarLinks } from '../../../data/dashboard-links';
import { logout } from '../../../services/operations/authAPI';
import { useDispatch, useSelector } from 'react-redux';
import SidebarLink from './SidebarLink';
import { useNavigate } from 'react-router-dom';
import { VscSignOut } from 'react-icons/vsc';
import ConfirmationModal from '../../Common/ConfirmationModal';

const Sidebar = () => {
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  if (profileLoading || authLoading) {
    return (
      <div className="hidden md:grid h-[calc(100vh-4rem)] w-64 items-center border-r border-blue-950/30 bg-[#070913] sticky top-16">
        <div className="spinner mx-auto"></div>
      </div>
    );
  }

  const userRole = user?.accountType || user?.account_type;

  return (
    <>
      {/* DESKTOP STICKY SIDEBAR (Hidden on mobile < md) */}
      <aside className="hidden md:flex flex-col border-r border-blue-950/30 bg-[#070913] py-6 shrink-0 w-64 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto custom-scrollbar justify-between">
        <div className="flex flex-col gap-1">
          <SidebarLink
            link={{ name: 'My Profile', path: '/dashboard/my-profile' }}
            iconName="VscAccount"
          />
          {sidebarLinks.map((link) => {
            if (link.type && userRole !== link.type) return null;
            return (
              <SidebarLink
                key={link.id}
                link={link}
                iconName={link.icon}
              />
            );
          })}
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

      {/* Confirmation Modal for Logout */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
};

export default Sidebar;
