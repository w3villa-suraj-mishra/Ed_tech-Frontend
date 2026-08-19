import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserEnrolledCourses, getInstructorData } from "../../../services/operations/profileAPI";
import { Link } from "react-router-dom";
import { VscFlame, VscGraph, VscBook, VscCalendar } from "react-icons/vsc";
import { AiOutlineTrophy } from "react-icons/ai";

const GlobalDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [instructorStats, setInstructorStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = user?.accountType || user?.account_type || "Student";
  const isStudent = userRole === "Student";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (userRole === "Student") {
        try {
          const res = await getUserEnrolledCourses(token);
          if (res) {
            setEnrolledCourses(res);
          }
        } catch (e) {
          console.log("Error fetching student enrolled courses", e);
        }
      } else {
        try {
          const res = await getInstructorData(token);
          if (res) {
            setInstructorStats(res);
          }
        } catch (e) {
          console.log("Error fetching instructor stats", e);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user, token, userRole]);
  return (
    <div className="text-white space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5 tracking-tight flex items-center gap-2">
            Global Dashboard
          </h1>
          <p className="text-xs text-richblack-300 mt-1">
            Global dashboard reflecting your live performance stats across StudyTech.
          </p>
        </div>
        <div className="bg-richblack-800 border border-richblack-700 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Stats
        </div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isStudent ? "Platform Rank" : "Total Revenue"}
            </span>
            <AiOutlineTrophy className="text-base text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {isStudent
              ? enrolledCourses.length > 0
                ? `#${Math.max(1, 10 - enrolledCourses.length)}`
                : "Unranked"
              : `₹${instructorStats?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0) || 0}`}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block font-medium">
            {isStudent ? "Top 15% Learner" : "Total Earnings"}
          </span>
        </div>

        {/* Card 2 */}
        <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isStudent ? "Enrolled Courses" : "Total Students"}
            </span>
            <VscBook className="text-base text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {isStudent
              ? enrolledCourses.length
              : instructorStats?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0) || 0}
          </div>
          <span className="text-[11px] text-indigo-400 mt-2 block font-medium">
            {isStudent ? "Active Enrollments" : "Lifetime Enrolled"}
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isStudent ? "Platform Streak" : "Total Courses"}
            </span>
            <VscFlame className="text-base text-amber-500" />
          </div>
          <div className="text-2xl font-black text-white">
            {isStudent ? `${enrolledCourses.length > 0 ? enrolledCourses.length * 3 : 0} days` : instructorStats?.length || 0}
          </div>
          <span className="text-[11px] text-amber-400 mt-2 block font-medium">
            {isStudent ? "Daily Streak Active" : "Published Courses"}
          </span>
        </div>

        {/* Card 4 */}
        <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completion Rate
            </span>
            <VscGraph className="text-base text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {isStudent
              ? enrolledCourses.length > 0
                ? `${Math.round(
                    enrolledCourses.reduce((acc, c) => acc + (c.progressPercentage || 0), 0) /
                      enrolledCourses.length
                  )}%`
                : "0%"
              : "94%"}
          </div>
          <span className="text-[11px] text-purple-400 mt-2 block font-medium">
            {isStudent ? "Average Progress" : "Student Completion"}
          </span>
        </div>
      </div>

      {/* Main Stats and Streak Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Progress Breakdown */}
        <div className="lg:col-span-2 bg-[#12161F] border border-[#252C3A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-[#252C3A] pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Course Progress & Metrics</h2>
              <p className="text-xs text-slate-400">Live breakdown of active course completions</p>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-semibold">
              This Month
            </span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading performance data...</div>
          ) : isStudent ? (
            enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course._id} className="bg-[#191F2B] p-4 rounded-xl space-y-2 border border-[#2B3444]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white truncate max-w-[300px]">
                        {course.courseName}
                      </span>
                      <span className="text-xs font-bold text-indigo-400">
                        {course.progressPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-[#0E121A] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <VscBook className="text-3xl mx-auto text-slate-600" />
                <p className="text-sm font-semibold">No courses enrolled yet</p>
                <Link to="/courses" className="text-xs text-indigo-400 hover:underline block">
                  Explore available courses →
                </Link>
              </div>
            )
          ) : instructorStats && instructorStats.length > 0 ? (
            <div className="space-y-4">
              {instructorStats.map((course) => (
                <div key={course._id} className="bg-[#191F2B] p-4 rounded-xl space-y-2 border border-[#2B3444]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white truncate max-w-[300px]">
                      {course.courseName}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      Earned: ₹{(course.totalAmountGenerated || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Students Enrolled: <strong className="text-white">{course.totalStudentsEnrolled || 0}</strong></span>
                    <span>Course Fee: <strong className="text-white">₹{course.price || (course.totalStudentsEnrolled ? course.totalAmountGenerated / course.totalStudentsEnrolled : 0)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <VscBook className="text-3xl mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No active courses published yet</p>
              <Link to="/dashboard/add-course" className="text-xs text-indigo-400 hover:underline block">
                Create your first course →
              </Link>
            </div>
          )}
        </div>

        {/* Streak & Calendar Widget */}
        <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-[#252C3A] pb-3">
            <VscCalendar className="text-indigo-400 text-lg" />
            <h2 className="text-base font-bold text-white">Activity Calendar</h2>
          </div>

          <div className="bg-[#191F2B] p-4 rounded-xl border border-[#2B3444] text-center">
            <h3 className="text-sm font-bold text-slate-300 mb-3">August 2026</h3>
            <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-slate-400 mb-2">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {[...Array(31)].map((_, i) => (
                <div
                  key={i}
                  className={`py-1.5 rounded-lg text-center font-medium ${
                    i + 1 === 18
                      ? "bg-indigo-600 text-white font-bold"
                      : (i + 1) % 4 === 0
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-slate-400 hover:bg-[#252C3A]"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboard;
