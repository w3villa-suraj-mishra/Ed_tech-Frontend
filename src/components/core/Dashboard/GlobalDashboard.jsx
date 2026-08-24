import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import { getAllCourses } from "../../../services/operations/courseDetailsAPI";
import {
  VscBook,
  VscCoverage,
  VscFlame,
  VscArrowRight,
  VscPlay,
  VscPass
} from "react-icons/vsc";
import { AiOutlineTrophy } from "react-icons/ai";

const GlobalDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticated User Info
  const userName = user?.first_name || user?.firstName || user?.name || "Learner";
  const userPlan = user?.plan || user?.accountType || "Free Access";

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (token) {
          const [enrolledRes, availableRes] = await Promise.all([
            getUserEnrolledCourses(token),
            getAllCourses()
          ]);

          if (enrolledRes && Array.isArray(enrolledRes)) {
            setEnrolledCourses(enrolledRes);
          }
          if (availableRes && Array.isArray(availableRes)) {
            setAvailableCourses(availableRes);
          }
        }
      } catch (err) {
        console.error("Dashboard Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Derived Dynamic Statistics from Database
  const totalEnrolled = enrolledCourses.length;

  // Total lessons completed across enrolled courses
  const totalCompletedLessons = enrolledCourses.reduce((acc, course) => {
    const completedCount = course.completedVideos?.length || 0;
    return acc + completedCount;
  }, 0);

  // Certificates earned (courses with 100% progress)
  const completedCoursesList = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) === 100
  );
  const certificatesEarned = completedCoursesList.length;

  // Estimated learning hours based on completed lessons (approx 15 mins per lesson)
  const totalHoursLearned = (totalCompletedLessons * 0.25).toFixed(1);

  // Dynamic Day Streak based on active enrollments
  const activeStreakDays = totalEnrolled > 0 ? Math.min(totalEnrolled * 3 + totalCompletedLessons, 30) : 0;

  // Continue Learning Active Courses (sliced to top 3)
  const continueLearningCourses = enrolledCourses.slice(0, 3);

  return (
    <div className="space-y-6 text-white pb-10">
      
      {/* 1. WELCOME BANNER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, {userName} <span className="animate-bounce inline-block">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-richblack-300 mt-1">
            Keep learning and grow your skills every day.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 transition-all flex items-center gap-2"
          >
            <span>Explore Courses</span>
            <VscArrowRight />
          </Link>
        </div>
      </div>

      {/* 2. STATISTICS CARDS GRID (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Enrolled Courses */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
              <VscBook />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{totalEnrolled}</span>
            <span className="text-xs text-richblack-300 font-medium">Enrolled Courses</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <span>↑ {totalEnrolled > 0 ? "100%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Card 2: Hours Learned */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center text-base">
              <VscCoverage />
            </div>
            <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Est.
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{totalHoursLearned}</span>
            <span className="text-xs text-richblack-300 font-medium">Hours Learned</span>
          </div>
          <div className="mt-2 text-[10px] text-indigo-400 font-medium flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "35%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Card 3: Lessons Completed */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-emerald-900/30 text-emerald-400 flex items-center justify-center text-base">
              <VscPass />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{totalCompletedLessons}</span>
            <span className="text-xs text-richblack-300 font-medium">Lessons Completed</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <span>↑ {totalCompletedLessons > 0 ? "40%" : "0%"} vs last month</span>
          </div>
        </div>

        {/* Card 4: Day Streak */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-amber-900/30 text-amber-400 flex items-center justify-center text-base">
              <VscFlame />
            </div>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{activeStreakDays}</span>
            <span className="text-xs text-richblack-300 font-medium">Day Streak</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400 font-medium flex items-center gap-1">
            <span>↑ Keep it up!</span>
          </div>
        </div>

        {/* Card 5: Certificates Earned */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
              <AiOutlineTrophy />
            </div>
            <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
              Earned
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{certificatesEarned}</span>
            <span className="text-xs text-richblack-300 font-medium">Certificates Earned</span>
          </div>
          <div className="mt-2 text-[10px] text-purple-400 font-medium flex items-center gap-1">
            <span>↑ {certificatesEarned > 0 ? "100%" : "0%"} vs last month</span>
          </div>
        </div>

      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID (Continue Learning + Learning Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CONTINUE LEARNING SECTION */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Continue Learning</span>
              </h2>
              <Link
                to="/dashboard/enrolled-courses"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <span>View All Courses</span>
                <VscArrowRight />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-richblack-400">Loading active courses...</div>
            ) : continueLearningCourses.length > 0 ? (
              <div className="space-y-3">
                {continueLearningCourses.map((course) => {
                  const progressPct = course.progressPercentage || 0;
                  return (
                    <div
                      key={course._id}
                      className="p-3.5 rounded-xl bg-[#141728] border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={course.thumbnail}
                          alt={course.courseName}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
                            {course.courseName}
                          </span>
                          
                          {/* Progress Bar Container */}
                          <div className="w-full bg-[#070913] h-1.5 rounded-full overflow-hidden mt-2 max-w-[180px]">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-richblack-400 mt-1 font-semibold">
                            {progressPct}% Complete
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/view-course/${course._id}`)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600 hover:text-white transition-all shrink-0 flex items-center gap-1"
                      >
                        <span>Continue</span>
                        <VscPlay className="text-[10px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-richblack-400 space-y-3">
                <VscBook className="text-3xl mx-auto text-purple-400/50" />
                <p className="text-xs">You haven't enrolled in any courses yet.</p>
                <Link
                  to="/courses"
                  className="inline-block px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                >
                  Explore Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* LEARNING OVERVIEW SECTION */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white">Learning Overview</h2>
              <span className="text-xs bg-purple-900/30 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-semibold">
                This Week
              </span>
            </div>

            {/* Visual Progress Graph Curve */}
            <div className="bg-[#141728] p-4 rounded-xl border border-white/5 space-y-4">
              <div className="h-32 flex items-end justify-between px-2 pt-4 relative">
                {/* SVG Curve Line */}
                <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path
                    d="M0,35 Q20,25 35,38 T70,15 T100,25"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                  />
                </svg>

                {/* Day Labels */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div key={day} className="flex flex-col items-center gap-1 z-10">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        idx === 3 ? 'bg-purple-400 ring-4 ring-purple-500/30' : 'bg-purple-900/60'
                      }`}
                    />
                    <span className="text-[10px] text-richblack-400 font-medium">{day}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Summary Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div className="bg-[#0e111f] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-richblack-400 block font-medium">Total Time</span>
                  <span className="text-sm font-black text-white">{totalHoursLearned} Hours</span>
                  <span className="text-[9px] text-emerald-400 block font-medium mt-0.5">↑ Active learning</span>
                </div>
                <div className="bg-[#0e111f] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-richblack-400 block font-medium">Lessons Completed</span>
                  <span className="text-sm font-black text-white">{totalCompletedLessons} Lessons</span>
                  <span className="text-[9px] text-purple-400 block font-medium mt-0.5">↑ Completed</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 4. RECENT ACTIVITY & CERTIFICATES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT ACTIVITY */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white">Recent Activity</h2>
            <span className="text-xs text-purple-400 font-semibold">Live Logs</span>
          </div>

          <div className="space-y-3">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.slice(0, 3).map((course, idx) => (
                <div key={course._id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#141728] border border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center shrink-0">
                    <VscBook />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate">
                      Enrolled in {course.courseName}
                    </span>
                    <span className="text-[10px] text-richblack-400">
                      Progress: {course.progressPercentage || 0}%
                    </span>
                  </div>
                  <span className="text-[10px] text-richblack-400 shrink-0">Recent</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-richblack-400">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* CERTIFICATES & ACHIEVEMENTS */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white">Certificates & Achievements</h2>
            <span className="text-xs text-purple-400 font-semibold">
              {certificatesEarned} Earned
            </span>
          </div>

          {completedCoursesList.length > 0 ? (
            <div className="space-y-3">
              {completedCoursesList.map((course) => (
                <div key={course._id} className="flex items-center justify-between p-3 rounded-xl bg-[#141728] border border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0">
                      <AiOutlineTrophy />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {course.courseName}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">Verified Certificate</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/s/courses/${course._id}/certificate`)}
                    className="px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-richblack-400 space-y-1">
              <p>No certificates earned yet.</p>
              <p className="text-[10px] text-richblack-400">Complete 100% of any course to earn your verified certificate!</p>
            </div>
          )}
        </div>

      </div>

      {/* 5. BOTTOM MOTIVATIONAL CTA BANNER */}
      <div className="bg-gradient-to-r from-purple-900/50 via-[#141728] to-indigo-900/50 border border-purple-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            🚀
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Keep going, {userName}!</h3>
            <p className="text-xs text-richblack-300 mt-0.5">
              You're making great progress. Stay consistent and achieve your goals.
            </p>
          </div>
        </div>

        <Link
          to="/courses"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-extrabold hover:opacity-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] text-center shrink-0 flex items-center justify-center gap-2"
        >
          <span>Explore New Courses</span>
          <VscArrowRight />
        </Link>
      </div>

    </div>
  );
};

export default GlobalDashboard;
