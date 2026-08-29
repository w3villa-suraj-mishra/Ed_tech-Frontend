import React from 'react';
import * as Icons from 'react-icons/vsc';
import { useDispatch } from 'react-redux';
import { matchPath, useLocation, NavLink } from 'react-router-dom';
import { resetCourseState } from '../../../services/slices/courseSlice';

const SidebarLink = ({ link, iconName, onClick }) => {
  const Icon = Icons[iconName] || Icons.VscBook;
  const location = useLocation();
  const dispatch = useDispatch();

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  const handleClick = (e) => {
    dispatch(resetCourseState());
    if (onClick) onClick(e);
  };

  const isSelected = matchRoute(link.path);

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={`relative px-4 py-2.5 mx-2 my-0.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
        isSelected
          ? 'bg-blue-950/50 text-blue-300 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.25)] font-bold'
          : 'text-richblack-300 hover:text-white hover:bg-white/5'
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-500 shadow-[0_0_8px_#3b82f6] transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
      ></span>
      <div className="flex items-center gap-x-3">
        {Icon && <Icon className={`text-base sm:text-lg ${isSelected ? 'text-blue-400' : 'text-richblack-400'}`} />}
        <span>{link.name}</span>
      </div>
    </NavLink>
  );
};

export default SidebarLink;
