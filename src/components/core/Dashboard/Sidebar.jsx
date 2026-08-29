import React, { useState } from 'react'

import { sidebarLinks } from '../../../data/dashboard-links'
import {logout} from "../../../services/operations/authAPI"
import { useDispatch, useSelector } from 'react-redux'
import SidebarLink from './SidebarLink'
import { useNavigate } from 'react-router-dom'
import {VscSignOut} from "react-icons/vsc"
import ConfirmationModal from "../../Common/ConfirmationModal"

const Sidebar = () => {

    const {user, loading: profileLoading} = useSelector((state) => state.profile);
    const {loading:authLoading} = useSelector((state)=>state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [confirmationModal, setConfirmationModal] = useState(null);

    if(profileLoading || authLoading) {
        return (
            <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
            <div className="spinner"></div>
          </div>
        )
    }

  return (
    <>
      <div className="flex md:h-[calc(100vh-4rem)] md:sticky md:top-16 w-full md:w-64 shrink-0 flex-col border-b md:border-b-0 md:border-r border-blue-950/30 bg-[#070913] py-6">
        <div className="flex flex-col">
          <SidebarLink
            link={{ name: "My Profile", path: "/dashboard/my-profile" }}
            iconName="VscAccount"
          />
          {sidebarLinks.map((link) => {
            const userRole = user?.accountType || user?.account_type;
            if (link.type && userRole !== link.type) return null
            return (
              <SidebarLink key={link.id} link={link} iconName={link.icon} />
            )
          })}
        </div>
        <div className="mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-blue-950/30" />
        <div className="flex flex-col">
          <SidebarLink
            link={{ name: "Settings", path: "/dashboard/settings" }}
            iconName="VscSettingsGear"
          />
          <button
            onClick={() =>
              setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className="px-6 py-2.5 mx-3 my-0.5 text-sm font-semibold text-richblack-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
          >
            <div className="flex items-center gap-x-3">
              <VscSignOut className="text-lg text-blue-400" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default Sidebar
