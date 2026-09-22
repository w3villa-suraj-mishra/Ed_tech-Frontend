import React from 'react';
import { Link } from 'react-router-dom';
import Instructor from "../../../assests/Images/Instructor.png";
import { FiUsers, FiDollarSign, FiArrowRight } from "react-icons/fi";

const InstructorSection = () => {
  return (
    <section className="w-full max-w-maxContent mx-auto my-8 px-4">
      <div className="rounded-3xl bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/50 border border-gray-200/90 p-8 sm:p-12 lg:p-14 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Instructor Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-md max-w-md w-full aspect-[4/3] bg-gray-100">
            <img
              src={Instructor}
              alt="Become an Instructor on CodeLearn"
              className="w-full h-full object-cover transform hover:scale-103 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right Side: Copy & Benefits */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-6 text-left">
          
          <div className="inline-flex items-center gap-1.5 bg-[#13AA92]/10 text-[#13AA92] text-xs font-semibold px-3.5 py-1 rounded-full border border-[#13AA92]/30 shadow-2xs">
            <FiUsers className="text-xs text-[#13AA92]" />
            <span>Instructor Community</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Share Your Knowledge & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Teach Millions Worldwide
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            Instructors from top tech firms teach on CodeLearn. We provide the interactive lab player, test builders, analytics, and global student community to help you build an influential educational brand.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-1">
            <div className="bg-white border border-gray-200/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs group hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center text-lg shrink-0 group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300">
                <FiUsers />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block group-hover:text-[#3BA7F2] transition-colors">Global Reach</span>
                <span className="text-[11px] text-gray-500">50K+ Active Engineers</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs group hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center text-lg shrink-0 group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300">
                <FiDollarSign />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block group-hover:text-[#3BA7F2] transition-colors">Top Revenue Share</span>
                <span className="text-[11px] text-gray-500">Earn monthly recurring income</span>
              </div>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className="pt-2">
            <Link to="/signup">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 group">
                <span>Start Teaching Today</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};

export default InstructorSection;
