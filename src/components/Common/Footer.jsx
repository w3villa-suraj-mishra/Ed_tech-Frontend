import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaTwitter, FaGithub, FaLinkedinIn, FaYoutube, FaCode } from "react-icons/fa";

const Footer = ({ logoAsset, socialAssets }) => {
  const currentYear = new Date().getFullYear();
  const { token } = useSelector((state) => state.auth);

  return (
    <footer className="w-full bg-[#070913] text-richblack-300 font-sans border-t border-blue-950/30 relative">
      {/* Top Accent Gradient Line from screenshot */}
      {/* <div className="w-full h-1 bg-gradient-to-r from-blue-900 via-blue-500 to-indigo-600"></div> */}

      <div className="w-11/12 max-w-[1260px] mx-auto py-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-4 border-b border-richblack-800">
          
          {/* Col 1: Brand & Logo Slot & Social Icons */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Logo Slot */}
            <Link to="/" className="flex items-center gap-3 group w-fit">
              {logoAsset ? (
                <img src={logoAsset} alt="CodeLearn Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-blue-400/30 group-hover:scale-105 transition-transform">
                  <FaCode />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-white font-black text-2xl tracking-tight leading-none">
                  CodeLearn
                </span>
                <span className="text-[10px] text-richblack-400 font-medium tracking-widest uppercase mt-1">
                  Learn. Build. Grow.
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-richblack-300 leading-relaxed max-w-sm">
              Empowering learners to achieve their dreams through quality education and hands-on learning.
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-3 mt-2">
              {socialAssets?.twitter ? (
                <a href={socialAssets.twitter} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all">
                  <img src={socialAssets.twitter} alt="Twitter" className="w-4 h-4 object-contain" />
                </a>
              ) : (
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all text-xs">
                  <FaTwitter />
                </a>
              )}

              {socialAssets?.github ? (
                <a href={socialAssets.github} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all">
                  <img src={socialAssets.github} alt="GitHub" className="w-4 h-4 object-contain" />
                </a>
              ) : (
                <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all text-xs">
                  <FaGithub />
                </a>
              )}

              {socialAssets?.linkedin ? (
                <a href={socialAssets.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all">
                  <img src={socialAssets.linkedin} alt="LinkedIn" className="w-4 h-4 object-contain" />
                </a>
              ) : (
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all text-xs">
                  <FaLinkedinIn />
                </a>
              )}

              {socialAssets?.youtube ? (
                <a href={socialAssets.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all">
                  <img src={socialAssets.youtube} alt="YouTube" className="w-4 h-4 object-contain" />
                </a>
              ) : (
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-[#121626] border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 transition-all text-xs">
                  <FaYoutube />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="flex flex-col gap-3 text-xs sm:text-sm">
            <h3 className="text-white font-bold text-sm tracking-wide mb-1">Platform</h3>
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <Link to="/catalog" className="hover:text-white transition-colors">Categories</Link>
            <Link to={token ? "/t/u/activeCourses" : "/login"} className="hover:text-white transition-colors">Active Courses</Link>
            <Link to="/dashboard/my-courses" className="hover:text-white transition-colors">Instructor Courses</Link>
          </div>

          {/* Col 3: Resources / Support */}
          <div className="flex flex-col gap-3 text-xs sm:text-sm">
            <h3 className="text-white font-bold text-sm tracking-wide mb-1">Resources</h3>
            <Link to="/dashboard/help" className="hover:text-white transition-colors">Support & Help</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            <Link to="/dashboard/notifications" className="hover:text-white transition-colors">Notifications</Link>
          </div>

          {/* Col 4: Company */}
          <div className="flex flex-col gap-3 text-xs sm:text-sm">
            <h3 className="text-white font-bold text-sm tracking-wide mb-1">Company</h3>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Become an Instructor</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Privacy & Terms</Link>
          </div>

        </div>

        {/* Dynamic Copyright Footer Line */}
        <div className="pt-8 text-center text-xs text-richblack-400 font-medium">
          <p>© {currentYear} CodeLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
