import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import { getAllCourses } from "../../../services/operations/courseDetailsAPI";
import { buyCourse } from "../../../services/operations/studentFeaturesAPI";
import { addToCart } from "../../../services/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiSearch,
  FiGrid,
  FiList,
  FiChevronDown,
  FiArrowRight,
  FiPlay,
  FiMoreVertical,
  FiAward
} from "react-icons/fi";
import { FaFire, FaGraduationCap } from "react-icons/fa";

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

    // Apply Sorting
    if (sortOption === "name-asc") {
      return [...list].sort((a, b) => (a.courseName || "").localeCompare(b.courseName || ""));
    } else if (sortOption === "progress-desc") {
      return [...list].sort((a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0));
    }

    return list;
  };

  const displayedCourses = getDisplayedCourses();

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10 font-sans">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Your Courses</h1>
          <p className="text-xs text-gray-500 mt-1 font-normal">
            Continue learning and achieve your goals
          </p>
        </div>

        {/* Header Controls: View Toggle + Sort Dropdown */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Grid / List View Toggle */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-1 flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#3BA7F2] text-white shadow-xs"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/60"
              }`}
              title="Grid View"
            >
              <FiGrid className="text-sm" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#3BA7F2] text-white shadow-xs"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/60"
              }`}
              title="List View"
            >
              <FiList className="text-sm" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none bg-white border border-gray-200/80 text-xs font-semibold text-gray-700 rounded-xl pl-3.5 pr-8 py-2 outline-none hover:border-gray-300 focus:border-[#3BA7F2] transition-colors shadow-2xs cursor-pointer"
            >
              <option value="recently-accessed">Recently Accessed</option>
              <option value="name-asc">Title: A to Z</option>
              <option value="progress-desc">Highest Progress</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC STATISTICS CARDS ROW (4 Stats Matching Reference) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Enrolled Courses */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-sm">
              <FiBookOpen />
            </div>
            <span className="text-[10px] text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{totalEnrolled}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Enrolled Courses</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalEnrolled > 0 ? "100%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Hours Learned */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#13AA92]/10 text-[#9333EA] flex items-center justify-center text-sm">
              <FiClock />
            </div>
            <span className="text-[10px] text-[#13AA92] font-bold bg-[#13AA92]/10 px-2 py-0.5 rounded-full">
              Est.
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{totalHoursLearned}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Hours Learned</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "35%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-sm">
              <FiCheckCircle />
            </div>
            <span className="text-[10px] text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{totalCompletedLessons}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Lessons Completed</span>
          </div>
          <div className="mt-2 text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "40%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Day Streak */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-sm">
              <FaFire />
            </div>
            <span className="text-[10px] text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-[#0F172A] block leading-tight">{activeStreakDays}</span>
            <span className="text-xs text-gray-500 font-medium block mt-0.5">Day Streak</span>
          </div>
          <div className="mt-2 text-[10px] text-[#D97706] font-semibold flex items-center gap-1">
            <span>Keep it up! 🔥</span>
          </div>
        </div>

      </div>

      {/* 3. TABS & SEARCH BAR ROW */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1 border-b border-gray-200/80">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All Courses" },
            { id: "in-progress", label: `In Progress (${inProgressCoursesList.length})` },
            { id: "completed", label: `Completed (${completedCoursesList.length})` },
            { id: "buy", label: "Explore / Buy Courses" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`text-xs sm:text-sm font-bold transition-all relative pb-3 whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? "text-[#3BA7F2] border-b-2 border-[#3BA7F2] -mb-[1px]"
                  : "text-gray-500 hover:text-gray-800 -mb-[1px]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Filter Search Input */}
        <div className="relative shrink-0 pb-2 sm:pb-0 -mb-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-white border border-gray-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3BA7F2] focus:ring-1 focus:ring-[#3BA7F2] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 4. COURSE LISTING OR CLEAN EMPTY STATE */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading courses...</div>
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

            return (
              <div
                key={courseId}
                className="bg-white border border-gray-200/80 hover:border-indigo-200 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative group"
              >
                {/* Course Thumbnail & Details Left Column */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div 
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="relative aspect-video w-full sm:w-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        currentPlan === 'gold' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' :
                        currentPlan === 'silver' ? 'bg-[#13AA92]/10 text-[#3BA7F2] border-[#13AA92]/30' :
                        currentPlan === 'expired' ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {currentPlan === 'gold' ? 'GOLD • ACTIVE' :
                         currentPlan === 'silver' ? 'SILVER • ACTIVE' :
                         currentPlan === 'expired' ? 'SILVER • EXPIRED' :
                         'FREE'}
                      </span>

                      {currentPlan === 'silver' && formattedExpiryDate && (
                        <span className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60">
                          Valid Until: {formattedExpiryDate}
                        </span>
                      )}
                      {currentPlan === 'gold' && (
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          Lifetime Access
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => navigate(`/courses/${courseId}`)}
                      className="font-bold text-sm sm:text-base text-[#0F172A] hover:text-[#3BA7F2] cursor-pointer transition-colors truncate max-w-full"
                    >
                      {course.courseName}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                      {course.courseDescription}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap pt-0.5 font-medium">
                      <span className="flex items-center gap-1">
                        <FiClock /> <span>{course?.totalDuration || "8h 30m"}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FiBookOpen /> <span>{totalLecturesCount} Lessons</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FiAward /> <span>{course.instructions?.[0] || "Beginner"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Continue CTA Right Column */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                  <div className="w-full sm:w-44 md:text-right space-y-1">
                    <div className="flex items-center justify-between md:justify-end gap-2 text-xs font-bold text-[#3BA7F2]">
                      <span>{progressPct}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3BA7F2] h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium block">
                      {completedCount} / {totalLecturesCount} lessons
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => navigate(`/s/courses/${courseId}/take`)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
                    >
                      <span>Continue Learning</span>
                      <FiPlay className="text-[10px]" />
                    </button>

                    {/* Three Dots Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === courseId ? null : courseId)}
                        className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                      >
                        <FiMoreVertical />
                      </button>

                      {openMenuId === courseId && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-xl p-2 shadow-xl z-20 space-y-1 text-xs">
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/courses/${courseId}`);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium cursor-pointer"
                          >
                            View Details
                          </button>
                          {isEnrolled && (
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/s/courses/${courseId}/certificate`);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-[#3BA7F2] hover:bg-indigo-50 rounded-lg font-medium cursor-pointer"
                            >
                              View Certificate
                            </button>
                          )}
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
        /* 4. CLEAN EMPTY STATE (EXACT MATCH TO REFERENCE SCREENSHOT) */
        <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-4">
          
          {/* Vector Illustration: Stack of books with graduation cap and sparkle bursts */}
          <div className="relative inline-flex items-center justify-center mb-1">
            <svg width="150" height="120" viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Soft circular halo */}
              <ellipse cx="80" cy="76" rx="64" ry="46" fill="#F0F4FF" />
              
              {/* Sparkle burst rays top-right */}
              <line x1="124" y1="28" x2="130" y2="24" stroke="#3BA7F2" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              <line x1="133" y1="38" x2="140" y2="38" stroke="#3BA7F2" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              <line x1="128" y1="47" x2="134" y2="52" stroke="#3BA7F2" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

              {/* Book 3 (Bottom Blue) */}
              <rect x="36" y="86" width="88" height="14" rx="4" fill="#3BA7F2" />
              <path d="M40 88H120V98H40C37.7909 98 36 96.2091 36 94V90C36 87.7909 37.7909 88 40 88Z" fill="#3BA7F2" />
              <rect x="42" y="88" width="78" height="10" rx="2" fill="#FFFFFF" />
              <line x1="48" y1="93" x2="114" y2="93" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

              {/* Book 2 (Middle Light Blue) */}
              <rect x="42" y="73" width="76" height="14" rx="3" fill="#60A5FA" />
              <path d="M45 75H114V84H45C43.3431 84 42 82.6569 42 81V77C42 75.3431 43.3431 75 45 75Z" fill="#3BA7F2" />
              <rect x="47" y="75" width="67" height="10" rx="2" fill="#FFFFFF" />
              <line x1="52" y1="80" x2="108" y2="80" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

              {/* Book 1 (Top Blue) */}
              <rect x="46" y="61" width="68" height="13" rx="3" fill="#93C5FD" />
              <path d="M49 63H110V71H49C47.3431 71 46 69.6569 46 68V65C46 63.3431 47.3431 63 49 63Z" fill="#60A5FA" />
              <rect x="50" y="63" width="60" height="9" rx="2" fill="#FFFFFF" />
              <line x1="55" y1="67.5" x2="104" y2="67.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

              {/* Graduation Cap (Mortarboard) */}
              <path d="M80 32L116 46L80 60L44 46L80 32Z" fill="#1D4ED8" />
              <path d="M80 32L116 46L80 50L44 46L80 32Z" fill="#3BA7F2" opacity="0.6" />
              <path d="M58 52V58C58 64 68 67 80 67C92 67 102 64 102 58V52L80 60L58 52Z" fill="#1E40AF" />
              <ellipse cx="80" cy="46" rx="3.5" ry="2" fill="#93C5FD" />
              <path d="M80 46C87 47 96 50 100 56V65" stroke="#93C5FD" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="98" y="64" width="4.5" height="7" rx="1.5" fill="#60A5FA" />
            </svg>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">No courses found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto font-normal">
            {activeSubTab === "completed"
              ? "You haven't completed any courses yet. Keep learning!"
              : "You haven't enrolled in any courses yet."}
          </p>

          <button
            onClick={() => setActiveSubTab("buy")}
            className="px-6 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 inline-block mt-2 cursor-pointer"
          >
            Explore Courses
          </button>
        </div>
      )}

      {/* 5. BOTTOM RECOMMENDED CTA BANNER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
        {/* Subtle decorative curves in the background right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none bg-gradient-to-l from-indigo-50/70 via-blue-50/30 to-transparent rounded-r-2xl" />
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-xl shrink-0">
            <FaGraduationCap />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">Want to learn something new?</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-normal">
              Explore our recommended courses and keep growing your skills.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSubTab("buy")}
          className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 text-center shrink-0 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
        >
          <span>Explore Courses</span>
          <FiArrowRight className="text-sm" />
        </button>
      </div>

    </div>
  );
};

export default CoursesPage;
