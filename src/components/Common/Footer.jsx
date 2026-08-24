import React from "react";
import { Link } from "react-router-dom";

import { FaFacebook, FaGoogle, FaTwitter, FaYoutube, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-richblack-800 text-richblack-400 py-12 border-t border-richblack-700">
      <div className="w-11/12 max-w-maxContent mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-10 border-b border-richblack-700 pb-10">
          
          {/* Section 1: Logo and Company Info */}
          <div className="lg:w-[30%] flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    S
                </div>
                <h1 className="text-richblack-50 font-bold text-2xl tracking-tight">study_tech</h1>
            </div>
            <p className="text-[14px] leading-relaxed">
              Empowering the next generation of developers and creators through premium, accessible education. Master the skills you need to build the future.
            </p>
            <div className="flex gap-4 text-lg mt-2">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-richblack-50 transition-all cursor-pointer"><FaFacebook /></a>
              <a href="https://www.google.com" target="_blank" rel="noreferrer" className="hover:text-richblack-50 transition-all cursor-pointer"><FaGoogle /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-richblack-50 transition-all cursor-pointer"><FaTwitter /></a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="hover:text-richblack-50 transition-all cursor-pointer"><FaYoutube /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-richblack-50 transition-all cursor-pointer"><FaGithub /></a>
            </div>
          </div>

          {/* Section 2: Links Columns */}
          <div className="lg:w-[65%] grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1: Platform */}
            <div>
              <h2 className="text-richblack-50 font-semibold text-[16px] mb-4">Platform</h2>
              <ul className="flex flex-col gap-2 text-[14px]">
                {["Browse Catalog", "About Us", "Contact", "Instructor Dashboard"].map((item) => (
                  <li key={item} className="hover:text-richblack-50 transition-all cursor-pointer">
                    <Link to={`/${item.toLowerCase().replace(/ /g, "-")}`}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div>
              <h2 className="text-richblack-50 font-semibold text-[16px] mb-4">Resources</h2>
              <ul className="flex flex-col gap-2 text-[14px]">
                {["Articles", "Blog", "Chart Sheet", "Code Challenges", "Docs"].map((item) => (
                  <li key={item} className="hover:text-richblack-50 transition-all cursor-pointer">
                    <Link to={`/${item.toLowerCase().replace(/ /g, "-")}`}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Plans/Support */}
            <div>
              <h2 className="text-richblack-50 font-semibold text-[16px] mb-4">Support</h2>
              <ul className="flex flex-col gap-2 text-[14px]">
                {["Help Center", "Community", "Paid Memberships", "For Students"].map((item) => (
                  <li key={item} className="hover:text-richblack-50 transition-all cursor-pointer">
                    <Link to={`/${item.toLowerCase().replace(/ /g, "-")}`}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h2 className="text-richblack-50 font-semibold text-[16px] mb-4">Legal</h2>
              <ul className="flex flex-col gap-2 text-[14px]">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                  <li key={item} className="hover:text-richblack-50 transition-all cursor-pointer">
                    <Link to={`/${item.toLowerCase().replace(/ /g, "-")}`}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4 text-[14px]">
          <p>© 2026 CodeLearn. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-richblack-50 transition-all">English</span>
            <span className="cursor-pointer hover:text-richblack-50 transition-all">Privacy</span>
            <span className="cursor-pointer hover:text-richblack-50 transition-all">Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Footer;
