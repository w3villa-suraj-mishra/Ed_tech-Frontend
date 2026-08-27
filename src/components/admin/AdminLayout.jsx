import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNotifications } from '../../services/admin/adminAPI';

const NAV = [
  { label: 'Dashboard',     path: '/admin/dashboard',     icon: '📊', superOnly: false },
  { label: 'Users',         path: '/admin/users',          icon: '👥', superOnly: false },
  { label: 'Courses',       path: '/admin/courses',        icon: '📚', superOnly: false },
  { label: 'Categories',    path: '/admin/categories',     icon: '🏷️', superOnly: false },
  { label: 'Enrollments',   path: '/admin/enrollments',    icon: '📋', superOnly: false },
  { label: 'Practice Bank', path: '/admin/practice-bank',  icon: '⚡', superOnly: false },
  { label: 'Practice Tests',path: '/admin/practice-tests', icon: '📝', superOnly: false },
  { label: 'Reviews',       path: '/admin/reviews',        icon: '⭐', superOnly: false },
  { label: 'Articles',      path: '/admin/articles',       icon: '📰', superOnly: false },
  // { label: 'Live Sessions', path: '/admin/live-sessions',  icon: '🎥', superOnly: false },
  { label: 'Contact Us',    path: '/admin/contacts',       icon: '✉️', superOnly: false },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme]             = useState(localStorage.getItem('adminTheme') || 'dark');
  const [notifications, setNotifs]    = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [tabFilter, setTabFilter]     = useState('all'); // 'all' or 'unread'
  const notifRef                      = useRef(null);

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const loadNotifications = () => {
    getNotifications()
      .then(({ data }) => {
        if (data?.success) {
          setNotifs(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  // Close notification popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const isLight = theme === 'light';

  const displayedNotifs = tabFilter === 'unread' 
    ? notifications.filter(n => n.type === 'contact')
    : notifications;

  return (
    <div className={`min-h-screen flex font-inter transition-colors duration-300 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#090D16] text-[#F1F2FF]'
    }`}>
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 border-r flex flex-col transition-all duration-300 z-30 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#161D29] border-[#2C333F]'
        }`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${
          isLight ? 'border-slate-200' : 'border-[#2C333F]'
        }`}>
          {sidebarOpen && (
            <span className="text-base font-bold text-[#FFD60A] tracking-wide truncate">
              ⚡ Admin Portal
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hover:text-white transition-colors ml-auto ${isLight ? 'text-slate-500' : 'text-[#999DAA]'}`}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : ''}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all duration-200 text-sm font-medium
                  ${active
                    ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20 font-bold'
                    : isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-[#AFB2BF] hover:bg-[#2C333F] hover:text-white'
                  }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className={`border-t p-4 ${isLight ? 'border-slate-200' : 'border-[#2C333F]'}`}>
          {sidebarOpen ? (
            <div className="mb-3">
              <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-[#999DAA]'}`}>{adminUser.email}</p>
              <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                adminUser.accountType === 'Superadmin'
                  ? 'bg-[#FFD60A]/20 text-[#FFD60A]'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {adminUser.accountType}
              </span>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={`h-16 border-b flex items-center justify-between px-6 flex-shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#161D29] border-[#2C333F]'
        }`}>
          <div className={`text-sm capitalize font-medium ${isLight ? 'text-slate-600' : 'text-[#AFB2BF]'}`}>
            {location.pathname.replace('/admin/', '').replace(/-/g, ' ') || 'Dashboard'}
          </div>

          <div className="flex items-center gap-5">
            {/* Dark / Light Toggle */}
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              className={`p-2 rounded-full transition-all duration-200 border ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200' 
                  : 'bg-[#2C333F] border-[#3E4553] text-[#FFD60A] hover:bg-[#3E4553]'
              }`}
            >
              {isLight ? (
                /* Sun Icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                /* Moon Icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Dynamic Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 rounded-full relative transition-colors border ${
                  isLight 
                    ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                    : 'bg-[#2C333F] border-[#3E4553] text-[#F1F2FF] hover:bg-[#3E4553]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Exact Screenshot Styled Notification Popover */}
              {notifOpen && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#12161F] border-[#252C3A] text-white'
                }`}>
                  {/* Top Header */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-[#252C3A]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base">Notifications</h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>

                  {/* Tabs: All / Unread */}
                  <div className="flex border-b border-[#252C3A] px-4 pt-2 text-xs font-semibold text-[#8E95A5]">
                    <button
                      onClick={() => setTabFilter('all')}
                      className={`pb-2.5 px-3 border-b-2 transition-all ${
                        tabFilter === 'all'
                          ? 'border-purple-500 text-white font-bold'
                          : 'border-transparent hover:text-slate-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTabFilter('unread')}
                      className={`pb-2.5 px-3 border-b-2 transition-all ${
                        tabFilter === 'unread'
                          ? 'border-purple-500 text-white font-bold'
                          : 'border-transparent hover:text-slate-300'
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#252C3A]">
                    {displayedNotifs.length === 0 ? (
                      <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-full bg-[#1C2230] flex items-center justify-center text-[#6C7589] mb-4">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">All caught up!</h4>
                        <p className="text-xs text-[#8E95A5]">You have no new notifications</p>
                      </div>
                    ) : (
                      displayedNotifs.map((n) => (
                        <Link
                          key={n.id}
                          to={n.link}
                          onClick={() => setNotifOpen(false)}
                          className="block px-4 py-3.5 hover:bg-[#1A202C] transition-colors"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-xs text-[#FFD60A]">{n.title}</span>
                            <span className="text-[10px] text-[#8E95A5]">
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-[#999DAA] line-clamp-2">{n.message}</p>
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-[#252C3A] flex items-center justify-between text-xs text-[#8E95A5] bg-[#0E121A]">
                    <Link
                      to="/admin/contacts"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      View All
                    </Link>
                    <button
                      onClick={() => loadNotifications()}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold text-sm shadow-md">
                {((adminUser.firstName || 'S')[0] + (adminUser.lastName || 'U')[0]).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#000814] text-[#F1F2FF]'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
