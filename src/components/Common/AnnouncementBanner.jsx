import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getActiveAnnouncement, dismissAnnouncement } from '../../services/admin/announcementAPI';
import { FiClock, FiX, FiTag, FiArrowRight } from 'react-icons/fi';

export default function AnnouncementBanner() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});
  
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Fetch active announcement on mount or auth change
  useEffect(() => {
    let isMounted = true;

    const fetchBanner = async () => {
      try {
        const res = await getActiveAnnouncement(token);
        if (isMounted && res?.data?.success && (res.data.data || res.data.announcement)) {
          const item = res.data.data || res.data.announcement;
          
          // Check session storage dismissal fallback for unauthenticated users
          const localDismissed = sessionStorage.getItem(`dismissed_announcement_${item.id}`);
          if (localDismissed === 'true') {
            setDismissed(true);
            return;
          }

          setAnnouncement(item);
        } else if (isMounted) {
          setAnnouncement(null);
        }
      } catch (err) {
        if (isMounted) setAnnouncement(null);
      }
    };

    fetchBanner();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Countdown timer handler
  useEffect(() => {
    if (!announcement || !announcement.countdownEnabled || !announcement.endAt) {
      setTimeLeft('');
      return;
    }

    const calculateTime = () => {
      const end = new Date(announcement.endAt).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('');
        setAnnouncement(null); // Auto expire and hide
        return false;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let formatted = '';
      if (days > 0) formatted += `${days}d `;
      formatted += `${String(hours).padStart(2, '0')}h `;
      formatted += `${String(minutes).padStart(2, '0')}m `;
      formatted += `${String(seconds).padStart(2, '0')}s`;

      setTimeLeft(formatted);
      return true;
    };

    const valid = calculateTime();
    if (!valid) return;

    const timer = setInterval(() => {
      const stillValid = calculateTime();
      if (!stillValid) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [announcement]);

  const handleDismiss = async () => {
    if (!announcement) return;
    setDismissed(true);
    sessionStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true');

    try {
      await dismissAnnouncement(announcement.id, token);
    } catch (err) {
      // Ignore API errors on dismiss
    }
  };

  const handleCtaClick = () => {
    if (!announcement || !announcement.ctaUrl) return;
    const url = announcement.ctaUrl.trim();

    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  if (!announcement || dismissed) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#090d19] via-[#0f172a] to-[#090d19] border-b border-blue-500/30 text-white shadow-md relative z-40 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-xs sm:text-sm">
        
        {/* Left Section: Highlight Text & Message */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
          {announcement.highlightText && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm shrink-0">
              <FiTag className="text-xs" />
              <span>{announcement.highlightText}</span>
            </span>
          )}

          <div className="font-medium text-richblack-100 flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
            <span className="font-bold text-white">{announcement.title}:</span>
            <span>{announcement.message}</span>
          </div>
        </div>

        {/* Right Section: Countdown, CTA & Dismiss */}
        <div className="flex items-center justify-center gap-3.5 shrink-0">
          {/* Countdown timer */}
          {announcement.countdownEnabled && timeLeft && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold shadow-inner">
              <FiClock className="text-blue-400 text-xs animate-pulse" />
              <span>{timeLeft}</span>
            </div>
          )}

          {/* CTA Button */}
          {announcement.ctaEnabled && announcement.ctaText && (
            <button
              onClick={handleCtaClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer"
            >
              <span>{announcement.ctaText}</span>
              <FiArrowRight className="text-xs" />
            </button>
          )}

          {/* Close Dismiss Button */}
          {announcement.dismissible && (
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-richblack-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss announcement"
              aria-label="Close Announcement"
            >
              <FiX className="text-base" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
