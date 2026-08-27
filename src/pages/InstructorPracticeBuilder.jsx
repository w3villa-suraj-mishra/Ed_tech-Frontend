import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { courseEndpoints, practiceEndpoints } from '../services/apis';
import { toast } from 'react-hot-toast';
import {
  FaPlus, FaBook, FaClock, FaAward, FaSearch, FaFilter, FaCheckCircle,
  FaTimesCircle, FaEye, FaEdit, FaTrash, FaListUl, FaQuestionCircle,
  FaUserGraduate, FaCode, FaCommentDots, FaArrowLeft
} from 'react-icons/fa';

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
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);
  const [loading, setLoading] = useState(true);

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
    codingDetails: { language: 'javascript', initialCode: '', expectedOutput: '' },
    interviewDetails: { sampleAnswer: '', keyPoints: '' }
  });

  // Create Test Form State
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    testType: 'Course Test',
    courseId: '',
    duration: 20,
    totalMarks: 20,
    passingPercentage: 50,
    selectedQuestionIds: [],
    status: 'published'
  });

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
          setTestForm((prev) => ({ ...prev, courseId: firstId }));
          setQForm((prev) => ({ ...prev, courseId: firstId }));
        }
      }
    } catch (err) {
      console.error('Fetch instructor courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorTests = async () => {
    try {
      const url = selectedCourseId
        ? `${practiceEndpoints.INSTRUCTOR_GET_TESTS}?courseId=${selectedCourseId}`
        : practiceEndpoints.INSTRUCTOR_GET_TESTS;
      const res = await apiConnector('GET', url, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setTests(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch instructor tests error:', err);
    }
  };

  const fetchInstructorQuestions = async () => {
    try {
      const url = selectedCourseId
        ? `${practiceEndpoints.INSTRUCTOR_GET_QUESTIONS}?courseId=${selectedCourseId}`
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

  // Step 4: Submit Create Question
  const handleCreateQuestionSubmit = async (e) => {
    e.preventDefault();
    const targetCourseId = qForm.courseId || selectedCourseId;
    if (!targetCourseId) {
      toast.error('Please select a course for this question');
      return;
    }
    if (!qForm.title) {
      toast.error('Question title is required');
      return;
    }

    try {
      const payload = {
        ...qForm,
        courseId: targetCourseId,
      };

      const res = await apiConnector('POST', practiceEndpoints.ADMIN_QUESTIONS, payload, {
        Authorization: `Bearer ${token}`
      });

      if (res.data?.success) {
        toast.success('Question added to Question Bank! 🎯');
        fetchInstructorQuestions();
        setQForm({
          title: '',
          type: 'MCQ',
          courseId: targetCourseId,
          difficulty: 'Easy',
          explanation: '',
          marks: 1,
          negativeMarks: 0,
          options: [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false },
          ],
          codingDetails: { language: 'javascript', initialCode: '', expectedOutput: '' },
          interviewDetails: { sampleAnswer: '', keyPoints: '' }
        });
        setActiveTab('question-bank');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create question');
    }
  };

  // Step 5 & 6: Create & Publish/Save Draft Test
  const handleCreateTestSubmit = async (statusType) => {
    const targetCourseId = testForm.courseId || selectedCourseId;
    if (!targetCourseId) {
      toast.error('Select a course first');
      return;
    }
    if (!testForm.title.trim()) {
      toast.error('Test title is required');
      return;
    }
    if (statusType === 'published' && testForm.selectedQuestionIds.length === 0) {
      toast.error('Select at least 1 question to Publish the test');
      return;
    }

    try {
      const payload = {
        ...testForm,
        courseId: targetCourseId,
        questionIds: testForm.selectedQuestionIds,
        status: statusType
      };

      const res = await apiConnector('POST', practiceEndpoints.INSTRUCTOR_CREATE_COURSE_TEST, payload, {
        Authorization: `Bearer ${token}`
      });

      if (res.data?.success) {
        toast.success(statusType === 'published' ? 'Test published successfully! 🚀' : 'Test saved as draft! 📝');
        fetchInstructorTests();
        setTestForm({
          title: '',
          description: '',
          testType: 'Course Test',
          courseId: targetCourseId,
          duration: 20,
          totalMarks: 20,
          passingPercentage: 50,
          selectedQuestionIds: [],
          status: 'published'
        });
        setActiveTab('my-practice');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save test');
    }
  };

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
              setTestForm((prev) => ({ ...prev, courseId: e.target.value }));
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
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Course Practice Tests & Quizzes</h2>
            <button
              onClick={() => setActiveTab('create-test')}
              className="px-4 py-2 bg-[#FFD60A] text-black text-xs font-bold rounded-xl hover:bg-yellow-400 flex items-center gap-2"
            >
              <FaPlus /> Create New Test
            </button>
          </div>

          {tests.length === 0 ? (
            <div className="p-12 text-center bg-[#161D29] border border-[#2C333F] rounded-3xl space-y-3">
              <div className="text-4xl">📝</div>
              <h3 className="text-base font-bold text-white">No Practice Tests Created</h3>
              <p className="text-xs text-[#AFB2BF]">
                Create course tests or quizzes to help your enrolled students practice.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <div key={test.id} className="bg-[#161D29] border border-[#2C333F] rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {test.testType}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        test.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {test.status?.toUpperCase()}
                      </span>
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
          )}
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
              <button
                onClick={() => setActiveTab('create-question')}
                className="px-4 py-2 bg-[#FFD60A] text-black text-xs font-bold rounded-xl whitespace-nowrap"
              >
                + Add Question
              </button>
            </div>
          </div>

          <div className="bg-[#161D29] border border-[#2C333F] rounded-3xl overflow-hidden">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#AFB2BF]">No questions found in the Question Bank.</div>
            ) : (
              <div className="divide-y divide-[#2C333F]">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1C2432]">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">{q.type}</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">{q.difficulty}</span>
                        <span className="text-[10px] text-gray-400">{q.marks} Mark(s)</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{q.title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTestForm((prev) => ({
                            ...prev,
                            selectedQuestionIds: prev.selectedQuestionIds.includes(q.id)
                              ? prev.selectedQuestionIds.filter((id) => id !== q.id)
                              : [...prev.selectedQuestionIds, q.id]
                          }));
                          toast.success('Question updated in Test selection!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          testForm.selectedQuestionIds.includes(q.id)
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#090D16] text-[#AFB2BF] border border-[#2C333F] hover:text-white'
                        }`}
                      >
                        {testForm.selectedQuestionIds.includes(q.id) ? '✓ Selected for Test' : '+ Select for Test'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CREATE TEST / QUIZ */}
      {activeTab === 'create-test' && (
        <div className="max-w-3xl space-y-6 bg-[#161D29] border border-[#2C333F] p-6 sm:p-8 rounded-3xl shadow-xl">
          <h2 className="text-xl font-bold text-white border-b border-[#2C333F] pb-4">
            Build New Test / Quiz
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Test Type</label>
              <select
                value={testForm.testType}
                onChange={(e) => setTestForm({ ...testForm, testType: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none"
              >
                <option value="Course Test">Course Test</option>
                <option value="Quiz">Quiz</option>
                <option value="Coding Test">Coding Test</option>
                <option value="Interview Test">Interview Test</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Title *</label>
              <input
                type="text"
                placeholder="e.g. React State & Lifecycle Assessment"
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Description</label>
              <textarea
                rows={2}
                placeholder="Instructions or details..."
                value={testForm.description}
                onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Duration (Mins)</label>
                <input
                  type="number"
                  value={testForm.duration}
                  onChange={(e) => setTestForm({ ...testForm, duration: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Total Marks</label>
                <input
                  type="number"
                  value={testForm.totalMarks}
                  onChange={(e) => setTestForm({ ...testForm, totalMarks: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Passing %</label>
                <input
                  type="number"
                  value={testForm.passingPercentage}
                  onChange={(e) => setTestForm({ ...testForm, passingPercentage: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
                Select Questions ({testForm.selectedQuestionIds.length} Selected)
              </label>
              <div className="max-h-60 overflow-y-auto bg-[#090D16] border border-[#2C333F] rounded-xl p-4 space-y-2">
                {questions.length === 0 ? (
                  <p className="text-xs text-gray-500">No questions available. Add questions in Question Bank first.</p>
                ) : (
                  questions.map((q) => (
                    <label key={q.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161D29] cursor-pointer select-none text-xs text-[#F1F2FF]">
                      <input
                        type="checkbox"
                        checked={testForm.selectedQuestionIds.includes(q.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTestForm({ ...testForm, selectedQuestionIds: [...testForm.selectedQuestionIds, q.id] });
                          } else {
                            setTestForm({ ...testForm, selectedQuestionIds: testForm.selectedQuestionIds.filter(id => id !== q.id) });
                          }
                        }}
                        className="accent-[#FFD60A]"
                      />
                      <span className="truncate flex-1 font-medium">{q.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">{q.type}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => handleCreateTestSubmit('draft')}
                className="flex-1 py-3 bg-[#2C333F] text-white font-bold text-xs rounded-xl hover:bg-gray-700 transition"
              >
                Save Draft 📝
              </button>
              <button
                type="button"
                onClick={() => handleCreateTestSubmit('published')}
                className="flex-1 py-3 bg-[#FFD60A] text-black font-bold text-xs rounded-xl shadow-xl hover:bg-yellow-400 transition"
              >
                Publish Test 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADD QUESTION */}
      {activeTab === 'create-question' && (
        <form onSubmit={handleCreateQuestionSubmit} className="max-w-3xl space-y-6 bg-[#161D29] border border-[#2C333F] p-6 sm:p-8 rounded-3xl shadow-xl">
          <h2 className="text-xl font-bold text-white border-b border-[#2C333F] pb-4">
            Add New Question
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Question Type</label>
              <select
                value={qForm.type}
                onChange={(e) => setQForm({ ...qForm, type: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none"
              >
                <option value="MCQ">MCQ (Multiple Choice)</option>
                <option value="True/False">True / False</option>
                <option value="Coding">Coding Problem</option>
                <option value="Interview">Interview Question</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Question Title / Prompt *</label>
              <input
                required
                type="text"
                placeholder="e.g. What is the output of useEffect with an empty dependency array?"
                value={qForm.title}
                onChange={(e) => setQForm({ ...qForm, title: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={qForm.difficulty}
                  onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
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
                  value={qForm.marks}
                  onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
                />
              </div>
            </div>

            {/* MCQ Options */}
            {(qForm.type === 'MCQ' || qForm.type === 'True/False') && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider">Answer Options</label>
                {qForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const updated = qForm.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setQForm({ ...qForm, options: updated });
                      }}
                      className="accent-[#FFD60A]"
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
                      className="flex-1 bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#FFD60A] text-black font-bold text-xs rounded-xl shadow-xl hover:bg-yellow-400 transition"
            >
              Save Question to Bank 🎯
            </button>
          </div>
        </form>
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
    </div>
  );
}
