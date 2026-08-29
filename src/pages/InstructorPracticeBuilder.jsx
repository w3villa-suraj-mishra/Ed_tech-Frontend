import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { courseEndpoints, practiceEndpoints } from '../services/apis';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaBook, FaClock, FaAward, FaSearch, FaFilter, FaCheckCircle,
  FaTimesCircle, FaEye, FaEdit, FaTrash, FaListUl, FaQuestionCircle,
  FaUserGraduate, FaCode, FaCommentDots, FaArrowLeft,
} from 'react-icons/fa';
import TestBuilderWizard from '../components/common/TestBuilderWizard';

export default function InstructorPracticeBuilder() {
  const { token } = useSelector((state) => state.auth);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('my-practice'); // 'my-practice' | 'question-bank' | 'create-test' | 'create-question' | 'attempts'

  // Dynamic Instructor Courses
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Data States
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedTestForAttempts, setSelectedTestForAttempts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Multiple Selection / Bulk Delete States
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [selectedQuestionIdsForDelete, setSelectedQuestionIdsForDelete] = useState([]);

  // Question Filters
  const [qSearch, setQSearch] = useState('');
  const [qTypeFilter, setQTypeFilter] = useState('');
  const [qDifficultyFilter, setQDifficultyFilter] = useState('');

  // Create Question Form State
  const [qForm, setQForm] = useState({
    title: '',
    type: 'MCQ',
    courseId: '',
    difficulty: 'Easy',
    explanation: '',
    marks: 1,
    negativeMarks: 0,
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
    ],
    codingDetails: { language: 'javascript', problemStatement: '', starterCode: '', testCases: '' },
    interviewDetails: { expectedAnswer: '', keyPoints: '' }
  });

  // Test Builder Wizard Modal
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  useEffect(() => {
    if (token) {
      fetchInstructorTests();
      fetchInstructorQuestions();
    }
  }, [token, selectedCourseId]);

  // Step 2: Dynamic Instructor Courses
  const fetchInstructorCourses = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', courseEndpoints.GET_ALL_INSTRUCTOR_COURSES_API, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        const fetchedCourses = res.data.data || [];
        setCourses(fetchedCourses);
        if (fetchedCourses.length > 0) {
          const firstId = fetchedCourses[0]._id || fetchedCourses[0].id;
          setSelectedCourseId(firstId);
          setQForm((prev) => ({ ...prev, courseId: firstId }));
        }
      }
    } catch (err) {
      console.error('Fetch instructor courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorTests = async (overrideCourseId = null) => {
    try {
      const activeId = overrideCourseId || selectedCourseId;
      console.log('[COURSE TEST LIST FETCH] activeId=', activeId);
      const url = activeId
        ? `${practiceEndpoints.INSTRUCTOR_GET_TESTS}?courseId=${activeId}`
        : practiceEndpoints.INSTRUCTOR_GET_TESTS;
      const res = await apiConnector('GET', url, null, {
        Authorization: `Bearer ${token}`
      });
      console.log('[COURSE TEST LIST RESPONSE]', res.data);
      if (res.data?.success) {
        setTests(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch instructor tests error:', err);
    }
  };

  const fetchInstructorQuestions = async () => {
    try {
      const activeId = selectedCourseId;
      const url = activeId
        ? `${practiceEndpoints.INSTRUCTOR_GET_QUESTIONS}?courseId=${activeId}`
        : practiceEndpoints.INSTRUCTOR_GET_QUESTIONS;
      const res = await apiConnector('GET', url, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setQuestions(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch instructor questions error:', err);
    }
  };

  // Single & Bulk Delete Practice Tests
  const handleSingleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      const res = await apiConnector(
        'DELETE',
        `${practiceEndpoints.ADMIN_TESTS}/${testId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (res.data?.success) {
        toast.success('Test deleted successfully');
        setSelectedTestIds((prev) => prev.filter((id) => id !== testId));
        fetchInstructorTests();
      }
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  const handleBulkDeleteTests = async () => {
    if (selectedTestIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTestIds.length} selected test(s)?`)) return;
    try {
      const res = await apiConnector(
        'POST',
        practiceEndpoints.ADMIN_BULK_DELETE_TESTS,
        { testIds: selectedTestIds },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data?.success) {
        toast.success(res.data.message || 'Selected tests deleted successfully');
        setSelectedTestIds([]);
        fetchInstructorTests();
      }
    } catch (err) {
      toast.error('Failed to delete selected tests');
    }
  };

  // Single & Bulk Delete Questions
  const handleBulkDeleteQuestions = async () => {
    if (selectedQuestionIdsForDelete.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedQuestionIdsForDelete.length} selected question(s)?`)) return;
    try {
      const res = await apiConnector(
        'POST',
        practiceEndpoints.ADMIN_BULK_DELETE_QUESTIONS,
        { questionIds: selectedQuestionIdsForDelete },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data?.success) {
        toast.success(res.data.message || 'Selected questions deleted successfully');
        setSelectedQuestionIdsForDelete([]);
        fetchInstructorQuestions();
      }
    } catch (err) {
      toast.error('Failed to delete selected questions');
    }
  };

  // Toggle Test Status (Publish / Unpublish Draft)
  const handleToggleStatus = async (testId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const res = await apiConnector(
        'PATCH',
        `${practiceEndpoints.INSTRUCTOR_TOGGLE_TEST_STATUS}${testId}/status`,
        { status: newStatus },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data?.success) {
        toast.success(`Test updated to ${newStatus}`);
        fetchInstructorTests();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // View Student Attempts for a Test
  const handleViewAttempts = async (test) => {
    setSelectedTestForAttempts(test);
    setActiveTab('attempts');
    try {
      const res = await apiConnector(
        'GET',
        `${practiceEndpoints.INSTRUCTOR_GET_TEST_ATTEMPTS}${test.id}/attempts`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (res.data?.success) {
        setAttempts(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load student attempts');
    }
  };

  // Question Form Helpers & Validations
  const handleAddMcqOption = () => {
    setQForm((prev) => ({
      ...prev,
      options: [...prev.options, { optionText: '', isCorrect: false }]
    }));
  };

  const handleRemoveMcqOption = (index) => {
    if (qForm.options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    const updated = qForm.options.filter((_, i) => i !== index);
    // Ensure at least one remains correct if removed option was correct
    const hasCorrect = updated.some((o) => o.isCorrect);
    if (!hasCorrect && updated.length > 0) {
      updated[0].isCorrect = true;
    }
    setQForm((prev) => ({ ...prev, options: updated }));
  };

  const handleQuestionTypeChange = (newType) => {
    if (newType === 'True/False') {
      setQForm((prev) => ({
        ...prev,
        type: newType,
        options: [
          { optionText: 'True', isCorrect: true },
          { optionText: 'False', isCorrect: false }
        ]
      }));
    } else if (newType === 'MCQ') {
      setQForm((prev) => ({
        ...prev,
        type: newType,
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false }
        ]
      }));
    } else {
      setQForm((prev) => ({ ...prev, type: newType, options: [] }));
    }
  };

  const validateQuestionForm = () => {
    const targetCourseId = qForm.courseId || selectedCourseId;
    if (!targetCourseId) {
      toast.error('Please select a course for this question');
      return false;
    }
    if (!qForm.title || !qForm.title.trim()) {
      toast.error('Question title is required');
      return false;
    }
    if (!qForm.marks || qForm.marks <= 0) {
      toast.error('Valid marks are required');
      return false;
    }

    if (qForm.type === 'MCQ') {
      if (qForm.options.length < 2) {
        toast.error('MCQ requires at least 2 options');
        return false;
      }
      for (let i = 0; i < qForm.options.length; i++) {
        if (!qForm.options[i].optionText.trim()) {
          toast.error(`Option ${i + 1} text is required`);
          return false;
        }
      }
      const correctCount = qForm.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        toast.error('Exactly one option must be marked as correct');
        return false;
      }
    }

    return true;
  };

  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Submit Question (Single or Save & Add Another)
  const saveQuestion = async (shouldAddAnother = false) => {
    if (isSubmittingQuestion) return; // Prevent duplicate rapid submission
    if (!validateQuestionForm()) return;

    setIsSubmittingQuestion(true);
    const targetCourseId = qForm.courseId || selectedCourseId;
    try {
      const payload = {
        ...qForm,
        courseId: targetCourseId,
      };

      const res = await apiConnector('POST', practiceEndpoints.INSTRUCTOR_GET_QUESTIONS, payload, {
        Authorization: `Bearer ${token}`
      });

      if (res.data?.success) {
        toast.success('Question saved to Question Bank! 🎯');
        
        // Immediate state update (Real-time addition)
        const savedQ = res.data.data;
        if (savedQ) {
          setQuestions((prev) => [savedQ, ...prev]);
        } else {
          fetchInstructorQuestions();
        }

        // Reset form for next question
        setQForm({
          title: '',
          type: qForm.type, // keep chosen question type
          courseId: targetCourseId,
          difficulty: 'Easy',
          explanation: '',
          marks: 1,
          negativeMarks: 0,
          options: qForm.type === 'True/False' ? [
            { optionText: 'True', isCorrect: true },
            { optionText: 'False', isCorrect: false }
          ] : [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false },
          ],
          codingDetails: { language: 'javascript', problemStatement: '', starterCode: '', testCases: '' },
          interviewDetails: { expectedAnswer: '', keyPoints: '' }
        });

        if (!shouldAddAnother) {
          setActiveTab('question-bank');
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create question');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title?.toLowerCase().includes(qSearch.toLowerCase());
    const matchesType = qTypeFilter ? q.type === qTypeFilter : true;
    const matchesDiff = qDifficultyFilter ? q.difficulty === qDifficultyFilter : true;
    return matchesSearch && matchesType && matchesDiff;
  });

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-4 sm:p-8 font-sans space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2C333F] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            Practice Management 🎯
          </h1>
          <p className="text-xs text-[#AFB2BF] mt-1">
            Manage course-specific tests, question banks, quizzes, and monitor student performance.
          </p>
        </div>

        {/* Dynamic Instructor Course Selector */}
        <div className="flex items-center gap-3 bg-[#161D29] border border-[#2C333F] p-2 px-4 rounded-2xl">
          <span className="text-xs font-bold text-[#AFB2BF] uppercase tracking-wider">Active Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setQForm((prev) => ({ ...prev, courseId: e.target.value }));
            }}
            className="bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-1.5 text-xs font-bold text-[#FFD60A] focus:outline-none"
          >
            {courses.length === 0 ? (
              <option value="">No Courses Created Yet</option>
            ) : (
              courses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.courseName}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#2C333F] pb-2">
        {[
          { id: 'my-practice', label: 'My Practice', icon: <FaListUl /> },
          { id: 'question-bank', label: 'Question Bank', icon: <FaQuestionCircle /> },
          { id: 'create-test', label: 'Create Test / Quiz', icon: <FaPlus /> },
          { id: 'create-question', label: 'Add Question', icon: <FaPlus /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#161D29] text-[#AFB2BF] hover:bg-[#2C333F] hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MY PRACTICE MANAGEMENT LIST */}
      {activeTab === 'my-practice' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-[#2C333F] pb-3">
            {['All', 'MCQ', 'Coding', 'Topic Practice', 'Mock Test', 'Interview Test', 'Daily Quiz'].map((cat) => (
              <button
                key={cat}
                onClick={() => setQTypeFilter(cat === 'All' ? '' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  (qTypeFilter === cat || (cat === 'All' && !qTypeFilter))
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-[#161D29] text-[#AFB2BF] border border-[#2C333F] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Course Practice Tests & Quizzes</h2>
              {tests.length > 0 && (
                <button
                  onClick={() => {
                    const visibleTests = tests.filter(t => !qTypeFilter || t.testType === qTypeFilter);
                    const visibleIds = visibleTests.map(t => t.id);
                    const allSelected = visibleIds.every(id => selectedTestIds.includes(id));
                    if (allSelected) {
                      setSelectedTestIds(prev => prev.filter(id => !visibleIds.includes(id)));
                    } else {
                      setSelectedTestIds(prev => Array.from(new Set([...prev, ...visibleIds])));
                    }
                  }}
                  className="px-3 py-1.5 bg-[#161D29] border border-[#2C333F] text-xs font-bold text-[#AFB2BF] hover:text-white rounded-xl transition"
                >
                  {tests.filter(t => !qTypeFilter || t.testType === qTypeFilter).every(t => selectedTestIds.includes(t.id)) ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedTestIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteTests}
                  className="px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl hover:bg-red-600/30 flex items-center gap-2 transition"
                >
                  <FaTrash /> Delete Selected ({selectedTestIds.length})
                </button>
              )}
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-4 py-2 bg-[#FFD60A] text-black text-xs font-bold rounded-xl hover:bg-yellow-400 flex items-center gap-2 shadow-md"
              >
                <FaPlus /> Create New Test
              </button>
            </div>
          </div>

          {(() => {
            const filteredTests = tests.filter(t => !qTypeFilter || t.testType === qTypeFilter);
            if (filteredTests.length === 0) {
              return (
                <div className="p-12 text-center bg-[#161D29] border border-[#2C333F] rounded-3xl space-y-3">
                  <div className="text-4xl">📝</div>
                  <h3 className="text-base font-bold text-white">No Practice Tests Found</h3>
                  <p className="text-xs text-[#AFB2BF]">
                    {qTypeFilter
                      ? `No practice tests created for category "${qTypeFilter}".`
                      : 'Create course tests or quizzes to help your enrolled students practice.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                <div key={test.id} className={`bg-[#161D29] border rounded-3xl p-6 flex flex-col justify-between space-y-4 transition-all relative ${
                  selectedTestIds.includes(test.id) ? 'border-purple-500 bg-purple-500/5' : 'border-[#2C333F] hover:border-purple-500/50'
                }`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTestIds.includes(test.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTestIds((prev) => [...prev, test.id]);
                            } else {
                              setSelectedTestIds((prev) => prev.filter((id) => id !== test.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-600 bg-[#090D16] text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {test.testType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          test.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {test.status?.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleSingleDeleteTest(test.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete Test"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">{test.title}</h3>
                    <p className="text-xs text-[#AFB2BF] line-clamp-2">{test.description || 'No description provided.'}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#2C333F] text-[11px] text-[#AFB2BF]">
                    <div>
                      <span className="block text-[10px] text-gray-500">Duration</span>
                      <span className="font-bold text-white">{test.duration} Mins</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500">Marks</span>
                      <span className="font-bold text-white">{test.totalMarks}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500">Questions</span>
                      <span className="font-bold text-white">{test.questions?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => handleToggleStatus(test.id, test.status)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                        test.status === 'published'
                          ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                          : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {test.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleViewAttempts(test)}
                      className="flex-1 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <FaUserGraduate /> Attempts
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'question-bank' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#161D29] border border-[#2C333F] p-4 rounded-2xl">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-3 text-[#AFB2BF] text-xs" />
              <input
                type="text"
                placeholder="Search questions..."
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={qTypeFilter}
                onChange={(e) => setQTypeFilter(e.target.value)}
                className="bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="True/False">True/False</option>
                <option value="Coding">Coding</option>
                <option value="Interview">Interview</option>
              </select>
              <select
                value={qDifficultyFilter}
                onChange={(e) => setQDifficultyFilter(e.target.value)}
                className="bg-[#090D16] border border-[#2C333F] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {selectedQuestionIdsForDelete.length > 0 && (
                <button
                  onClick={handleBulkDeleteQuestions}
                  className="px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold rounded-xl hover:bg-red-600/30 flex items-center gap-1.5 whitespace-nowrap transition"
                >
                  <FaTrash /> Delete Selected ({selectedQuestionIdsForDelete.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('create-question')}
                className="px-4 py-2 bg-[#FFD60A] text-black text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5"
              >
                <FaPlus /> Add Question
              </button>
            </div>
          </div>

          <div className="bg-[#161D29] border border-[#2C333F] rounded-3xl overflow-hidden">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#AFB2BF]">No questions found in the Question Bank.</div>
            ) : (
              <div className="divide-y divide-[#2C333F]">
                <div className="p-3 bg-[#090D16] border-b border-[#2C333F] flex items-center justify-between px-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#AFB2BF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filteredQuestions.length > 0 && filteredQuestions.every(q => selectedQuestionIdsForDelete.includes(q.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const fIds = filteredQuestions.map(q => q.id);
                          setSelectedQuestionIdsForDelete(prev => Array.from(new Set([...prev, ...fIds])));
                        } else {
                          const fIds = filteredQuestions.map(q => q.id);
                          setSelectedQuestionIdsForDelete(prev => prev.filter(id => !fIds.includes(id)));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-600 bg-[#161D29] text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    Select All Questions
                  </label>
                  <span className="text-[11px] text-gray-500">{filteredQuestions.length} Questions</span>
                </div>
                {filteredQuestions.map((q) => (
                  <div key={q.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1C2432] transition ${
                    selectedQuestionIdsForDelete.includes(q.id) ? 'bg-purple-500/5' : ''
                  }`}>
                    <div className="flex items-start sm:items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIdsForDelete.includes(q.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIdsForDelete((prev) => [...prev, q.id]);
                          } else {
                            setSelectedQuestionIdsForDelete((prev) => prev.filter((id) => id !== q.id));
                          }
                        }}
                        className="w-4 h-4 mt-1 sm:mt-0 rounded border-gray-600 bg-[#090D16] text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">{q.type}</span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">{q.difficulty}</span>
                          <span className="text-[10px] text-gray-400">{q.marks} Mark(s)</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{q.title}</p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CREATE TEST / QUIZ (Renders Wizard Trigger) */}
      {activeTab === 'create-test' && (
        <div className="max-w-xl mx-auto text-center p-10 bg-[#161D29] border border-[#2C333F] rounded-3xl space-y-4 shadow-xl">
          <div className="text-4xl">🚀</div>
          <h2 className="text-xl font-bold text-white">Unified Test Builder Wizard</h2>
          <p className="text-xs text-[#AFB2BF]">
            Build practice tests, quizzes, and assessments with step-by-step guidance and inline question creation.
          </p>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-6 py-3 bg-[#FFD60A] text-black text-xs font-bold rounded-xl hover:bg-yellow-400 shadow-lg transition"
          >
            Open Test Builder Wizard
          </button>
        </div>
      )}

      {/* TAB 4: ADD QUESTION (DYNAMIC MULTI-OPTION & DYNAMIC TYPES) */}
      {activeTab === 'create-question' && (
        <div className="max-w-3xl space-y-6 bg-[#161D29] border border-[#2C333F] p-6 sm:p-8 rounded-3xl shadow-xl">
          <h2 className="text-xl font-bold text-white border-b border-[#2C333F] pb-4">
            Add New Question
          </h2>

          <div className="space-y-5">
            {/* Question Type */}
            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Question Type</label>
              <select
                value={qForm.type}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
              >
                <option value="MCQ">MCQ (Multiple Choice)</option>
                <option value="True/False">True / False</option>
                <option value="Coding">Coding Problem</option>
                <option value="Interview">Interview Question</option>
              </select>
            </div>

            {/* Question Title / Statement */}
            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
                {qForm.type === 'Coding' ? 'Problem Title *' : 'Question / Prompt *'}
              </label>
              <input
                required
                type="text"
                placeholder={
                  qForm.type === 'Coding'
                    ? 'e.g. Write a function to reverse a string'
                    : 'e.g. What is the output of useEffect with empty dependency array?'
                }
                value={qForm.title}
                onChange={(e) => setQForm({ ...qForm, title: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            {/* Difficulty & Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={qForm.difficulty}
                  onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Marks</label>
                <input
                  type="number"
                  min={1}
                  value={qForm.marks}
                  onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* TYPE 1: MCQ DYNAMIC OPTIONS */}
            {qForm.type === 'MCQ' && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider">
                    Answer Options (Select exactly 1 correct answer)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMcqOption}
                    className="px-3 py-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <FaPlus /> Add Option
                  </button>
                </div>

                <div className="space-y-2">
                  {qForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOptionRadio"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const updated = qForm.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                          setQForm({ ...qForm, options: updated });
                        }}
                        className="accent-[#FFD60A] w-4 h-4 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt.optionText}
                        onChange={(e) => {
                          const updated = [...qForm.options];
                          updated[idx].optionText = e.target.value;
                          setQForm({ ...qForm, options: updated });
                        }}
                        className="flex-1 bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                      />
                      {qForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMcqOption(idx)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
                          title="Remove option"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TYPE 2: TRUE / FALSE */}
            {qForm.type === 'True/False' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider">Correct Answer</label>
                <div className="flex gap-4">
                  {qForm.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex-1 p-3.5 rounded-xl border text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition ${
                        opt.isCorrect
                          ? 'bg-purple-600/30 border-purple-500 text-white'
                          : 'bg-[#090D16] border-[#2C333F] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="trueFalseRadio"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const updated = qForm.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                          setQForm({ ...qForm, options: updated });
                        }}
                        className="accent-[#FFD60A]"
                      />
                      {opt.optionText}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TYPE 3: CODING PROBLEM */}
            {qForm.type === 'Coding' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Problem Statement</label>
                  <textarea
                    rows={3}
                    placeholder="Describe input format, output format, constraints..."
                    value={qForm.codingDetails?.problemStatement || ''}
                    onChange={(e) =>
                      setQForm({
                        ...qForm,
                        codingDetails: { ...qForm.codingDetails, problemStatement: e.target.value }
                      })
                    }
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Starter Code</label>
                  <textarea
                    rows={3}
                    placeholder="function solution(str) { \n  // write code here\n }"
                    value={qForm.codingDetails?.starterCode || ''}
                    onChange={(e) =>
                      setQForm({
                        ...qForm,
                        codingDetails: { ...qForm.codingDetails, starterCode: e.target.value }
                      })
                    }
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TYPE 4: INTERVIEW QUESTION */}
            {qForm.type === 'Interview' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Expected Answer / Explanation</label>
                  <textarea
                    rows={3}
                    placeholder="Key concepts, model answer, and points for interviewer..."
                    value={qForm.interviewDetails?.expectedAnswer || ''}
                    onChange={(e) =>
                      setQForm({
                        ...qForm,
                        interviewDetails: { ...qForm.interviewDetails, expectedAnswer: e.target.value }
                      })
                    }
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Explanation / Notes */}
            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Explanation (Optional)</label>
              <textarea
                rows={2}
                placeholder="Reasoning shown to student after answering..."
                value={qForm.explanation}
                onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#2C333F]">
              <button
                type="button"
                disabled={isSubmittingQuestion}
                onClick={() => saveQuestion(true)}
                className={`flex-1 py-3 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition ${
                  isSubmittingQuestion
                    ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isSubmittingQuestion ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Question...
                  </>
                ) : (
                  <>
                    <FaPlus /> Save & Add Another Question
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isSubmittingQuestion}
                onClick={() => saveQuestion(false)}
                className={`flex-1 py-3 font-bold text-xs rounded-xl shadow-lg transition ${
                  isSubmittingQuestion
                    ? 'bg-yellow-600/50 text-gray-400 cursor-not-allowed'
                    : 'bg-[#FFD60A] text-black hover:bg-yellow-400'
                }`}
              >
                {isSubmittingQuestion ? 'Saving...' : 'Save Question 🎯'}
              </button>
              <button
                type="button"
                disabled={isSubmittingQuestion}
                onClick={() => setActiveTab('question-bank')}
                className="px-5 py-3 bg-[#2C333F] text-[#AFB2BF] hover:text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT ATTEMPTS */}
      {activeTab === 'attempts' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('my-practice')}
              className="p-2 bg-[#161D29] border border-[#2C333F] text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-[#2C333F]"
            >
              <FaArrowLeft /> Back to My Practice
            </button>
            <h2 className="text-lg font-bold text-white">
              Student Attempts for: <span className="text-[#FFD60A]">{selectedTestForAttempts?.title}</span>
            </h2>
          </div>

          <div className="bg-[#161D29] border border-[#2C333F] rounded-3xl overflow-hidden">
            {attempts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#AFB2BF]">No student attempts recorded for this test yet.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs text-white">
                <thead>
                  <tr className="border-b border-[#2C333F] bg-[#090D16] text-[#AFB2BF] uppercase text-[10px] font-bold">
                    <th className="p-4">Student</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Percentage</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C333F]">
                  {attempts.map((att) => (
                    <tr key={att.id} className="hover:bg-[#1C2432]">
                      <td className="p-4 font-bold flex items-center gap-2">
                        <img
                          src={att.user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${att.user?.firstName || 'Student'}`}
                          alt="avatar"
                          className="w-6 h-6 rounded-full"
                        />
                        {att.user?.firstName} {att.user?.lastName}
                      </td>
                      <td className="p-4 text-gray-400">{att.user?.email}</td>
                      <td className="p-4 font-bold text-emerald-400">{att.score} / {att.totalMarks}</td>
                      <td className="p-4 font-bold">{att.percentage}%</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.percentage >= (selectedTestForAttempts?.passingPercentage || 40)
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {att.percentage >= (selectedTestForAttempts?.passingPercentage || 40) ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(att.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TEST BUILDER WIZARD MODAL */}
      <TestBuilderWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        token={token}
        role="INSTRUCTOR"
        courses={courses}
        initialCourseId={selectedCourseId}
        onSuccess={(createdTest) => {
          if (createdTest?.courseId) {
            setSelectedCourseId(createdTest.courseId);
          }
          fetchInstructorTests(createdTest?.courseId || selectedCourseId);
          setActiveTab('my-practice');
        }}
      />
    </div>
  );
}
