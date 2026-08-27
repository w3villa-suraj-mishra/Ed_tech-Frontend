import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineShoppingCart, AiOutlineSearch } from "react-icons/ai";
import { VscSignOut, VscDashboard, VscBook, VscAccount, VscBell, VscGear, VscCode } from "react-icons/vsc";
import { logout } from "../../services/operations/authAPI";
import { fetchCourseCategories, getAllCourses } from "../../services/operations/courseDetailsAPI";
import NotificationBell from './NotificationBell';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('userTheme') || 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

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

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('userTheme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-mode-active');
    } else {
      document.documentElement.classList.remove('light-mode-active');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchRoute = (route) => {
    return location.pathname === route;
  };

  return (
    <nav className="w-full bg-[#070913] border-b border-purple-900/30 sticky top-0 z-50 py-3">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b0e1b]/90 border border-purple-500/30 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_0_25px_rgba(168,85,247,0.15)] backdrop-blur-xl">
        
        {/* BRAND LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#141728] border border-purple-500/40 flex items-center justify-center text-purple-400 text-lg group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <VscCode />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-lg tracking-tight leading-none">
              CodeLearn
            </span>
            <span className="text-[9px] text-richblack-400 font-medium tracking-widest uppercase mt-0.5">
              Learn. Build. Grow.
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <ul className="hidden md:flex items-center gap-x-6 lg:gap-x-8 text-richblack-200 text-xs sm:text-sm font-medium">
          
          {/* Courses Dropdown */}
          <li
            className="relative flex items-center cursor-pointer group py-1"
            onMouseEnter={() => setIsCoursesOpen(true)}
            onMouseLeave={() => setIsCoursesOpen(false)}
          >
            <span className={`flex items-center gap-1 transition-colors duration-200 ${matchRoute('/courses') ? 'text-purple-400 font-bold' : 'hover:text-white'}`}>
              <span>Courses</span>
              <span className="text-[10px] transform group-hover:rotate-180 transition-transform duration-200">▾</span>
            </span>

            {matchRoute('/courses') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
            )}

            {isCoursesOpen && (
              <div className="absolute top-full left-0 pt-3 w-[280px] z-50">
                <div className="bg-[#0e111f] rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.25)] border border-purple-500/30 text-white animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#0e111f] rotate-45 border-t border-l border-purple-500/30" />
                  
                  <div className="px-2 pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                      Popular Courses
                    </span>
                    <span className="text-[10px] bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                      {courses.length} Available
                    </span>
                  </div>

                  <div className="max-h-[260px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {courses.length > 0 ? (
                      courses.slice(0, 10).map((course, i) => (
                        <Link
                          key={course._id || i}
                          to={`/courses/${course._id}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-richblack-100 hover:bg-purple-900/30 hover:text-purple-300 transition-all group/item"
                        >
                          <div className="flex flex-col max-w-[180px]">
                            <span className="truncate capitalize">{course.courseName}</span>
                            {course.instructor && (
                              <span className="text-[10px] text-richblack-400 font-normal">
                                By {course.instructor.firstName || 'Instructor'}
                              </span>
                            )}
                          </div>
                          <span className="text-purple-400 font-bold text-xs">
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
                    <Link to="/courses" className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1">
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
            <span className={`flex items-center gap-1 transition-colors duration-200 ${matchRoute('/catalog') ? 'text-purple-400 font-bold' : 'hover:text-white'}`}>
              <span>Category</span>
              <span className="text-[10px] transform group-hover:rotate-180 transition-transform duration-200">▾</span>
            </span>

            {matchRoute('/catalog') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
            )}

            {isCatalogOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[260px] z-50">
                <div className="bg-[#0e111f] rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.25)] border border-purple-500/30 text-white animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0e111f] rotate-45 border-t border-l border-purple-500/30" />
                  
                  <div className="px-2 pb-2 mb-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                      Explore Categories
                    </span>
                    <span className="text-[10px] bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                      {categories.length} Total
                    </span>
                  </div>

                  <div className="max-h-[260px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {categories.length > 0 ? (
                      categories.map((subLink, i) => (
                        <Link
                          key={subLink._id || i}
                          to={`/courses?category=${subLink._id || subLink.name.split(" ").join("-").toLowerCase()}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-richblack-100 hover:bg-purple-900/30 hover:text-purple-300 transition-all group/item"
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
            <Link to="/practice" className={`transition-colors duration-200 ${matchRoute('/practice') ? 'text-purple-400 font-bold' : 'hover:text-white'}`}>
              Practice
            </Link>
            {matchRoute('/practice') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
            )}
          </li>

          {/* About */}
          <li className="relative py-1">
            <Link to="/about" className={`transition-colors duration-200 ${matchRoute('/about') ? 'text-purple-400 font-bold' : 'hover:text-white'}`}>
              About
            </Link>
            {matchRoute('/about') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
            )}
          </li>

          {/* Contact */}
          <li className="relative py-1">
            <Link to="/contact" className={`transition-colors duration-200 ${matchRoute('/contact') ? 'text-purple-400 font-bold' : 'hover:text-white'}`}>
              Contact
            </Link>
            {matchRoute('/contact') && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
            )}
          </li>
        </ul>

        {/* ACTION CONTROLS */}
        <div className="flex items-center gap-3">

          {/* Real-time Notification Bell */}
          <NotificationBell />

          {/* Light / Dark Theme Switch Button */}
          {/* <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-full bg-[#141728] border border-white/10 hover:border-purple-500/40 text-richblack-300 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button> */}

          {/* Unauthenticated Login / Sign Up */}
          {token === null && (
            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <button className="px-4 py-2 rounded-xl border border-purple-500/40 bg-[#121124] text-xs font-semibold text-white hover:bg-purple-900/30 transition-all">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:opacity-95 transition-all">
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
                  className="aspect-square w-[36px] rounded-full object-cover ring-2 ring-purple-500/80 hover:ring-purple-400 transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                />
              </button>

              {/* Account Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0e111f] border border-purple-500/30 text-richblack-100 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.25)] z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  <div className="px-4 py-2 border-b border-white/10 mb-1">
                    <h3 className="font-semibold text-xs text-white">My Account</h3>
                    <p className="text-[10px] text-richblack-400 truncate">{user?.email}</p>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/dashboard/my-profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-purple-900/30 hover:text-white transition-colors"
                    >
                      <VscDashboard className="text-sm text-purple-400" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard/enrolled-courses"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-purple-900/30 hover:text-white transition-colors"
                    >
                      <VscBook className="text-sm text-purple-400" />
                      <span>Courses</span>
                    </Link>

                    {user && user?.account_type === "Student" && (
                      <Link
                        to="/dashboard/cart"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-xs text-richblack-200 hover:bg-purple-900/30 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <AiOutlineShoppingCart className="text-sm text-purple-400" />
                          <span>Cart</span>
                        </div>
                        {totalItems > 0 && (
                          <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                    )}

                    <Link
                      to="/dashboard/my-profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-purple-900/30 hover:text-white transition-colors"
                    >
                      <VscAccount className="text-sm text-purple-400" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-purple-900/30 hover:text-white transition-colors"
                    >
                      <VscGear className="text-sm text-purple-400" />
                      <span>Account</span>
                    </Link>

                    <Link
                      to="/dashboard/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-xs text-richblack-200 hover:bg-purple-900/30 hover:text-white transition-colors"
                    >
                      <VscBell className="text-sm text-purple-400" />
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
    </nav>
  );
};

export default Navbar;
