import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { practiceEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';
import {
  FiArrowLeft,
  FiClock,
  FiAward,
  FiPlay,
  FiCheckCircle,
  FiHelpCircle,
  FiZap,
  FiBookOpen,
  FiSearch,
  FiCompass,
  FiRotateCcw,
  FiArrowRight,
  FiSliders,
  FiActivity
} from 'react-icons/fi';

const TEST_CATEGORIES = [
  { id: 'All', label: 'All Tests', queryVal: '' },
  { id: 'MCQ', label: 'MCQ Practice', queryVal: 'MCQ' },
  { id: 'Coding', label: 'Coding Practice', queryVal: 'Coding' },
  { id: 'Mock Test', label: 'Mock Tests', queryVal: 'Mock Test' },
  { id: 'Interview Test', label: 'Interview Prep', queryVal: 'Interview Test' },
  { id: 'Daily Quiz', label: 'Daily Quizzes', queryVal: 'Daily Quiz' }
];

export default function PracticeTestsPage({ defaultType }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const initialType = searchParams.get('type') || defaultType || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync category with URL search param
  useEffect(() => {
    const typeParam = searchParams.get('type') || defaultType;
    if (typeParam) {
      setSelectedCategory(typeParam);
    }
  }, [searchParams, defaultType]);

  useEffect(() => {
    fetchTests();
  }, [token]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await apiConnector('GET', `${practiceEndpoints.GET_PRACTICE_TESTS}?status=Published`, null, headers);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTests(res.data.data);
      } else {
        setTests([]);
      }
    } catch (err) {
      console.error('Failed to load practice tests:', err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'All') {
      searchParams.delete('type');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ type: catId });
    }
  };

  const filteredTests = tests.filter((test) => {
    // Category filter
    const matchesCategory =
      selectedCategory === 'All' ||
      (test.testType && test.testType.toLowerCase() === selectedCategory.toLowerCase()) ||
      (test.category?.name && test.category.name.toLowerCase() === selectedCategory.toLowerCase());

    // Search query
    const matchesSearch =
      !searchQuery.trim() ||
      (test.title && test.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getActiveCategoryTitle = () => {
    const cat = TEST_CATEGORIES.find(
      (c) => c.id.toLowerCase() === selectedCategory.toLowerCase()
    );
    return cat ? cat.label : selectedCategory;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="bg-white border-b border-gray-200/80 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/practice')}
              className="p-2 rounded-xl text-gray-500 hover:text-[#3BA7F2] hover:bg-blue-50/60 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Return to Practice Center"
            >
              <FiArrowLeft className="text-base" />
              <span>Back to Practice Center</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-gray-900">{getActiveCategoryTitle()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/practice/attempts"
              className="text-xs font-bold text-gray-600 hover:text-[#3BA7F2] px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-200 bg-white shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <FiRotateCcw className="text-xs text-[#3BA7F2]" />
              <span className="hidden sm:inline">My Past</span> Attempts
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 2. HERO INTRO BANNER */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
          {/* Subtle Ambient Glows */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#3BA7F2]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-10 w-60 h-60 bg-[#13AA92]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#3BA7F2]/20 border border-[#3BA7F2]/30 text-[#60A5FA] text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
              <FiZap className="text-xs text-amber-400" />
              <span>Interactive Assessments & Mocks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {getActiveCategoryTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Test your technical comprehension, measure your accuracy against time limits, and build interview confidence with realistic test simulations.
            </p>
          </div>
        </div>

        {/* 3. CONTROLS: CATEGORY PILLS & SEARCH BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TEST_CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap border shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#3BA7F2] text-white border-[#3BA7F2] shadow-sm shadow-[#3BA7F2]/20'
                      : 'bg-white text-gray-600 border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by keyword..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200/90 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#3BA7F2] focus:ring-2 focus:ring-[#3BA7F2]/10 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* 4. MAIN CONTENT AREA */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200/80 rounded-2xl p-6 space-y-4 animate-pulse shadow-2xs"
              >
                <div className="flex justify-between items-center">
                  <div className="w-16 h-5 bg-gray-200 rounded-full" />
                  <div className="w-12 h-4 bg-gray-100 rounded-md" />
                </div>
                <div className="w-3/4 h-5 bg-gray-200 rounded-md" />
                <div className="w-full h-10 bg-gray-100 rounded-md" />
                <div className="flex gap-4 pt-3 border-t border-gray-100">
                  <div className="w-1/3 h-4 bg-gray-100 rounded-md" />
                  <div className="w-1/3 h-4 bg-gray-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTests.length > 0 ? (
          /* Tests Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-gray-200/80 hover:border-blue-200 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3BA7F2] border border-blue-100">
                      {test.testType || 'Practice Test'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {test.questions?.length || test.numberOfQuestions || 0} Questions
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#3BA7F2] transition-colors leading-snug">
                    {test.title}
                  </h3>

                  <p className="text-xs text-gray-500 font-normal leading-relaxed line-clamp-2">
                    {test.description || 'Comprehensive assessment designed to evaluate and sharpen core engineering skills.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <FiClock className="text-[#3BA7F2]" />
                      <span>{test.duration || 15} Mins</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <FiAward className="text-amber-500" />
                      <span>{test.totalMarks || 100} Marks</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <FiCheckCircle className="text-emerald-500" />
                      <span>{test.passingPercentage || 60}% Pass</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/s/courses/global/take/pratice-test/${test.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-[#3BA7F2] hover:bg-[#13AA92] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs group-hover:shadow-md"
                  >
                    <span>Start Test</span>
                    <FiPlay className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================
             5. RICH, PREMIUM EMPTY STATE (SOLVES THE EMPTY VOID ISSUE)
          ======================================================== */
          <div className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-12 shadow-xs text-center space-y-8 relative overflow-hidden">
            
            {/* Subtle Decorative Background Wave */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

            {/* Central Icon Illustration */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-50 via-indigo-50 to-[#3BA7F2]/10 border border-blue-100 flex items-center justify-center shadow-xs">
                  <FiCompass className="text-3xl text-[#3BA7F2] animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  <FiZap />
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                No {getActiveCategoryTitle()} Available Right Now
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-lg mx-auto font-normal leading-relaxed">
                Our curriculum team is currently curating fresh tests, interview questions, and challenges for this category. In the meantime, you can explore our other active practice modules below!
              </p>

              {/* Reset or Change Category Button */}
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => handleCategoryChange('All')}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#3BA7F2] hover:text-[#13AA92] bg-blue-50 hover:bg-blue-100/70 border border-blue-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <FiSliders className="text-xs" />
                  <span>View All Categories</span>
                </button>
              )}
            </div>

            {/* QUICK ALTERNATIVES CARDS (3 Interactive Shortcuts) */}
            <div className="relative z-10 pt-4">
              <div className="text-left mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  Recommended Learning & Practice Alternatives
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* 1. Daily Quiz Shortcut */}
                <div
                  onClick={() => navigate('/practice/daily-quiz')}
                  className="p-5 rounded-2xl border border-gray-200/90 hover:border-amber-300 bg-gradient-to-b from-white to-amber-50/20 hover:to-amber-50/40 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-base">
                      <FiZap />
                    </div>
                    <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-amber-600 transition-colors">
                      Daily Coding Quiz
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      Quick 5-minute timed challenges to maintain your problem-solving streak.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>Take Today's Quiz</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Topic Practice Shortcut */}
                <div
                  onClick={() => navigate('/practice/topic')}
                  className="p-5 rounded-2xl border border-gray-200/90 hover:border-emerald-300 bg-gradient-to-b from-white to-emerald-50/20 hover:to-emerald-50/40 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-base">
                      <FiBookOpen />
                    </div>
                    <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
                      Topic-Wise Practice
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      Filter questions by technology, difficulty, and concept to target weak spots.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>Practice by Topic</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Browse Courses Shortcut */}
                <div
                  onClick={() => navigate('/courses')}
                  className="p-5 rounded-2xl border border-gray-200/90 hover:border-blue-300 bg-gradient-to-b from-white to-blue-50/20 hover:to-blue-50/40 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#3BA7F2] flex items-center justify-center text-base">
                      <FiActivity />
                    </div>
                    <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-[#3BA7F2] transition-colors">
                      Course Curriculum Tests
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      Enroll in top-rated courses with instructor-graded assessments and quizzes.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#3BA7F2]">
                    <span>Browse All Courses</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Center Button */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/practice')}
                className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <FiArrowLeft className="text-sm" />
                <span>Return to Practice Center</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
