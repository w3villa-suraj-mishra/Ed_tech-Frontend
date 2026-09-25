import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { VscBell, VscCheckAll, VscTrash, VscCircleFilled } from "react-icons/vsc";
import { io } from "socket.io-client";
import {
  fetchNotificationsAPI,
  fetchUnreadCountAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  deleteNotificationAPI
} from "../../services/operations/notificationAPI";

const NotificationBell = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load initial notifications & unread count
  const loadNotifications = async () => {
    if (!token) return;
    setLoading(true);
    const data = await fetchNotificationsAPI(token, 1, 20);
    if (data) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  // Real-time Socket.IO Connection
  useEffect(() => {
    if (!token) return;

    const backendUrl = process.env.REACT_APP_BASE_URL
      ? process.env.REACT_APP_BASE_URL.replace("/api/v1", "")
      : "http://localhost:5000";

    const socket = io(backendUrl, {
      auth: { token },
      transports: ["polling"],
      reconnectionAttempts: 3,
    });

    socket.on("connect", () => {
      console.log("🔔 Connected to Notification Socket.IO");
    });

    socket.on("notification:new", (newNotif) => {
      console.log("🔔 Real-time notification received:", newNotif);
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      const ok = await markNotificationReadAPI(notif.id, token);
      if (ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    const ok = await markAllNotificationsReadAPI(token);
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    const ok = await deleteNotificationAPI(notifId, token);
    if (ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      fetchUnreadCountAPI(token).then((count) => setUnreadCount(count));
    }
  };

  // Render bell even if not logged in to show the icon, but ask them to log in when opened

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none"
        title="Notifications"
      >
        <VscBell className="w-5 h-5" />
        

        {/* UNREAD BADGE */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATION DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl bg-white border border-gray-200 text-gray-700 shadow-premium-light z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* HEADER */}
          <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#DBEAFE] text-[#3B82F6] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-[#3B82F6] hover:text-[#3B82F6] flex items-center gap-1 transition cursor-pointer"
              >
                <VscCheckAll size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* NOTIFICATION LIST */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-xs text-gray-500">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-[#EFF6FF] transition-colors cursor-pointer flex items-start gap-3 group relative ${
                    !notif.isRead ? "bg-[#EFF6FF]/50" : ""
                  }`}
                >
                  {/* UNREAD INDICATOR DOT */}
                  {!notif.isRead && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#EFF6FF]0 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                  )}

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${!notif.isRead ? "text-[#3B82F6]" : "text-gray-700"}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {notif.message}
                    </p>
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    title="Delete"
                  >
                    <VscTrash size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <VscBell size={28} className="mx-auto text-gray-300" />
                {token ? (
                  <p className="text-xs text-gray-500 font-medium">No notifications yet</p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs text-gray-500 font-medium">Log in to view notifications</p>
                    <button 
                      onClick={() => navigate("/login")}
                      className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER */}
          {token && (
            <div className="p-2 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard/notifications");
                }}
                className="text-xs font-semibold text-[#3B82F6] hover:text-[#3B82F6] py-1 transition cursor-pointer"
              >
                Notification Settings & History →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;



