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
        const payload = res?.data || res;
        if (isMounted && payload?.success && (payload.data || payload.announcement)) {
          const item = payload.data || payload.announcement;
          
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

  // Countdown timer handler with separate hours, minutes, seconds
  useEffect(() => {
    if (!announcement || !announcement.countdownEnabled || !announcement.endAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const end = new Date(announcement.endAt).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        setAnnouncement(null); // Auto expire and hide
        return false;
      }

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: totalHours,
        minutes: minutes,
        seconds: seconds
      });
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
    <div className="w-full bg-[#1e1938]/95 backdrop-blur-md border-b border-[#3b3266] text-white shadow-lg relative z-40 font-sans transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left Section: Highlight Discount Code */}
        <div className="flex items-center justify-center md:justify-start">
          {announcement.highlightText && (
            <div className="text-purple-200 font-medium text-xs tracking-normal">
              Use discount code <span className="font-extrabold text-[#ffd700] tracking-wide">' {announcement.highlightText} '</span>
            </div>
          )}
        </div>

        {/* Center Section: Main Description / Message */}
        <div className="flex items-center justify-center text-center">
          <div className="text-purple-100 font-medium tracking-wide">
            {announcement.message || announcement.title}
          </div>
        </div>

        {/* Right Section: Countdown Timer, CTA Button & Close Icon */}
        <div className="flex items-center justify-center md:justify-end gap-4 shrink-0">
          
          {/* Detailed Countdown display: X hours Y minutes Z seconds */}
          {announcement.countdownEnabled && timeLeft && (
            <div className="flex items-center gap-1.5 text-xs font-normal text-purple-200">
              <span><strong className="font-bold text-white text-sm">{timeLeft.hours}</strong> hours</span>
              <span><strong className="font-bold text-white text-sm">{String(timeLeft.minutes).padStart(2, '0')}</strong> minutes</span>
              <span><strong className="font-bold text-white text-sm">{String(timeLeft.seconds).padStart(2, '0')}</strong> seconds</span>
            </div>
          )}

          {/* CTA Button */}
          {announcement.ctaEnabled && announcement.ctaText && (
            <button
              onClick={handleCtaClick}
              className="px-4 py-1.5 rounded-lg bg-[#2e2654] hover:bg-[#3d336e] border border-[#52448a] text-white font-medium text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              {announcement.ctaText}
            </button>
          )}

          {/* Close Dismiss Button */}
          {announcement.dismissible && (
            <button
              onClick={handleDismiss}
              className="text-purple-300 hover:text-white transition-colors cursor-pointer p-0.5"
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
