import React from 'react'
import * as Icons from "react-icons/vsc"
import { useDispatch } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom'
import { resetCourseState } from "../../../services/slices/courseSlice"
const SidebarLink = ({link,iconName}) => {

    const  Icon = Icons[iconName];
    const location = useLocation();
    const dispatch = useDispatch()

    const matchRoute =(route)=>{
        return matchPath({path:route},location.pathname);
    }

  return (
    <NavLink
    to={link.path}
    onClick={() => dispatch(resetCourseState())}
    className={`relative px-6 py-2.5 mx-3 my-0.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      matchRoute(link.path)
        ? "bg-blue-950/40 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(37, 99, 235,0.2)]"
        : "text-richblack-300 hover:text-white hover:bg-white/5"
    }`}
  >
    <span
      className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-500 shadow-[0_0_8px_#3b82f6] ${
        matchRoute(link.path) ? "opacity-100" : "opacity-0"
      }`}
    ></span>
    <div className="flex items-center gap-x-3">
      {Icon && <Icon className="text-lg text-blue-400" />}
      <span>{link.name}</span>
    </div>
  </NavLink>
  )
}

export default SidebarLink
