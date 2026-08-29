import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { VscSignOut, VscDashboard, VscBook, VscAccount, VscBell, VscGear, VscCode, VscInfo, VscCallIncoming, VscTag } from "react-icons/vsc";
import { logout } from "../../services/operations/authAPI";
import { fetchCourseCategories, getAllCourses } from "../../services/operations/courseDetailsAPI";
import NotificationBell from './NotificationBell';
import { sidebarLinks } from '../../data/dashboard-links';
import SidebarLink from '../core/Dashboard/SidebarLink';

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const userRole = user?.accountType || user?.account_type;

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetchCourseCategories();
        if (res && Array.isArray(res)) {
          setCategories(res);
        }
      } catch (error) {
        console.log("Could not fetch categories list", error);
      }
    };
    const getCoursesList = async () => {
      try {
        const res = await getAllCourses();
        if (res && Array.isArray(res)) {
          setCourses(res);
        }
      } catch (error) {
        console.log("Could not fetch courses list", error);
      }
    };
    getCategories();
    getCoursesList();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock Body Scroll when Mobile Drawer is Open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const matchRoute = (route) => {
    return location.pathname === route;
  };

  return (
    <nav className="w-full bg-[#070913] border-b border-blue-950/30 sticky top-0 z-50 py-3">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-[#0b0e1b]/90 border border-blue-500/30 rounded-2xl sm:rounded-3xl px-3 sm:px-6 py-2 flex items-center justify-between shadow-[0_0_25px_rgba(37,99,235,0.15)] backdrop-blur-xl">
        
        {/* BRAND LOGO & MOBILE HAMBURGER BUTTON */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Hamburger Drawer Trigger Button (Only visible outside home page) */}
          {location.pathname !== '/' && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 hover:text-white transition-all text-base focus:outline-none shrink-0"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          )}

          {/* CodeLearn Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white text-base group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
              <VscCode />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-sm sm:text-base tracking-tight leading-none">
                CodeLearn
              </span>
              <span className="text-[8px] sm:text-[9px] text-blue-300 font-semibold tracking-widest uppercase mt-0.5">
                LEARN. BUILD. GROW.
              </span>
            </div>
          </Link>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <ul className="hidden md:flex items-center gap-x-6 lg:gap-x-8 text-richblack-200 text-xs sm:text-sm font-medium">
          
          {/* Courses Dropdown */}
          <li
            className="relative flex items-center cursor-pointer group py-1"
            onMouseEnter={() => setIsCoursesOpen(true)}
            onMouseLeave={() => setIsCoursesOpen(false)}
          >
            <span className={`flex items-center gap-1 transition-colors duration-200 ${matchRoute('/courses') ? 'text-blue-400 font-bold' : 'hover:text-white'}`}>
              <span>Courses</span>
              <span className="text-[10px] transform group-hover:rotate-180 transition-transform duration-200">▾</span>
            </span>

            {matchRoute('/courses') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
            )}

            {isCoursesOpen && (
              <div className="absolute top-full left-0 pt-3 w-[280px] z-50">
                <div className="bg-[#0e111f] rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(37,99,235,0.25)] border border-blue-500/30 text-white animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#0e111f] rotate-45 border-t border-l border-blue-500/30" />
                  
                  <div className="px-2 pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Popular Courses
                    </span>
                    <span className="text-[10px] bg-blue-950/40 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                      {courses.length} Available
                    </span>
                  </div>

                  <div className="max-h-[260px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {courses.length > 0 ? (
                      courses.slice(0, 10).map((course, i) => (
                        <Link
                          key={course._id || i}
                          to={`/courses/${course._id}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-richblack-100 hover:bg-blue-950/30 hover:text-blue-300 transition-all group/item"
                        >
                          <div className="flex flex-col max-w-[180px]">
                            <span className="truncate capitalize">{course.courseName}</span>
                            {course.instructor && (
                              <span className="text-[10px] text-richblack-400 font-normal">
                                By {course.instructor.firstName || 'Instructor'}
                              </span>
                            )}
                          </div>
                          <span className="text-blue-400 font-bold text-xs">
                            ₹{course.price || 0}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-xs text-richblack-400 py-3">
                        No Courses Available
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/10 text-center">
                    <Link to="/courses" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                      <span>View All Courses</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Category Dropdown */}
          <li
            className="relative flex items-center cursor-pointer group py-1"
            onMouseEnter={() => setIsCatalogOpen(true)}
            onMouseLeave={() => setIsCatalogOpen(false)}
          >
            <span className={`flex items-center gap-1 transition-colors duration-200 ${matchRoute('/catalog') ? 'text-blue-400 font-bold' : 'hover:text-white'}`}>
              <span>Category</span>
              <span className="text-[10px] transform group-hover:rotate-180 transition-transform duration-200">▾</span>
            </span>

            {matchRoute('/catalog') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
            )}

            {isCatalogOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[260px] z-50">
                <div className="bg-[#0e111f] rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(37,99,235,0.25)] border border-blue-500/30 text-white animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0e111f] rotate-45 border-t border-l border-blue-500/30" />
                  
                  <div className="px-2 pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Explore Categories
                    </span>
                    <span className="text-[10px] bg-blue-950/40 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                      {categories.length} Total
                    </span>
                  </div>

                  <div className="max-h-[260px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {categories.length > 0 ? (
                      categories.map((subLink, i) => (
                        <Link
                          key={subLink._id || i}
                          to={`/courses?category=${subLink._id || subLink.name.split(" ").join("-").toLowerCase()}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-richblack-100 hover:bg-blue-950/30 hover:text-blue-300 transition-all group/item"
                        >
                          <span className="capitalize">{subLink.name}</span>
                          <span className="text-richblack-400 group-hover/item:translate-x-0.5 transition-transform text-[10px]">
                            →
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-xs text-richblack-400 py-3">
                        No Categories Found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Practice Center Link */}
          <li className="relative py-1">
            <Link to="/practice" className={`transition-colors duration-200 ${matchRoute('/practice') ? 'text-blue-400 font-bold' : 'hover:text-white'}`}>
              Practice
            </Link>
            {matchRoute('/practice') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
            )}
          </li>

          {/* About */}
          <li className="relative py-1">
            <Link to="/about" className={`transition-colors duration-200 ${matchRoute('/about') ? 'text-blue-400 font-bold' : 'hover:text-white'}`}>
              About
            </Link>
            {matchRoute('/about') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
            )}
          </li>

          {/* Contact */}
          <li className="relative py-1">
            <Link to="/contact" className={`transition-colors duration-200 ${matchRoute('/contact') ? 'text-blue-400 font-bold' : 'hover:text-white'}`}>
              Contact
            </Link>
            {matchRoute('/contact') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
            )}
          </li>
        </ul>

        {/* ACTION CONTROLS (Notification Bell + Profile Dropdown / Auth Buttons) */}
        <div className="flex items-center gap-2.5">

          {/* Real-time Notification Bell */}
          <NotificationBell />

          {/* Unauthenticated Login / Sign Up */}
          {token === null && (
            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-blue-500/40 bg-[#121124] text-xs font-semibold text-white hover:bg-blue-950/30 transition-all">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-xs font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:opacity-95 transition-all">
                  Sign Up
                </button>
              </Link>
            </div>
          )}

          {/* Authenticated User Profile Avatar */}
          {token !== null && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <img
                  src={user?.image}
                  alt={user?.first_name}
                  referrerPolicy="no-referrer"
                  className="aspect-square w-[34px] sm:w-[36px] rounded-full object-cover ring-2 ring-blue-500/80 hover:ring-blue-400 transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                />
              </button>

              {/* Account Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-60 max-h-[80vh] overflow-y-auto custom-scrollbar rounded-2xl bg-[#0e111f] border border-blue-500/30 text-richblack-100 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(37,99,235,0.25)] z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  <div className="px-4 py-2 border-b border-white/10 mb-1">
                    <h3 className="font-semibold text-xs text-white">My Account</h3>
                    <p className="text-[10px] text-richblack-400 truncate">{user?.email}</p>
                  </div>

                  {/* Dynamic User Account Links */}
                  <div className="space-y-0.5">
                    <Link
                      to="/dashboard/global"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-blue-950/30 hover:text-white transition-colors"
                    >
                      <VscDashboard className="text-sm text-blue-400" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard/enrolled-courses"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-blue-950/30 hover:text-white transition-colors"
                    >
                      <VscBook className="text-sm text-blue-400" />
                      <span>Courses</span>
                    </Link>

                    {user && user?.account_type === "Student" && (
                      <Link
                        to="/dashboard/cart"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs text-richblack-200 hover:bg-blue-950/30 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <AiOutlineShoppingCart className="text-sm text-blue-400" />
                          <span>Cart</span>
                        </div>
                        {totalItems > 0 && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                    )}

                    <Link
                      to="/dashboard/my-profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-blue-950/30 hover:text-white transition-colors"
                    >
                      <VscAccount className="text-sm text-blue-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-blue-950/30 hover:text-white transition-colors"
                    >
                      <VscGear className="text-sm text-blue-400" />
                      <span>Account</span>
                    </Link>

                    <Link
                      to="/dashboard/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-blue-950/30 hover:text-white transition-colors"
                    >
                      <VscBell className="text-sm text-blue-400" />
                      <span>Notifications</span>
                    </Link>
                  </div>

                  <div className="border-t border-white/10 mt-1.5 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        dispatch(logout(navigate));
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
                    >
                      <VscSignOut className="text-sm text-red-400" />
                      <span>Logout</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        </div>
      </div>

      {/* MOBILE SLIDE-IN OVERLAY SIDEBAR DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[99999] flex">
          {/* Dark Translucent Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Left Slide-in Drawer */}
          <aside className="fixed top-0 bottom-0 left-0 w-[280px] max-w-[85vw] bg-[#080b16] border-r border-blue-500/30 z-[100000] flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-[15px_0_40px_rgba(0,0,0,0.9)] animate-in slide-in-from-left duration-300 p-4">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-blue-950/60 pb-4 mb-4">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white text-base shadow-[0_0_12px_rgba(37,99,235,0.4)]">
                    <VscCode />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-extrabold text-sm tracking-tight leading-none">CodeLearn</span>
                    <span className="text-[8px] text-blue-300 font-semibold tracking-widest uppercase mt-0.5">LEARN. BUILD. GROW.</span>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-richblack-300 hover:text-white transition-all text-base"
                  aria-label="Close Drawer"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Items (Role-Based) */}
              <div className="flex flex-col gap-1">
                <SidebarLink
                  link={{ name: 'My Profile', path: '/dashboard/my-profile' }}
                  iconName="VscAccount"
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                {sidebarLinks.map((link) => {
                  if (link.type && userRole !== link.type) return null;
                  return (
                    <SidebarLink
                      key={link.id}
                      link={link}
                      iconName={link.icon}
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-4 border-t border-blue-950/60 mt-6 flex flex-col gap-1">
              <SidebarLink
                link={{ name: 'Settings', path: '/dashboard/settings' }}
                iconName="VscSettingsGear"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {token ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    dispatch(logout(navigate));
                  }}
                  className="px-4 py-2.5 mx-2 my-0.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left cursor-pointer flex items-center gap-x-3"
                >
                  <VscSignOut className="text-base text-red-400" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-2 px-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-xl border border-blue-500/40 bg-[#121124] text-xs font-semibold text-white">
                      Log In
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-xs font-bold text-white shadow-md">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>

          </aside>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

