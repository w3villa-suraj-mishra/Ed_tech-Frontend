import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  fetchNotificationPreferencesAPI,
  updateNotificationPreferencesAPI,
  createAdminNotificationAPI
} from "../../../services/operations/notificationAPI";
import { VscBell, VscBellDot, VscSend, VscSettingsGear, VscCheck, VscGlobe } from "react-icons/vsc";

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
          courseUpdates: Boolean(data.courseUpdates ?? data.course_updates),
          newLessons: Boolean(data.newLessons ?? data.new_lessons),
          newCourses: Boolean(data.newCourses ?? data.new_courses),
          discussionReplies: Boolean(data.discussionReplies ?? data.discussion_replies),
          courseReviews: Boolean(data.courseReviews ?? data.course_reviews),
          offersPromotions: Boolean(data.offersPromotions ?? data.offers_promotions),
          planExpiration: Boolean(data.planExpiration ?? data.plan_expiration),
          platformAnnouncements: Boolean(data.platformAnnouncements ?? data.platform_announcements)
        });
      }
      setLoading(false);
    };
    loadPrefs();
  }, [token]);

  const handlePrefToggle = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    await updateNotificationPreferencesAPI(updated, token);
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

  return (
    <div className="space-y-6 text-[#E6EDF3] font-['Inter',sans-serif]">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#262C36] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <VscBell className="text-indigo-500" /> Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your real-time alerts, notification preferences, and system broadcasts.
          </p>
        </div>

        {/* TABS */}
        <div className="flex bg-[#161B22] p-1 rounded-xl border border-[#262C36]">
          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "preferences"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <VscSettingsGear size={14} /> Preferences
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <VscGlobe size={14} /> Admin Composer
            </button>
          )}
        </div>
      </div>

      {/* PREFERENCES TAB */}
      {activeTab === "preferences" && (
        <div className="bg-[#161B22] border border-[#262C36] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Notification Preferences</h2>
            <p className="text-xs text-slate-400">
              Control which non-critical real-time alerts you wish to receive in your notification bell.
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading preferences...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { key: "courseUpdates", label: "Course Updates", desc: "Alerts when course content or structure is modified." },
                { key: "newLessons", label: "New Lessons & Lectures", desc: "Notifications when instructors add new lectures." },
                { key: "newCourses", label: "New Course Launches", desc: "Alerts for newly published courses across categories." },
                { key: "discussionReplies", label: "Discussion & Comment Replies", desc: "Notifications when someone replies to your post." },
                { key: "courseReviews", label: "Course Reviews (Instructors)", desc: "Alerts when students rate or review your course." },
                { key: "offersPromotions", label: "Offers & Promotions", desc: "Discount codes, sale events, and promotional deals." },
                { key: "planExpiration", label: "Plan & Subscription Expiration", desc: "Reminders before Silver/Gold plan access expires." },
                { key: "platformAnnouncements", label: "Platform Announcements", desc: "System maintenance and major platform updates." }
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#0D1117] border border-[#262C36] hover:border-[#384150] transition-all"
                >
                  <div className="space-y-0.5 pr-4">
                    <h3 className="text-xs font-bold text-white">{label}</h3>
                    <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
                  </div>

                  <button
                    onClick={() => handlePrefToggle(key)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
                      preferences[key] ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        preferences[key] ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADMIN COMPOSER TAB */}
      {activeTab === "admin" && isAdmin && (
        <div className="bg-[#161B22] border border-[#262C36] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <VscSend className="text-amber-400" /> Create Platform Broadcast / Targeted Notification
            </h2>
            <p className="text-xs text-slate-400">
              Send instant real-time and persistent database notifications to platform users.
            </p>
          </div>

          <form onSubmit={handleAdminSend} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 Platform Maintenance Scheduled"
                  value={adminForm.title}
                  onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#262C36] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Audience *</label>
                <select
                  value={adminForm.audience}
                  onChange={(e) => setAdminForm({ ...adminForm, audience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#262C36] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
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
                <label className="text-xs font-semibold text-slate-300">Course ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Course ID"
                  value={adminForm.courseId}
                  onChange={(e) => setAdminForm({ ...adminForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#262C36] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Destination Link</label>
              <input
                type="text"
                placeholder="e.g. /catalog or /dashboard/courses"
                value={adminForm.link}
                onChange={(e) => setAdminForm({ ...adminForm, link: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#262C36] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Message Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Enter complete notification message..."
                value={adminForm.message}
                onChange={(e) => setAdminForm({ ...adminForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0D1117] border border-[#262C36] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <VscSend size={16} /> {sending ? "Dispatching..." : "Send Notification Broadcast"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
