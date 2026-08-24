import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  VscAccount,
  VscDashboard,
  VscMortarBoard,
  VscBook,
  VscBell,
  VscQuestion,
  VscGraph,
  VscVm,
  VscAdd,
  VscSettingsGear,
  VscSignOut,
} from 'react-icons/vsc';
import {
  FiBookOpen,
  FiUsers,
  FiCreditCard,
  FiStar,
  FiTrendingUp,
  FiPlus,
  FiFilm,
  FiArrowRight,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { getInstructorData } from '../services/operations/profileAPI';
import { logout } from '../services/operations/authAPI';
import ConfirmationModal from '../components/Common/ConfirmationModal';

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [coursesData, setCoursesData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [activeTab, setActiveTab] = useState('COURSES');
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const apiRes = await getInstructorData(token);
      if (apiRes?.success) {
        setCoursesData(apiRes.data || []);
        setStatsData(apiRes.stats || null);
      } else {
        setCoursesData([]);
        setStatsData(null);
      }
      setLoading(false);
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // Instructor Name
  const instructorName = user?.firstName || user?.first_name || 'Instructor';

  // Stats calculation fallback
  const totalCourses = statsData?.totalCourses ?? coursesData.length;
  const totalStudents = statsData?.totalStudents ?? coursesData.reduce((acc, c) => acc + (c.totalStudentsEnrolled || 0), 0);
  const totalEarnings = statsData?.totalEarnings ?? coursesData.reduce((acc, c) => acc + (c.totalAmountGenerated || 0), 0);
  const averageRating = statsData?.averageRating ?? (
    coursesData.length > 0
      ? (coursesData.reduce((acc, c) => acc + (c.averageRating || 0), 0) / coursesData.length).toFixed(1)
      : 0
  );

  // Dynamic Deltas
  const courseDelta = statsData?.courseDelta;
  const studentDelta = statsData?.studentDelta;
  const earningsDelta = statsData?.earningsDelta;

  // Sidebar Links Structure matching reference
  const sidebarNavItems = [
    { label: 'My Profile', path: '/dashboard/my-profile', icon: <VscAccount size={18} /> },
    { label: 'Dashboard', path: '/dashboard/global', icon: <VscDashboard size={18} /> },
    { label: 'Your Courses', path: '/dashboard/enrolled-courses', icon: <VscMortarBoard size={18} /> },
    { label: 'Buy Courses', path: '/dashboard/buy-courses', icon: <VscBook size={18} /> },
    { label: 'Notifications', path: '/dashboard/notifications', icon: <VscBell size={18} /> },
    { sectionHeader: 'INSTRUCTOR' },
    { label: 'Instructor Guide', path: '/dashboard/instructor', icon: <VscGraph size={18} />, highlighted: true },
    { label: 'My Courses', path: '/dashboard/my-courses', icon: <VscVm size={18} /> },
    { label: 'Add Content', path: '/dashboard/add-course', icon: <VscAdd size={18} /> },
  ];

  const sidebarBottomItems = [
    { label: 'Settings', path: '/dashboard/settings', icon: <VscSettingsGear size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070913]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white font-['Inter',sans-serif] selection:bg-purple-500 selection:text-white">
      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        
        {/* 1. HEADER BANNER WITH GRADIENT */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#120f26] via-[#1a1236] to-[#0c0e1a] border border-purple-900/30 p-6 md:p-8 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-purple-400">{instructorName}!</span> 👋
            </h1>
            <p className="text-xs md:text-sm text-purple-200/70 leading-relaxed">
              Here's what's happening with your courses today.
            </p>
          </div>

          {/* LAPTOP / GRADUATION GRAPHIC ILLUSTRATION */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center opacity-80 pointer-events-none">
            <div className="relative w-48 h-28 bg-[#181134] rounded-xl border border-purple-500/30 p-3 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center gap-2 border-b border-purple-900/40 pb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div className="w-16 h-1.5 rounded-full bg-purple-900/60" />
              </div>
              <div className="flex items-end justify-between px-2 gap-1.5">
                <div className="w-3 bg-purple-600/40 h-8 rounded-t" />
                <div className="w-3 bg-purple-500/70 h-12 rounded-t" />
                <div className="w-3 bg-purple-400 h-16 rounded-t shadow-lg shadow-purple-500/50" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg border border-purple-400/30 rotate-12">
                🎓
              </div>
            </div>
          </div>
        </div>

        {/* 3. STATISTICS CARDS (4 COLUMNS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* CARD 1: TOTAL COURSES */}
          <div className="bg-[#0c0e1a] border border-purple-900/30 rounded-2xl p-5 shadow-xl hover:border-purple-500/40 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <FiBookOpen size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">{totalCourses}</h3>
                <p className="text-xs text-purple-300/70 font-medium">Total Courses</p>
              </div>
            </div>
            {courseDelta && (
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-3 pl-1">
                <span>↑</span> {courseDelta}
              </p>
            )}
          </div>

          {/* CARD 2: TOTAL STUDENTS */}
          <div className="bg-[#0c0e1a] border border-purple-900/30 rounded-2xl p-5 shadow-xl hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <FiUsers size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">{totalStudents.toLocaleString()}</h3>
                <p className="text-xs text-purple-300/70 font-medium">Total Students</p>
              </div>
            </div>
            {studentDelta && (
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-3 pl-1">
                <span>↑</span> {studentDelta}
              </p>
            )}
          </div>

          {/* CARD 3: TOTAL EARNINGS */}
          <div className="bg-[#0c0e1a] border border-purple-900/30 rounded-2xl p-5 shadow-xl hover:border-amber-500/40 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <FiCreditCard size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">₹{totalEarnings.toLocaleString()}</h3>
                <p className="text-xs text-purple-300/70 font-medium">Total Earnings</p>
              </div>
            </div>
            {earningsDelta && (
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-3 pl-1">
                <span>↑</span> {earningsDelta}
              </p>
            )}
          </div>

          {/* CARD 4: AVERAGE RATING */}
          <div className="bg-[#0c0e1a] border border-purple-900/30 rounded-2xl p-5 shadow-xl hover:border-pink-500/40 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <FiStar size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">
                  {averageRating > 0 ? averageRating : 'No ratings'}
                </h3>
                <p className="text-xs text-purple-300/70 font-medium">Avg. Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5 & 8. COURSE PERFORMANCE CARD AND CREATOR PROGRAM SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLS: COURSE PERFORMANCE TABS CARD */}
          <div className="lg:col-span-2 bg-[#0c0e1a] border border-purple-900/30 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Course Performance
              </h2>
              <button
                onClick={() => navigate('/dashboard/add-course')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/40 transition-all"
              >
                <FiPlus size={16} /> New Course
              </button>
            </div>

            {/* PERFORMANCE NAVIGATION TABS */}
            <div className="flex items-center gap-6 border-b border-purple-900/30 overflow-x-auto pb-1 text-xs select-none">
              {['COURSES', 'STUDENTS', 'EARNINGS', 'REVIEWS', 'STATUS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-extrabold uppercase tracking-wider transition-all relative ${
                    activeTab === tab
                      ? 'text-purple-400 border-b-2 border-purple-500'
                      : 'text-purple-300/60 hover:text-purple-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT RENDERING */}
            <div className="pt-2">
              {coursesData.length === 0 ? (
                /* EMPTY STATE MATCHING SPECIFICATION */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400/60">
                    <FiFilm size={26} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-purple-200">
                      No performance data available yet.
                    </p>
                    <p className="text-xs text-purple-400/60">
                      Create your first course and start teaching!
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/add-course')}
                    className="px-5 py-2.5 border border-purple-500/40 hover:bg-purple-600/20 text-purple-300 text-xs font-bold rounded-xl transition"
                  >
                    Create New Course
                  </button>
                </div>
              ) : (
                /* DYNAMIC DATA TABLE FOR ACTIVE TAB */
                <div className="overflow-x-auto">
                  {activeTab === 'COURSES' && (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-purple-900/30 text-purple-300/70 text-[11px] font-bold uppercase tracking-wider">
                          <th className="pb-3">Course</th>
                          <th className="pb-3 text-center">Students</th>
                          <th className="pb-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-900/20 text-xs">
                        {coursesData.map((c) => (
                          <tr key={c._id || c.id} className="hover:bg-purple-950/20 transition-colors">
                            <td className="py-3.5 pr-4 flex items-center gap-3">
                              {c.thumbnail ? (
                                <img src={c.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-purple-900/40 shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                                  {c.courseName?.[0] || 'C'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-white line-clamp-1">{c.courseName}</p>
                                <p className="text-[10px] text-purple-400/60 line-clamp-1">{c.courseDescription}</p>
                              </div>
                            </td>
                            <td className="py-3.5 text-center font-semibold text-purple-200">{c.totalStudentsEnrolled}</td>
                            <td className="py-3.5 text-right font-extrabold text-emerald-400">₹{c.totalAmountGenerated}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'STUDENTS' && (
                    <div className="space-y-3">
                      {coursesData.map((c) => (
                        <div key={c._id || c.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-900/20 text-xs">
                          <span className="font-semibold text-purple-200 truncate max-w-xs">{c.courseName}</span>
                          <span className="font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            {c.totalStudentsEnrolled} Enrolled
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'EARNINGS' && (
                    <div className="space-y-3">
                      {coursesData.map((c) => (
                        <div key={c._id || c.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-900/20 text-xs">
                          <div>
                            <p className="font-semibold text-purple-200 truncate max-w-xs">{c.courseName}</p>
                            <p className="text-[10px] text-purple-400/60">Price: ₹{c.price}</p>
                          </div>
                          <span className="font-bold text-amber-400 text-sm">
                            ₹{c.totalAmountGenerated}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'REVIEWS' && (
                    <div className="space-y-3">
                      {coursesData.map((c) => (
                        <div key={c._id || c.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-900/20 text-xs">
                          <span className="font-semibold text-purple-200 truncate max-w-xs">{c.courseName}</span>
                          <div className="flex items-center gap-1 text-pink-400 font-bold">
                            <FiStar className="fill-pink-400" />
                            <span>{c.averageRating > 0 ? c.averageRating : 'No reviews'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'STATUS' && (
                    <div className="space-y-3">
                      {coursesData.map((c) => (
                        <div key={c._id || c.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-900/20 text-xs">
                          <span className="font-semibold text-purple-200 truncate max-w-xs">{c.courseName}</span>
                          <span className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                            c.status === 'Published'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {c.status || 'Draft'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COL: CREATOR PROGRAM CARD MATCHING REFERENCE SCREENSHOT */}
          <div className="bg-gradient-to-br from-[#1b1238] via-[#231548] to-[#120b28] border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 text-xl shadow-inner">
                🎬
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Creator Program
                </h3>
                <p className="text-xs text-purple-200/70 leading-relaxed">
                  Join our creator program and unlock exclusive benefits, analytics, and higher payout rates.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/add-course')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-purple-950 font-bold text-xs rounded-xl hover:bg-purple-100 hover:scale-[1.02] transition-all shadow-xl relative z-10"
            >
              Explore More <FiArrowRight size={14} />
            </button>
          </div>

        </div>

      </main>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default InstructorDashboard;
