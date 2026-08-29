import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { practiceEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';

import { 
  FaBolt, 
  FaBookReader, 
  FaClipboardList, 
  FaAward, 
  FaLaptopCode, 
  FaUserFriends, 
  FaHistory as FaHistoryIcon, 
  FaArrowRight as FaArrowRightIcon
} from 'react-icons/fa';

export default function PracticeCenter() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication Guard: Redirect unauthenticated users immediately to /login
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      fetchOverviewData();
    }
  }, [token]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', practiceEndpoints.GET_PRACTICE_OVERVIEW, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error("Error loading practice overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      id: 'mcq-tests',
      title: 'MCQ Practice',
      count: 'Multiple Choice Quizzes',
      desc: 'Test your knowledge across foundational and advanced concepts.',
      icon: <FaClipboardList className="text-cyan-400 text-2xl" />,
      tag: 'QUIZ',
      link: '/practice/tests?type=MCQ'
    },
    {
      id: 'coding-problems',
      title: 'Coding Practice',
      count: `${overview?.codingCount ?? 0} Challenges`,
      desc: 'Solve interactive algorithmic & web development programming problems.',
      icon: <FaLaptopCode className="text-blue-400 text-2xl" />,
      tag: 'HANDS-ON',
      link: '/practice/coding'
    },
    {
      id: 'daily-quiz',
      title: 'Daily Quiz',
      count: `${overview?.dailyQuizCount ?? 0} Active ${overview?.dailyQuizCount === 1 ? 'Quiz' : 'Quizzes'}`,
      desc: 'Quick 5-minute daily challenges to keep your coding skills sharp.',
      icon: <FaBolt className="text-[#FFD60A] text-2xl" />,
      tag: 'FREE DAILY',
      link: '/practice/daily-quiz'
    },
    {
      id: 'topic-practice',
      title: 'Topic Practice',
      count: `${overview?.topicPracticeCount ?? 0} Topics Available`,
      desc: 'Filter questions by category, topic, and difficulty to master specific concepts.',
      icon: <FaBookReader className="text-[#3b82f6] text-2xl" />,
      tag: 'CONCEPT-WISE',
      link: '/practice/topic'
    },
    {
      id: 'mock-tests',
      title: 'Mock Tests',
      count: `${overview?.mockTestCount ?? 0} Full Mocks`,
      desc: 'Full-length timed exams simulating real interview assessments.',
      icon: <FaAward className="text-emerald-400 text-2xl" />,
      tag: 'TIMED EXAMS',
      link: '/practice/tests?type=Mock Test'
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      count: `${overview?.interviewCount ?? 0} Questions`,
      desc: 'Top tech company interview questions with detailed solution breakdowns.',
      icon: <FaUserFriends className="text-indigo-400 text-2xl" />,
      tag: 'CAREER READY',
      link: '/practice/interview'
    },
  ];

  return (
    <div className="min-h-screen bg-richblack-900 text-white font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1260px] mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#111422] via-[#1a1435] to-[#111422] border border-blue-500/20 p-8 sm:p-10 shadow-[0_0_30px_rgba(37, 99, 235,0.15)] overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl -z-0"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[#3b82f6] text-xs font-bold mb-4">
              <span>🚀 100% FREE FOR ALL LOGGED-IN LEARNERS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              CodeLearn <span className="text-[#3b82f6]">Practice Center</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-richblack-300 leading-relaxed font-medium">
              Sharpen your coding skills with daily quizzes, topic tests, full-length mock exams, and real tech interview questions. Unlimited attempts with instant dynamic score analytics.
            </p>
          </div>
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(card.link)}
              className="group bg-[#111422] border border-white/10 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(37, 99, 235,0.2)] flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-richblack-300 tracking-wider">
                    {card.tag}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-[#3b82f6] transition-colors">
                  {card.title}
                </h2>
                <p className="text-xs text-[#3b82f6] font-semibold mt-0.5 mb-3 h-4 flex items-center">
                  {loading ? (
                    <span className="w-16 h-3 bg-blue-500/20 rounded animate-pulse inline-block"></span>
                  ) : (
                    card.count
                  )}
                </p>
                <p className="text-xs text-richblack-300 leading-relaxed font-medium mb-6">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-white group-hover:text-[#3b82f6]">
                <span>Start Practicing</span>
                <FaArrowRightIcon className="group-hover:translate-x-1 transition-transform text-[#3b82f6]" />
              </div>
            </div>
          ))}
        </div>

        {/* Previous Attempts & Analytics Bar */}
        <div className="bg-[#111422] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#3b82f6] text-2xl">
              <FaHistoryIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Your Previous Attempts & Detailed Analytics</h3>
              <p className="text-xs text-richblack-300">
                Review scores, time taken, accuracy percentage, and strong/weak topic breakdowns.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/practice/attempts')}
            className="w-full sm:w-auto px-6 py-3 bg-[#3b82f6] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            View Attempts History ({overview?.userAttemptsCount || 0})
          </button>
        </div>

      </div>
    </div>
  );
}
