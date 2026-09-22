import React from 'react';
import * as VscIcons from 'react-icons/vsc';
import * as FiIcons from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { matchPath, useLocation, NavLink } from 'react-router-dom';
import { resetCourseState } from '../../../services/slices/courseSlice';

const SidebarLink = ({ link, iconName, onClick }) => {
  const Icon = FiIcons[iconName] || VscIcons[iconName] || FiIcons.FiBookOpen;
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
  const isNotification = link.name?.toLowerCase().includes("notification");

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={`relative px-3.5 py-2.5 mx-2 my-0.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-between group ${
        isSelected
          ? 'bg-[#13AA92]/10 text-[#3BA7F2] font-bold shadow-xs'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 font-medium'
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#3BA7F2] transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
      ></span>
      <div className="flex items-center gap-x-3">
        {Icon && (
          <Icon
            className={`text-base sm:text-lg transition-colors ${
              isSelected ? 'text-[#3BA7F2]' : 'text-gray-400 group-hover:text-gray-600'
            }`}
          />
        )}
        <span>{link.name}</span>
      </div>

      {isNotification && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
      )}
    </NavLink>
  );
};

export default SidebarLink;

