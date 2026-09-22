import React from 'react';
import HighLightText from './HighLightText';
import CTAButton from "./Button";
import { FiTrendingUp, FiAward, FiCalendar, FiCheck, FiClock, FiCpu } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

const LearningLanguageSection = () => {
  return (
    <section className="w-full py-16 lg:py-24 text-center">
      
      {/* Section Header */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#13AA92]/10 text-[#13AA92] text-xs font-semibold px-3.5 py-1 rounded-full border border-[#13AA92]/30 shadow-2xs">
          <FiCpu className="text-xs text-[#13AA92]" />
          <span>Intelligent Learning Tools</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          Your Swiss Knife for <HighLightText text="Mastering Any Skill" />
        </h2>
        <p className="text-base text-gray-600 font-normal leading-relaxed">
          Integrated intelligence tools designed to accelerate comprehension, track milestones, and keep you accountable every single day.
        </p>
      </div>

      {/* 3 Interactive Feature Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12 max-w-6xl mx-auto text-left">
        
        {/* Tool 1: Real-time Progress Tracking */}
        <div className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center text-xl mb-6 shadow-2xs group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300">
              <FiTrendingUp />
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Granular Progress Analytics
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Track module completion, quiz accuracy rates, and line-by-line coding fluency with automated dashboards.
            </p>

            {/* UI Mockup Widget */}
            <div className="rounded-2xl bg-gray-50 border border-gray-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                <span>React Mastery Progress</span>
                <span className="font-bold text-blue-600">82%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="w-[82%] h-full bg-blue-600 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <FaFire className="text-amber-500" /> 14-Day Streak
                </span>
                <span className="flex items-center gap-1">
                  <FiClock /> 18.5 hrs logged
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <FiCheck className="text-emerald-500" />
            <span>Automated milestone sync</span>
          </div>
        </div>

        {/* Tool 2: Peer Leaderboard & Benchmarking */}
        <div className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center text-xl mb-6 shadow-2xs group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300">
              <FiAward />
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Peer Benchmarks & Sprints
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Compare your code execution speed and architectural cleanliness against global cohorts in weekly sprint tests.
            </p>

            {/* UI Mockup Widget */}
            <div className="rounded-2xl bg-gray-50 border border-gray-200/80 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">1</span>
                  <span className="font-medium text-gray-800">Aarav Patel</span>
                </div>
                <span className="text-[11px] font-bold text-blue-600">994 pts</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-blue-50/80 border border-blue-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <span className="font-semibold text-blue-900">You</span>
                </div>
                <span className="text-[11px] font-bold text-blue-600">968 pts</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-gray-100 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center justify-center">3</span>
                  <span className="font-medium text-gray-800">Elena Rostova</span>
                </div>
                <span className="text-[11px] font-bold text-blue-600">942 pts</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <FiCheck className="text-emerald-500" />
            <span>Weekly rank updates</span>
          </div>
        </div>

        {/* Tool 3: Smart Study Schedule */}
        <div className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center text-xl mb-6 shadow-2xs group-hover:bg-[#3BA7F2] group-hover:text-white transition-all duration-300">
              <FiCalendar />
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">
              Adaptive Study Planner
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              AI-driven spaced repetition schedules personalized to your availability, ensuring high retention and zero burnout.
            </p>

            {/* UI Mockup Widget */}
            <div className="rounded-2xl bg-gray-50 border border-gray-200/80 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pb-1">
                <span>Next Up Today</span>
                <span className="text-emerald-600 text-[11px] font-bold">On Schedule</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-gray-200/60 flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Async JavaScript & Promises</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Quiz & 2 Coding Labs • 45 min</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-gray-200/60 flex items-start gap-2.5 opacity-70">
                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
                <div>
                  <h4 className="text-xs font-medium text-gray-700">Database Indexing Deep Dive</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Tomorrow at 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <FiCheck className="text-emerald-500" />
            <span>Calendar & reminder alerts</span>
          </div>
        </div>

      </div>

      {/* Action Button */}
      <div className="mt-12 flex justify-center">
        <CTAButton active={true} linkto="/signup">
          <span>Start Learning Free Today</span>
        </CTAButton>
      </div>

    </section>
  );
};

export default LearningLanguageSection;
