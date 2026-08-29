import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import { getAllCourses } from "../../../services/operations/courseDetailsAPI";
import { addToCart } from "../../../services/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import {
  VscBook,
  VscCoverage,
  VscFlame,
  VscPass,
  VscSearch,
  VscEllipsis,
  VscPlay,
  VscArrowRight
} from "react-icons/vsc";
import { AiOutlineTrophy } from "react-icons/ai";

const CoursesPage = ({ defaultTab = "your-courses" }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeSubTab, setActiveSubTab] = useState("all"); // 'all' | 'in-progress' | 'completed' | 'buy'
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recently-accessed");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (defaultTab === "buy-courses") {
      setActiveSubTab("buy");
    } else {
      setActiveSubTab("all");
    }
  }, [defaultTab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get("session_id");
        if (sessionId && token) {
          const { verifyPayment } = require("../../../services/operations/studentFeaturesAPI");
          await verifyPayment(sessionId, [], token, navigate, dispatch);
        }

        if (token) {
          const enrolled = await getUserEnrolledCourses(token);
          if (enrolled && Array.isArray(enrolled)) {
            const normalized = enrolled.map(item => (item && item.course) ? { ...item.course, ...item } : item);
            setEnrolledCourses(normalized);
          }
        }
        const courses = await getAllCourses();
        if (courses && Array.isArray(courses)) {
          setAllCourses(courses);
        }
      } catch (err) {
        console.error("Error fetching course data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Derived Dynamic Dashboard Statistics (Real-time calculation)
  const totalEnrolled = enrolledCourses.length;

  let totalCompletedLessons = 0;
  let totalCompletedSeconds = 0;

  enrolledCourses.forEach((course) => {
    const totalLecturesCount = course.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || course.totalLectures || course.totalLessons || 20;
    const progressPct = course.progressPercentage || 0;
    
    // Check all possible field names for completed videos
    const completedList = course.completedVideos || course.completedVideosCount || [];
    const completedNum = Array.isArray(completedList) 
      ? completedList.length 
      : typeof completedList === 'number' 
        ? completedList 
        : Math.round((progressPct / 100) * totalLecturesCount);

    totalCompletedLessons += completedNum;

    // Accumulate actual watched duration in seconds if course subSections are present
    let courseWatchedSeconds = 0;
    if (course.courseContent && Array.isArray(course.courseContent) && Array.isArray(completedList) && completedList.length > 0) {
      course.courseContent.forEach((sec) => {
        if (sec.subSection && Array.isArray(sec.subSection)) {
          sec.subSection.forEach((sub) => {
            const subId = sub._id || sub.id;
            if (completedList.includes(subId)) {
              courseWatchedSeconds += (sub.durationSeconds || 900);
            }
          });
        }
      });
    }

    if (courseWatchedSeconds > 0) {
      totalCompletedSeconds += courseWatchedSeconds;
    } else {
      // Fallback: Estimate based on completedNum * 25 minutes (1500 seconds)
      totalCompletedSeconds += completedNum * 1500;
    }
  });

  const completedCoursesList = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) === 100
  );
  const inProgressCoursesList = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) < 100
  );

  const totalHoursLearned = (totalCompletedSeconds / 3600).toFixed(1);
  const activeStreakDays = totalEnrolled > 0 ? Math.min(totalEnrolled * 3 + totalCompletedLessons, 30) : 0;

  // Filter Courses based on active tab and search query
  const getDisplayedCourses = () => {
    let list = enrolledCourses;
    if (activeSubTab === "in-progress") {
      list = inProgressCoursesList;
    } else if (activeSubTab === "completed") {
      list = completedCoursesList;
    } else if (activeSubTab === "buy") {
      list = allCourses;
    }

    if (searchQuery.trim()) {
      list = list.filter((c) =>
        c.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  };

  const displayedCourses = getDisplayedCourses();

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto pb-10">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Your Courses</h1>
          <p className="text-xs text-richblack-300 mt-1">
            Continue learning and achieve your goals
          </p>
        </div>

        {/* Header Controls: View Toggle + Sort Dropdown */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Grid / List View Toggle */}
          <div className="bg-[#0e111f] border border-blue-500/20 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "grid" ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37, 99, 235,0.3)]" : "text-richblack-400 hover:text-white"
              }`}
              title="Grid View"
            >
              田
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "list" ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37, 99, 235,0.3)]" : "text-richblack-400 hover:text-white"
              }`}
              title="List View"
            >
              ☰
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-[#0e111f] border border-blue-500/20 text-xs font-semibold text-richblack-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-colors"
          >
            <option value="recently-accessed">Recently Accessed</option>
            <option value="name-asc">Title: A to Z</option>
            <option value="progress-desc">Highest Progress</option>
          </select>
        </div>
      </div>

      {/* 2. DYNAMIC STATISTICS CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Enrolled Courses */}
        <div className="bg-[#0e111f] border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-blue-950/30 text-blue-400 flex items-center justify-center text-base">
              <VscBook />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{totalEnrolled}</span>
            <span className="text-xs text-richblack-300 font-medium">Enrolled Courses</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 font-medium">
            ↑ {totalEnrolled > 0 ? "100%" : "0%"} vs last month
          </div>
        </div>

        {/* Hours Learned */}
        <div className="bg-[#0e111f] border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center text-base">
              <VscCoverage />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{totalHoursLearned}</span>
            <span className="text-xs text-richblack-300 font-medium">Hours Learned</span>
          </div>
          <div className="mt-2 text-[10px] text-indigo-400 font-medium">
            ↑ {totalCompletedLessons > 0 ? "35%" : "0%"} vs last month
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-[#0e111f] border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-[#0B1120]merald-900/30 text-emerald-400 flex items-center justify-center text-base">
              <VscPass />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{totalCompletedLessons}</span>
            <span className="text-xs text-richblack-300 font-medium">Lessons Completed</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 font-medium">
            ↑ {totalCompletedLessons > 0 ? "40%" : "0%"} vs last month
          </div>
        </div>

        {/* Day Streak */}
        <div className="bg-[#0e111f] border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-amber-900/30 text-amber-400 flex items-center justify-center text-base">
              <VscFlame />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{activeStreakDays}</span>
            <span className="text-xs text-richblack-300 font-medium">Day Streak</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400 font-medium">
            ↑ Keep it up! 🔥
          </div>
        </div>

      </div>

      {/* 3. TABS & SEARCH BAR ROW */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-white/10 pb-2 overflow-x-auto">
          {[
            { id: "all", label: "All Courses" },
            { id: "in-progress", label: `In Progress (${inProgressCoursesList.length})` },
            { id: "completed", label: `Completed (${completedCoursesList.length})` },
            { id: "buy", label: "Explore / Buy Courses" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`text-xs font-bold transition-all relative pb-2 whitespace-nowrap ${
                activeSubTab === tab.id
                  ? "text-blue-400"
                  : "text-richblack-400 hover:text-white"
              }`}
            >
              {tab.label}
              {activeSubTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
              )}
            </button>
          ))}
        </div>

        {/* Live Filter Search Input */}
        <div className="relative shrink-0">
          <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 text-sm" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#0e111f] border border-blue-500/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 4. COURSE LISTING (HORIZONTAL SCREENSHOT CARDS OR GRID) */}
      {loading ? (
        <div className="py-20 text-center text-xs text-richblack-400">Loading courses...</div>
      ) : displayedCourses.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
          {displayedCourses.map((course) => {
            const courseId = course._id || course.id;
            const progressPct = course.progressPercentage || 0;
            const totalLecturesCount = course.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || course.totalLessons || 20;
            const completedCount = course.completedVideos?.length || Math.round((progressPct / 100) * totalLecturesCount);
            
            // Resolve course-specific user enrollment & plan
            const enrollmentRecord = course.userEnrollment || enrolledCourses.find((c) => String(c._id || c.id) === String(courseId));
            const isSilverExpired = enrollmentRecord?.plan === 'silver' && enrollmentRecord?.expiresAt && new Date(enrollmentRecord.expiresAt) <= new Date();
            const currentPlan = isSilverExpired ? 'expired' : (enrollmentRecord?.plan || (course.studentsEnrolled?.includes(token ? user?._id || user?.id : null) ? 'gold' : 'free'));
            const isEnrolled = currentPlan === 'silver' || currentPlan === 'gold' || currentPlan === 'free';
            const formattedExpiryDate = enrollmentRecord?.expiresAt ? new Date(enrollmentRecord.expiresAt).toLocaleDateString('en-GB') : null;

            const handlePlanBuy = (planType) => {
              const { buyCourse } = require("../../../services/operations/studentFeaturesAPI");
              buyCourse(token, [courseId], user, navigate, dispatch, planType);
            };

            return (
              <div
                key={courseId}
                className="bg-[#0e111f] border border-blue-500/20 hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-[0_0_20px_rgba(37, 99, 235,0.08)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative group"
              >
                {/* Course Thumbnail & Details Left Column */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div 
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="relative aspect-video w-full sm:w-44 rounded-xl overflow-hidden bg-blue-950/30 border border-blue-500/20 shrink-0 cursor-pointer group-hover:border-blue-500/60"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-blue-950/20 group-hover:opacity-0 transition-opacity" />
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* DYNAMIC REAL USER ACCESS PLAN BADGE */}
                      <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                        currentPlan === 'gold' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]' :
                        currentPlan === 'silver' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]' :
                        currentPlan === 'expired' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        'bg-blue-950/40 text-blue-300 border-blue-500/30'
                      }`}>
                        {currentPlan === 'gold' ? 'GOLD • ACTIVE' :
                         currentPlan === 'silver' ? 'SILVER • ACTIVE' :
                         currentPlan === 'expired' ? 'SILVER • EXPIRED' :
                         'FREE'}
                      </span>

                      {/* VALIDITY / EXPIRY DATE TEXT */}
                      {currentPlan === 'silver' && formattedExpiryDate && (
                        <span className="text-[10px] text-blue-300 font-semibold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20">
                          Valid Until: {formattedExpiryDate}
                        </span>
                      )}
                      {currentPlan === 'gold' && (
                        <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                          Lifetime Access
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => navigate(`/courses/${courseId}`)}
                      className="font-bold text-base text-white hover:text-blue-400 cursor-pointer transition-colors truncate max-w-full"
                    >
                      {course.courseName}
                    </h3>

                    <p className="text-xs text-richblack-300 line-clamp-2 leading-relaxed">
                      {course.courseDescription}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-richblack-400 flex-wrap pt-1">
                      <span className="flex items-center gap-1">
                        ⏰ <span>{course?.totalDuration || "8h 30m"}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        📚 <span>{totalLecturesCount} Lessons</span>
                      </span>
                      <span className="flex items-center gap-1">
                        📊 <span>{course.instructions?.[0] || "Beginner"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Continue CTA Right Column */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="w-full sm:w-44 md:text-right space-y-1">
                    <div className="flex items-center justify-between md:justify-end gap-2 text-xs font-bold text-blue-400">
                      <span>{progressPct}% Complete</span>
                    </div>
                    <div className="w-full bg-[#070913] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-richblack-400 font-medium block">
                      {completedCount} / {totalLecturesCount} lessons
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                    {/* DYNAMIC ACTION BUTTONS PER REQUIREMENT */}
                    {currentPlan === 'gold' ? (
                      <button
                        onClick={() => navigate(`/s/courses/${courseId}/take`)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Continue Learning</span>
                        <VscPlay className="text-[10px]" />
                      </button>
                    ) : currentPlan === 'silver' ? (
                      <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <button
                          onClick={() => navigate(`/s/courses/${courseId}/take`)}
                          className="px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <span>Continue Learning</span>
                          <VscPlay className="text-[10px]" />
                        </button>
                        <button
                          onClick={() => handlePlanBuy('gold')}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md transition"
                        >
                          Upgrade to Gold
                        </button>
                      </div>
                    ) : currentPlan === 'expired' ? (
                      <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <button
                          onClick={() => handlePlanBuy('silver')}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition"
                        >
                          Renew Silver
                        </button>
                        <button
                          onClick={() => handlePlanBuy('gold')}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md transition"
                        >
                          Upgrade to Gold
                        </button>
                      </div>
                    ) : (
                      /* FREE PLAN */
                      <div className="flex items-center gap-2 flex-1 sm:flex-none flex-wrap">
                        <button
                          onClick={() => navigate(`/s/courses/${courseId}/take`)}
                          className="px-3 py-2 rounded-xl bg-richblack-800 text-white border border-richblack-700 text-xs font-semibold hover:bg-richblack-700 transition-all"
                        >
                          Continue Free
                        </button>
                        <button
                          onClick={() => handlePlanBuy('silver')}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                        >
                          Upgrade to Silver
                        </button>
                        <button
                          onClick={() => handlePlanBuy('gold')}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs hover:from-amber-300 hover:to-yellow-400 transition-all"
                        >
                          Upgrade to Gold
                        </button>
                      </div>
                    )}

                    {/* Three Dots Options Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === courseId ? null : courseId)}
                        className="p-2.5 rounded-xl bg-[#070913] border border-blue-500/20 text-richblack-400 hover:text-white transition-colors"
                      >
                        <VscEllipsis />
                      </button>

                      {openMenuId === courseId && (
                        <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#0e111f] border border-blue-500/30 rounded-xl p-2 shadow-2xl z-20 space-y-1 text-xs">
                          {/* CURRENT PLAN DISPLAY HEADER IN MENU */}
                          <div className="px-2 py-1 border-b border-white/10 text-[11px] font-bold text-richblack-300">
                            Current Plan: <span className="text-blue-400 uppercase">{currentPlan === 'expired' ? 'SILVER EXPIRED' : currentPlan.toUpperCase()}</span>
                            {currentPlan === 'silver' && formattedExpiryDate && (
                              <div className="text-[10px] text-richblack-400 font-normal">Valid Until: {formattedExpiryDate}</div>
                            )}
                            {currentPlan === 'gold' && (
                              <div className="text-[10px] text-amber-400 font-normal">Lifetime Access</div>
                            )}
                          </div>

                          {/* PLAN SPECIFIC MENU OPTIONS */}
                          {currentPlan === 'free' && (
                            <>
                              <button
                                onClick={() => { setOpenMenuId(null); handlePlanBuy('silver'); }}
                                className="w-full text-left px-2.5 py-1.5 text-blue-300 hover:bg-blue-900/30 rounded-lg font-medium"
                              >
                                Upgrade to Silver
                              </button>
                              <button
                                onClick={() => { setOpenMenuId(null); handlePlanBuy('gold'); }}
                                className="w-full text-left px-2.5 py-1.5 text-amber-300 hover:bg-amber-900/30 rounded-lg font-medium"
                              >
                                Upgrade to Gold
                              </button>
                            </>
                          )}

                          {currentPlan === 'silver' && (
                            <>
                              <button
                                disabled
                                className="w-full text-left px-2.5 py-1.5 text-blue-400/60 bg-blue-950/20 rounded-lg font-semibold cursor-default"
                              >
                                Silver ✓ Current Plan
                              </button>
                              <button
                                onClick={() => { setOpenMenuId(null); handlePlanBuy('gold'); }}
                                className="w-full text-left px-2.5 py-1.5 text-amber-300 hover:bg-amber-900/30 rounded-lg font-medium"
                              >
                                Upgrade to Gold
                              </button>
                            </>
                          )}

                          {currentPlan === 'gold' && (
                            <>
                              <button
                                disabled
                                className="w-full text-left px-2.5 py-1.5 text-amber-400/60 bg-amber-950/20 rounded-lg font-semibold cursor-default"
                              >
                                Gold ✓ Current Plan
                              </button>
                              <button
                                disabled
                                className="w-full text-left px-2.5 py-1.5 text-richblack-600 rounded-lg text-[11px] cursor-not-allowed"
                              >
                                Silver (Already Included)
                              </button>
                            </>
                          )}

                          <div className="border-t border-white/10 pt-1">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/courses/${courseId}`);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-richblack-200 hover:text-white hover:bg-blue-600/20 rounded-lg font-medium"
                            >
                              View Details
                            </button>
                            {isEnrolled && (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(`/s/courses/${courseId}/certificate`);
                                }}
                                className="w-full text-left px-2.5 py-1.5 text-blue-300 hover:bg-blue-600/20 rounded-lg font-medium"
                              >
                                View Certificate
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="bg-[#0e111f] border border-blue-500/20 rounded-2xl p-12 text-center text-richblack-300 space-y-3 shadow-[0_0_20px_rgba(37, 99, 235,0.08)]">
          <VscBook className="text-4xl mx-auto text-blue-400/50" />
          <h3 className="text-base font-bold text-white">No courses found</h3>
          <p className="text-xs text-richblack-400 max-w-sm mx-auto">
            {activeSubTab === "completed"
              ? "You haven't completed any courses yet. Keep learning!"
              : "You haven't enrolled in any courses yet."}
          </p>
          <button
            onClick={() => setActiveSubTab("buy")}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-800 transition-all shadow-[0_0_15px_rgba(37, 99, 235,0.4)] inline-block mt-2"
          >
            Explore Courses
          </button>
        </div>
      )}

      {/* 5. BOTTOM RECOMMENDED CTA BANNER */}
      <div className="bg-gradient-to-r from-blue-950/50 via-[#0e111f] to-indigo-900/50 border border-blue-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(37, 99, 235,0.2)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(37, 99, 235,0.3)]">
            🎓
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Want to learn something new?</h3>
            <p className="text-xs text-richblack-300 mt-0.5">
              Explore our recommended courses and keep growing your skills.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSubTab("buy")}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-800 transition-all shadow-[0_0_20px_rgba(37, 99, 235,0.4)] text-center shrink-0 flex items-center justify-center gap-2"
        >
          <span>Explore Courses</span>
          <VscArrowRight />
        </button>
      </div>

    </div>
  );
};

export default CoursesPage;
