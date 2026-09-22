import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  fetchNotificationPreferencesAPI,
  updateNotificationPreferencesAPI,
  createAdminNotificationAPI
} from "../../../services/operations/notificationAPI";
import {
  FiBell,
  FiSettings,
  FiCheck,
  FiBookOpen,
  FiCalendar,
  FiStar,
  FiTag,
  FiSend
} from "react-icons/fi";

const NotificationSettings = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const isAdmin = user?.accountType === "Admin" || user?.account_type === "Admin";

  const [activeTab, setActiveTab] = useState("preferences");
  const [preferences, setPreferences] = useState({
    courseUpdates: true,
    newLessons: true,
    newCourses: true,
    discussionReplies: true,
    courseReviews: true,
    offersPromotions: true,
    planExpiration: true,
    platformAnnouncements: true
  });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);

  // Admin Broadcast Form State
  const [adminForm, setAdminForm] = useState({
    title: "",
    message: "",
    type: "PLATFORM_ANNOUNCEMENT",
    audience: "All Users",
    link: "/catalog",
    courseId: ""
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadPrefs = async () => {
      if (!token) return;
      setLoading(true);
      const data = await fetchNotificationPreferencesAPI(token);
      if (data) {
        setPreferences({
          courseUpdates: Boolean(data.courseUpdates ?? data.course_updates ?? true),
          newLessons: Boolean(data.newLessons ?? data.new_lessons ?? true),
          newCourses: Boolean(data.newCourses ?? data.new_courses ?? true),
          discussionReplies: Boolean(data.discussionReplies ?? data.discussion_replies ?? true),
          courseReviews: Boolean(data.courseReviews ?? data.course_reviews ?? true),
          offersPromotions: Boolean(data.offersPromotions ?? data.offers_promotions ?? true),
          planExpiration: Boolean(data.planExpiration ?? data.plan_expiration ?? true),
          platformAnnouncements: Boolean(data.platformAnnouncements ?? data.platform_announcements ?? true)
        });
      }
      setLoading(false);
    };
    loadPrefs();
  }, [token]);

  const handlePrefToggle = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    setLastSaved(true);
    setTimeout(() => setLastSaved(false), 2000);
    if (token) {
      await updateNotificationPreferencesAPI(updated, token);
    }
  };

  const handleAdminSend = async (e) => {
    e.preventDefault();
    if (!adminForm.title || !adminForm.message) return;
    setSending(true);
    const res = await createAdminNotificationAPI(adminForm, token);
    if (res) {
      setAdminForm({
        title: "",
        message: "",
        type: "PLATFORM_ANNOUNCEMENT",
        audience: "All Users",
        link: "/catalog",
        courseId: ""
      });
    }
    setSending(false);
  };

  // Preference item definitions matching the UI screenshot exactly
  const preferenceItems = [
    {
      key: "courseUpdates",
      label: "Course Updates",
      desc: "Alerts when course content or structure is modified.",
      iconBg: "bg-[#EFF6FF] border-[#DBEAFE] text-[#3BA7F2]",
      icon: <FiBookOpen className="text-xl" />
    },
    {
      key: "newLessons",
      label: "New Lessons & Lectures",
      desc: "Notifications when instructors add new lectures.",
      iconBg: "bg-[#ECFDF5] border-[#D1FAE5] text-[#059669]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <polygon points="10 8 15 10 10 12 10 8" fill="currentColor" stroke="none" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      )
    },
    {
      key: "newCourses",
      label: "New Course Launches",
      desc: "Alerts for newly published courses across categories.",
      iconBg: "bg-[#FFF1F2] border-[#FFE4E6] text-[#E11D48]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2" />
          <path d="M15 9v5s3.03-.55 4.5-2c1.47-1.45 2-4.5 2-4.5" />
        </svg>
      )
    },
    {
      key: "discussionReplies",
      label: "Discussion & Comment Replies",
      desc: "Notifications when someone replies to your post.",
      iconBg: "bg-[#FFFBEB] border-[#FEF3C7] text-[#D97706]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          <circle cx="12" cy="11.5" r="0.75" fill="currentColor" />
          <circle cx="16" cy="11.5" r="0.75" fill="currentColor" />
        </svg>
      )
    },
    {
      key: "courseReviews",
      label: "Course Reviews (Instructors)",
      desc: "Alerts when students rate or review your course.",
      iconBg: "bg-[#13AA92]/10 border-[#13AA92]/30 text-[#13AA92]",
      icon: <FiStar className="text-xl" />
    },
    {
      key: "offersPromotions",
      label: "Offers & Promotions",
      desc: "Discount codes, sale events, and promotional deals.",
      iconBg: "bg-[#F7FEE7] border-[#ECFCCB] text-[#65A30D]",
      icon: <FiTag className="text-xl" />
    },
    {
      key: "planExpiration",
      label: "Plan & Subscription Expiration",
      desc: "Reminders before Silver/Gold plan access expires.",
      iconBg: "bg-[#FDF2F8] border-[#FCE7F3] text-[#DB2777]",
      icon: <FiCalendar className="text-xl" />
    },
    {
      key: "platformAnnouncements",
      label: "Platform Announcements",
      desc: "System maintenance and major platform updates.",
      iconBg: "bg-[#F0F9FF] border-[#E0F2FE] text-[#0284C7]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11v3a2 2 0 0 0 2 2h1l4 4V4L6 8H5a2 2 0 0 0-2 2z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6 text-[#1E293B] font-sans pb-12 max-w-[1240px] mx-auto">
      
      {/* TOP HEADER WITH BACKGROUND 3D BELL ILLUSTRATION */}
      <div className="relative rounded-2xl p-2 sm:p-4 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Background 3D Pastel Bell & Clouds Illustration */}
        <div className="absolute right-2 sm:right-32 -top-6 sm:-top-10 pointer-events-none z-0 select-none opacity-90">
          <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5F3FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="bellGrad" x1="20" y1="10" x2="70" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3BA7F2" />
                <stop offset="50%" stopColor="#3BA7F2" />
                <stop offset="100%" stopColor="#3730A3" />
              </linearGradient>
              <linearGradient id="bellHighlight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3BA7F2" stopOpacity="0" />
              </linearGradient>
              <filter id="shadow" x="0" y="0" width="200" height="150" filterUnits="userSpaceOnUse">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#3BA7F2" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Soft Pastel Background Cloud Layers */}
            <path
              d="M30 80C15 80 0 92 0 110C0 128 15 140 35 140H185C205 140 220 125 220 105C220 85 205 75 190 75C185 55 165 40 145 42C135 25 110 20 95 32C85 22 65 24 55 38C38 42 30 60 30 80Z"
              fill="url(#cloudGrad)"
            />

            {/* Sound Wave Ripple Lines */}
            <path d="M72 38C68 45 68 55 72 62" stroke="#3BA7F2" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <path d="M64 32C58 43 58 57 64 68" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            
            <path d="M128 38C132 45 132 55 128 62" stroke="#3BA7F2" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <path d="M136 32C142 43 142 57 136 68" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

            {/* 3D Glossy Bell Graphic */}
            <g filter="url(#shadow)" transform="rotate(-6 100 55)">
              {/* Top loop */}
              <circle cx="100" cy="22" r="7" stroke="url(#bellGrad)" strokeWidth="4" fill="none" />
              
              {/* Bell Body */}
              <path
                d="M84 45C84 34 91 27 100 27C109 27 116 34 116 45C116 57 122 64 126 70C128 73 126 77 122 77H78C74 77 72 73 74 70C78 64 84 57 84 45Z"
                fill="url(#bellGrad)"
              />
              
              {/* Glossy highlight streak */}
              <path
                d="M88 45C88 37 93 31 100 30C95 33 92 40 92 48C92 56 89 62 86 68C85 66 84 64 85 62C87 56 88 50 88 45Z"
                fill="url(#bellHighlight)"
              />
              
              {/* Bell Base Rim */}
              <ellipse cx="100" cy="77" rx="24" ry="5.5" fill="#3BA7F2" />
              <ellipse cx="100" cy="76" rx="23" ry="4" fill="#3BA7F2" />

              {/* Clapper / Hammer */}
              <circle cx="100" cy="85" r="6" fill="#312E81" />
              <circle cx="98" cy="83" r="2" fill="#818CF8" />
            </g>

            {/* Little floating sparkles */}
            <circle cx="48" cy="30" r="2.5" fill="#818CF8" opacity="0.7" />
            <circle cx="152" cy="28" r="3" fill="#A5B4FC" opacity="0.8" />
            <circle cx="165" cy="45" r="2" fill="#3BA7F2" opacity="0.6" />
          </svg>
        </div>

        {/* Left: Title & Subtitle with Outline Bell Icon */}
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2.5">
            {/* Outlined Bell Icon */}
            <div className="text-blue-600">
              <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
              Notification Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal pl-9 sm:pl-10">
            Manage your real-time alerts, notification preferences, and system broadcasts.
          </p>
        </div>

        {/* Right: Preferences Button & Admin Switcher */}
        <div className="relative z-10 flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setActiveTab("preferences")}
            className="px-4 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FiSettings className="text-base" />
            <span>Preferences</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab(activeTab === "admin" ? "preferences" : "admin")}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FiSend size={13} />
              <span>{activeTab === "admin" ? "Close Composer" : "Admin Composer"}</span>
            </button>
          )}
        </div>
      </div>

      {/* BANNER CARD: "Stay updated, stay ahead!" */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            
            {/* Banner Left: Text */}
            <div className="space-y-1.5 text-left w-full md:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Stay updated, stay ahead!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Get notified about important updates, new courses, and more.
              </p>
            </div>

            {/* Banner Middle: Flying Paper Airplane with Looped Trail */}
            <div className="hidden lg:flex items-center justify-center flex-1 max-w-[260px] py-1 select-none">
              <svg width="220" height="75" viewBox="0 0 220 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Looping dashed flight path */}
                <path
                  d="M10 55 C 30 55, 45 40, 50 25 C 55 10, 68 12, 70 28 C 72 45, 52 50, 65 62 C 80 75, 110 50, 140 25"
                  stroke="#818CF8"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                
                {/* Origami Paper Airplane facing upper-right */}
                <g transform="translate(142, 10) rotate(15)">
                  {/* Top main wing */}
                  <polygon points="0,22 42,0 18,36" fill="#3BA7F2" />
                  {/* Underside fold */}
                  <polygon points="18,36 42,0 24,20" fill="#3BA7F2" />
                  {/* Right side wing highlight */}
                  <polygon points="0,22 42,0 24,14" fill="#818CF8" />
                  {/* Bottom tail keel */}
                  <polygon points="18,36 24,20 12,30" fill="#3730A3" />
                </g>
              </svg>
            </div>

            {/* Banner Right: Floating Quote Bubble */}
            <div className="bg-[#F6F5FE] border border-indigo-100/90 rounded-2xl px-6 py-4 text-center shrink-0 w-full md:w-auto min-w-[210px]">
              <p className="text-xs sm:text-sm italic font-serif text-slate-700 font-medium tracking-wide">
                “ Never miss<br />what matters. ”
              </p>
            </div>

          </div>
        </div>
      )}

      {/* NOTIFICATION PREFERENCES CARD */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          
          {/* Card Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Notification Preferences
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Control which non-critical real-time alerts you wish to receive in your notification bell.
              </p>
            </div>

            {/* Pill: Changes are saved automatically */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/70 text-[11px] sm:text-xs text-slate-600 font-medium">
              <FiBell className="text-slate-400 text-xs shrink-0" />
              <span>Changes are saved automatically</span>
              <FiCheck className={`text-xs ml-0.5 transition-colors ${lastSaved ? "text-emerald-600 font-bold" : "text-slate-500"}`} />
            </div>
          </div>

          {/* 2-Column Grid of 8 Preference Items */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your preferences...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preferenceItems.map(({ key, label, desc, iconBg, icon }) => {
                const isChecked = preferences[key];
                return (
                  <div
                    key={key}
                    onClick={() => handlePrefToggle(key)}
                    className="border border-slate-200/80 rounded-2xl p-4 sm:p-4.5 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer select-none group"
                  >
                    {/* Left: Pastel Icon Box + Texts */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} transition-transform group-hover:scale-105`}>
                        {icon}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {label}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Smooth Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrefToggle(key);
                      }}
                      className={`w-12 h-6.5 rounded-full transition-colors duration-200 relative p-0.5 cursor-pointer shrink-0 focus:outline-none ${
                        isChecked ? "bg-[#3BA7F2]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`block w-5.5 h-5.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                          isChecked ? "translate-x-5.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ADMIN BROADCAST COMPOSER (If Admin active) */}
      {activeTab === "admin" && isAdmin && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiSend className="text-indigo-600" /> Create Platform Broadcast / Targeted Notification
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Send instant real-time and persistent database notifications to platform users.
            </p>
          </div>

          <form onSubmit={handleAdminSend} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Notification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 Platform Maintenance Scheduled"
                  value={adminForm.title}
                  onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Audience *</label>
                <select
                  value={adminForm.audience}
                  onChange={(e) => setAdminForm({ ...adminForm, audience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                >
                  <option value="All Users">All Users</option>
                  <option value="Students">Students Only</option>
                  <option value="Instructors">Instructors Only</option>
                  <option value="Specific Course Students">Specific Course Enrollees</option>
                </select>
              </div>
            </div>

            {adminForm.audience === "Specific Course Students" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Course ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Course ID"
                  value={adminForm.courseId}
                  onChange={(e) => setAdminForm({ ...adminForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Destination Link</label>
              <input
                type="text"
                placeholder="e.g. /catalog or /dashboard/courses"
                value={adminForm.link}
                onChange={(e) => setAdminForm({ ...adminForm, link: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Message Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Enter complete notification message..."
                value={adminForm.message}
                onChange={(e) => setAdminForm({ ...adminForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FiSend size={14} /> {sending ? "Dispatching..." : "Send Notification Broadcast"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default NotificationSettings;
