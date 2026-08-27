import React from 'react';
import { Link } from 'react-router-dom';
import Instructor from "../../../assests/Images/Instructor.png";
import { FaGraduationCap, FaChalkboardTeacher, FaUsers, FaArrowRight } from "react-icons/fa";

const InstructorSection = () => {
  return (
    <div className='w-full max-w-[1260px] mx-auto my-6 px-4'>
      <div className='bg-[#0e111f] border border-purple-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col lg:flex-row items-center justify-between gap-12'>
        
        {/* Left Side: Instructor Image with Purple Glow Card */}
        <div className='lg:w-1/2 relative flex justify-center'>
          <div className='relative z-10 rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.25)] max-w-md w-full aspect-[4/3] bg-purple-900/20'>
            <img
              src={Instructor}
              alt="Become an Instructor"
              className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-500'
            />
          </div>
          {/* Subtle Ambient Background Radial Glow */}
          <div className="absolute inset-0 bg-purple-600/10 blur-3xl rounded-full -z-0"></div>
        </div>

        {/* Right Side: Copy & Actions */}
        <div className='lg:w-1/2 flex flex-col items-start gap-6 text-left'>
          
          <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
            <span>Become An Instructor</span>
          </div>

          <h2 className='text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight'>
            Share Your Knowledge & <br className="hidden sm:inline" />
            <span className='bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent'>
              Teach Millions Worldwide
            </span>
          </h2>

          <p className='text-xs sm:text-sm text-richblack-300 leading-relaxed max-w-xl'>
            Instructors from around the world teach millions of learners on CodeLearn. We provide the tools, course player, and global audience to help you share what you love and build your online teaching brand.
          </p>

          {/* Highlights Row */}
          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <div className="bg-[#141728] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center text-lg shrink-0">
                🎓
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Reach Millions</span>
                <span className="text-[10px] text-richblack-400">Global student audience</span>
              </div>
            </div>

            <div className="bg-[#141728] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center text-lg shrink-0">
                💡
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Flexible Teaching</span>
                <span className="text-[10px] text-richblack-400">Teach at your own pace</span>
              </div>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className='pt-2'>
            <Link to="/signup">
              <button className='flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95 group'>
                <span>Start Teaching Today</span>
                <span className='group-hover:translate-x-1 transition-transform'>→</span>
              </button>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InstructorSection;
