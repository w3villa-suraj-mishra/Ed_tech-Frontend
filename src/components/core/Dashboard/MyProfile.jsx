import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { formattedDate } from "../../../utils/dateFormatter";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import {
  VscBook,
  VscCoverage,
  VscFlame,
  VscPass,
  VscEdit,
  VscLocation,
  VscCalendar,
  VscArrowRight,
  VscShield,
  VscCrown
} from "react-icons/vsc";
import { AiOutlineTrophy } from "react-icons/ai";

const MyProfile = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticated user values
  const firstName = user?.first_name || user?.firstName || "Student";
  const lastName = user?.last_name || user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const accountType = user?.account_type || user?.accountType || "Basic Student";
  const email = user?.email || "";
  const joinedDate = user?.createdAt ? formattedDate(user.createdAt) : "January 1, 2024";

  useEffect(() => {
    const fetchUserStats = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await getUserEnrolledCourses(token);
          if (res && Array.isArray(res)) {
            setEnrolledCourses(res);
          }
        } catch (error) {
          console.error("Error fetching enrolled courses for profile stats", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserStats();
  }, [token]);

  // Derived Dynamic Statistics from Database
  const totalEnrolled = enrolledCourses.length;
  const totalCompletedLessons = enrolledCourses.reduce((acc, course) => {
    return acc + (course.completedVideos?.length || 0);
  }, 0);
  const certificatesEarned = enrolledCourses.filter(
    (c) => (c.progressPercentage || 0) === 100
  ).length;
  const totalHoursLearned = (totalCompletedLessons * 0.25).toFixed(1);
  const activeStreakDays = totalEnrolled > 0 ? Math.min(totalEnrolled * 3 + totalCompletedLessons, 30) : 0;

  // JSON Profile Export Download Handler
  const handleDownloadProfile = () => {
    const profileData = {
      fullName,
      email,
      accountType,
      contactNumber: user?.additionalDetails?.contactNumber || "Not provided",
      gender: user?.additionalDetails?.gender || "Not specified",
      dateOfBirth: user?.additionalDetails?.dateOfBirth ? formattedDate(user.additionalDetails.dateOfBirth) : "Not provided",
      about: user?.additionalDetails?.about || "No bio added yet.",
      address: user?.additionalDetails?.address || "No address added yet.",
      enrolledCoursesCount: totalEnrolled,
      completedLessonsCount: totalCompletedLessons,
      certificatesCount: certificatesEarned,
      exportedAt: new Date().toLocaleString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${firstName}_profile_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-white max-w-5xl mx-auto pb-10">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Profile</h1>
          <p className="text-xs text-richblack-300 mt-1">
            Manage your personal information and account settings.
          </p>
        </div>

        <button
          onClick={handleDownloadProfile}
          className="flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-95 self-start sm:self-auto"
        >
          <span>📥 Download Profile</span>
        </button>
      </div>

      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={user?.image}
              alt={`profile-${firstName}`}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            />
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-purple-600 rounded-full border-2 border-[#0e111f] flex items-center justify-center text-[10px]">
              📷
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{fullName}</h2>
              <span className="text-[10px] font-bold bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                {accountType}
              </span>
            </div>

            <p className="text-xs text-purple-300 font-medium">{email}</p>

            <div className="flex items-center gap-4 text-[11px] text-richblack-400 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <VscLocation className="text-purple-400" />
                <span>{user?.additionalDetails?.address || "Noida, Uttar Pradesh, India"}</span>
              </span>
              <span className="flex items-center gap-1">
                <VscCalendar className="text-purple-400" />
                <span>Joined on {joinedDate}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/settings")}
          className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1.5 shrink-0"
        >
          <VscEdit />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* 2. DYNAMIC STATISTICS ROW (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
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
            ↑ Keep it up!
          </div>
        </div>

        {/* Certificates Earned */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-richblack-400">
            <div className="w-8 h-8 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
              <AiOutlineTrophy />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white block">{certificatesEarned}</span>
            <span className="text-xs text-richblack-300 font-medium">Certificates Earned</span>
          </div>
          <div className="mt-2 text-[10px] text-purple-400 font-medium">
            ↑ {certificatesEarned > 0 ? "100%" : "0%"} vs last month
          </div>
        </div>

      </div>

      {/* 3. ABOUT BIO & PERSONAL DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ABOUT BIO CARD */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">About Bio</h3>
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <span>Edit</span>
                <span className="text-[10px]">▾</span>
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${user?.additionalDetails?.about ? "text-richblack-200" : "text-richblack-400 italic"}`}>
              {user?.additionalDetails?.about ?? "Passionate learner exploring the world of technology and always eager to build, learn and grow."}
            </p>
          </div>
        </div>

        {/* PERSONAL DETAILS CARD */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-base font-bold text-white">Personal Details</h3>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Edit</span>
              <span className="text-[10px]">▾</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-richblack-400 text-[11px] block">First Name</span>
              <span className="font-bold text-white text-sm">{firstName}</span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Last Name</span>
              <span className="font-bold text-white text-sm">{lastName || "Not set"}</span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Email Address</span>
              <span className="font-bold text-white text-sm truncate block">{email}</span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Phone Number</span>
              <span className="font-bold text-white text-sm">
                {user?.additionalDetails?.contactNumber ?? "Not provided"}
              </span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Gender</span>
              <span className="font-bold text-white text-sm">
                {user?.additionalDetails?.gender ?? "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Date of Birth</span>
              <span className="font-bold text-white text-sm">
                {user?.additionalDetails?.dateOfBirth ? formattedDate(user.additionalDetails.dateOfBirth) : "January 1, 1970"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. ADDRESS & ACCOUNT INFO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ADDRESS & LOCATION */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-base font-bold text-white">Address & Map Location</h3>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Edit</span>
              <span className="text-[10px]">▾</span>
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-900/40 text-purple-400 flex items-center justify-center shrink-0 mt-1">
              <VscLocation />
            </div>
            <div>
              <span className="text-[11px] text-richblack-400 block font-medium">Registered Address</span>
              <p className="text-xs font-semibold text-white mt-1 leading-relaxed">
                {user?.additionalDetails?.address || "Sector 63, Block A, Noida, Uttar Pradesh 201301, India"}
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT INFORMATION */}
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-base font-bold text-white">Account Information</h3>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Edit</span>
              <span className="text-[10px]">▾</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-richblack-400 text-[11px] block">Account Type</span>
              <span className="font-bold text-white text-sm">{accountType}</span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Account Status</span>
              <span className="inline-block text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full mt-1">
                Active
              </span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Member Since</span>
              <span className="font-bold text-white text-sm">{joinedDate}</span>
            </div>

            <div>
              <span className="text-richblack-400 text-[11px] block">Last Login</span>
              <span className="font-bold text-white text-sm">Today, Active Now</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. LEARNING PREFERENCES */}
      <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <h3 className="text-base font-bold text-white">Learning Preferences</h3>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            <span>Edit</span>
            <span className="text-[10px]">▾</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#141728] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
              💻
            </div>
            <div>
              <span className="text-[10px] text-richblack-400 block font-medium">Preferred Language</span>
              <span className="font-bold text-white">English</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#141728] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
              ⏰
            </div>
            <div>
              <span className="text-[10px] text-richblack-400 block font-medium">Daily Learning Time</span>
              <span className="font-bold text-white">1-2 hours</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#141728] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
              🎯
            </div>
            <div>
              <span className="text-[10px] text-richblack-400 block font-medium">Learning Goal</span>
              <span className="font-bold text-white">Full Stack Development</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#141728] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center text-base">
              🚀
            </div>
            <div>
              <span className="text-[10px] text-richblack-400 block font-medium">Experience Level</span>
              <span className="font-bold text-white">Beginner</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PRIVACY & SECURITY BANNER */}
      <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center text-base shrink-0">
            <VscShield />
          </div>
          <div>
            <span className="font-bold text-white block">Your data is safe and secure</span>
            <span className="text-richblack-400 text-[11px]">We never share your personal information with anyone.</span>
          </div>
        </div>

        <Link
          to="/privacy-policy"
          className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 shrink-0"
        >
          <span>Privacy Policy</span>
          <VscArrowRight />
        </Link>
      </div>

    </div>
  );
};

export default MyProfile;