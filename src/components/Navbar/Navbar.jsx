import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { VscSignOut, VscDashboard, VscBook, VscAccount, VscBell, VscGear } from "react-icons/vsc";
import { logout } from "../../services/operations/authAPI";
import { fetchCourseCategories, getAllCourses } from "../../services/operations/courseDetailsAPI";

import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('userTheme') || 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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

  return (
    <nav className="flex h-14 items-center justify-center border-b border-b-richblack-700 bg-richblack-900 transition-all duration-200 sticky top-0 z-50">
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <span className="text-xl font-bold text-richblack-25 tracking-wide">
            Code<span className="">Learn</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <ul className="flex gap-x-6 text-richblack-25 text-sm font-medium">
          {/* Dynamic Courses Dropdown (Replaced Home) */}
          <li
            className="relative flex items-center gap-1 cursor-pointer group"
            onMouseEnter={() => setIsCoursesOpen(true)}
            onMouseLeave={() => setIsCoursesOpen(false)}
          >
            <span className="hover:text-indigo-400 transition-all duration-200 flex items-center gap-1">
              Courses <span className="text-xs">▾</span>
            </span>

            {isCoursesOpen && (
              <div className="absolute top-full left-0 pt-3 w-[280px] z-50">
                <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-100" />
                  
                  <div className="px-2 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Popular Courses
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                      {courses.length} Live
                    </span>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {courses.length > 0 ? (
                      courses.map((course, i) => (
                        <Link
                          key={course._id || i}
                          to={`/courses/${course._id}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all group/item"
                        >
                          <div className="flex flex-col max-w-[190px]">
                            <span className="truncate capitalize">{course.courseName}</span>
                            {course.instructor && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                By {course.instructor.firstName || 'Instructor'}
                              </span>
                            )}
                          </div>
                          <span className="text-indigo-500 font-bold text-xs">
                            ₹{course.price || 0}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-3">
                        No Courses Available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* Category Dropdown */}
          <li
            className="relative flex items-center gap-1 cursor-pointer group"
            onMouseEnter={() => setIsCatalogOpen(true)}
            onMouseLeave={() => setIsCatalogOpen(false)}
          >
            <span className="hover:text-indigo-400 transition-all duration-200 flex items-center gap-1">
              Category <span className="text-xs">▾</span>
            </span>

            {isCatalogOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[260px] z-50">
                <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-100" />
                  
                  <div className="px-2 pb-2 mb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Explore Categories
                    </span>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {categories.length > 0 ? (
                      categories.map((subLink, i) => (
                        <Link
                          key={i}
                          to={`/category/${subLink.name.split(" ").join("-").toLowerCase()}`}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all group/item"
                        >
                          <span className="capitalize">{subLink.name}</span>
                          <span className="text-slate-400 group-hover/item:translate-x-0.5 transition-transform text-[10px]">
                            →
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-3">
                        No Categories Found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>

          <li>
            <Link to="/about" className="hover:text-indigo-400 transition-all duration-200">
              About
            </Link>
          </li>

          <li>
            <Link to="/contact" className="hover:text-indigo-400 transition-all duration-200">
              Contact
            </Link>
          </li>
        </ul>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 rounded-full bg-richblack-800 text-yellow-100 hover:bg-richblack-700 transition-colors border border-richblack-700 cursor-pointer"
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* REAL-TIME NOTIFICATION BELL */}
          <NotificationBell />

          {/* Unauthenticated Login/Signup */}
          {token === null && (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <button className="rounded-full bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition-all duration-200 shadow-[0_2px_10px_rgba(79,70,229,0.3)]">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-full bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition-all duration-200 shadow-[0_2px_10px_rgba(79,70,229,0.3)]">
                  Signup
                </button>
              </Link>
            </div>
          )}

          {/* Authenticated User Profile Dropdown */}
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
                  className="aspect-square w-[34px] rounded-full object-cover ring-2 ring-indigo-500/80 hover:ring-indigo-400 transition-all"
                />
              </button>

              {/* Exact Screenshot Styled My Account Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#161B22] border border-[#262C36] text-[#E6EDF3] shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  <div className="px-4 py-2 border-b border-[#262C36] mb-1">
                    <h3 className="font-semibold text-sm text-white">My Account</h3>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/dashboard/my-profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C9D1D9] hover:bg-[#21262D] hover:text-white transition-colors"
                    >
                      <VscDashboard className="text-base text-[#8B949E]" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard/enrolled-courses"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C9D1D9] hover:bg-[#21262D] hover:text-white transition-colors"
                    >
                      <VscBook className="text-base text-[#8B949E]" />
                      <span>Courses</span>
                    </Link>

                    {user && user?.account_type === "Student" && (
                      <Link
                        to="/dashboard/cart"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-[#C9D1D9] hover:bg-[#21262D] hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <AiOutlineShoppingCart className="text-base text-[#8B949E]" />
                          <span>Cart</span>
                        </div>
                        {totalItems > 0 && (
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                    )}

                    <Link
                      to="/dashboard/my-profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C9D1D9] hover:bg-[#21262D] hover:text-white transition-colors"
                    >
                      <VscAccount className="text-base text-[#8B949E]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C9D1D9] hover:bg-[#21262D] hover:text-white transition-colors"
                    >
                      <VscGear className="text-base text-[#8B949E]" />
                      <span>Account</span>
                    </Link>

                    <Link
                      to="/dashboard/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C9D1D9] hover:bg-[#21262D] hover:text-white transition-colors"
                    >
                      <VscBell className="text-base text-[#8B949E]" />
                      <span>Notifications</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#262C36] mt-1.5 pt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        dispatch(logout(navigate));
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#C9D1D9] hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
                    >
                      <VscSignOut className="text-base text-[#8B949E]" />
                      <span>Logout</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
