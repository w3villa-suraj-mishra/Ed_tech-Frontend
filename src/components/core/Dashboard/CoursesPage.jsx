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

  // Derived Dynamic Dashboard Statistics
  const totalEnrolled = enrolledCourses.length;
  const totalCompletedLessons = enrolledCourses.reduce((acc, course) => {
    return acc + (course.completedVideos?.length || 0);
  }, 0);
  const completedCoursesList = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) === 100
  );
  const inProgressCoursesList = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) < 100
  );
  const certificatesEarned = completedCoursesList.length;
  const totalHoursLearned = (totalCompletedLessons * 0.25).toFixed(1);
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
          <div className="bg-[#0e111f] border border-purple-500/20 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "grid" ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "text-richblack-400 hover:text-white"
              }`}
              title="Grid View"
            >
              田
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "list" ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "text-richblack-400 hover:text-white"
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
            className="bg-[#0e111f] border border-purple-500/20 text-xs font-semibold text-richblack-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition-colors"
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
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
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
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
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
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-emerald-900/30 text-emerald-400 flex items-center justify-center text-base">
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
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
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
                  ? "text-purple-400"
                  : "text-richblack-400 hover:text-white"
              }`}
            >
              {tab.label}
              {activeSubTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
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
            className="w-full sm:w-64 bg-[#0e111f] border border-purple-500/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
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
            const isEnrolled = enrolledCourses.some((c) => (c._id || c.id) === courseId);

            return (
              <div
                key={courseId}
                className="bg-[#0e111f] border border-purple-500/20 hover:border-purple-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.08)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative group"
              >
                {/* Course Thumbnail & Details Left Column */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="relative aspect-video w-full sm:w-44 rounded-xl overflow-hidden bg-purple-900/30 border border-purple-500/20 shrink-0">
                    <img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-purple-900/20 group-hover:opacity-0 transition-opacity" />
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-extrabold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      {progressPct === 100 ? "COMPLETED" : "IN PROGRESS"}
                    </span>

                    <h3 className="font-bold text-base text-white truncate max-w-full">
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
                    <div className="flex items-center justify-between md:justify-end gap-2 text-xs font-bold text-purple-400">
                      <span>{progressPct}% Complete</span>
                    </div>
                    <div className="w-full bg-[#070913] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-richblack-400 font-medium block">
                      {completedCount} / {totalLecturesCount} lessons
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isEnrolled ? (
                      <button
                        onClick={() => navigate(`/s/courses/${courseId}/take`)}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                      >
                        <span>Continue Learning</span>
                        <VscPlay className="text-[10px]" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (token) {
                            dispatch(addToCart(course));
                          } else {
                            navigate('/login');
                          }
                        }}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      >
                        <span>Add to Cart</span>
                      </button>
                    )}

                    {/* Three Dots Options Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === courseId ? null : courseId)}
                        className="p-2.5 rounded-xl bg-[#070913] border border-purple-500/20 text-richblack-400 hover:text-white transition-colors"
                      >
                        <VscEllipsis />
                      </button>

                      {openMenuId === courseId && (
                        <div className="absolute right-0 bottom-full mb-2 w-44 bg-[#0e111f] border border-purple-500/30 rounded-xl p-1.5 shadow-2xl z-20 space-y-1">
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              navigate(`/courses/${courseId}`);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-richblack-200 hover:text-white hover:bg-purple-600/20 rounded-lg font-medium"
                          >
                            View Details
                          </button>
                          {isEnrolled && (
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/s/courses/${courseId}/certificate`);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-600/20 rounded-lg font-medium"
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
        /* EMPTY STATE */
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-12 text-center text-richblack-300 space-y-3 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
          <VscBook className="text-4xl mx-auto text-purple-400/50" />
          <h3 className="text-base font-bold text-white">No courses found</h3>
          <p className="text-xs text-richblack-400 max-w-sm mx-auto">
            {activeSubTab === "completed"
              ? "You haven't completed any courses yet. Keep learning!"
              : "You haven't enrolled in any courses yet."}
          </p>
          <button
            onClick={() => setActiveSubTab("buy")}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] inline-block mt-2"
          >
            Explore Courses
          </button>
        </div>
      )}

      {/* 5. BOTTOM RECOMMENDED CTA BANNER */}
      <div className="bg-gradient-to-r from-purple-900/50 via-[#0e111f] to-indigo-900/50 border border-purple-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
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
          className="px-6 py-3 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-700 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] text-center shrink-0 flex items-center justify-center gap-2"
        >
          <span>Explore Courses</span>
          <VscArrowRight />
        </button>
      </div>

    </div>
  );
};

export default CoursesPage;
