import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { practiceEndpoints, courseEndpoints } from '../services/apis';
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiRefreshCw
} from 'react-icons/fi';

export default function StudentCourseTestRunner() {
  const { courseId, testId, attemptId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Active Test Answers & Timer State
  const [answers, setAnswers] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Result & Review State
  const [attemptResult, setAttemptResult] = useState(null);
  const [detailedAttempt, setDetailedAttempt] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (courseId && testId && attemptId) {
      // Direct Review Route Access or Page Refresh
      loadAttemptDetails(attemptId);
    } else if (courseId && testId) {
      loadCourseTest();
    }
  }, [courseId, testId, attemptId, token]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!test || attemptResult || timeLeftSeconds <= 0 || attemptId) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, attemptResult, timeLeftSeconds, attemptId]);

  const loadCourseTest = async () => {
    setLoading(true);
    setNotEnrolled(false);
    setErrorMessage('');
    try {
      const res = await apiConnector(
        'GET',
        `${practiceEndpoints.GET_COURSE_PRACTICE}/${courseId}?testId=${testId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (res.data?.success) {
        const testsList = res.data.data || [];
        if (testsList.length === 0) {
          setErrorMessage('Practice Test not found or not published.');
        } else {
          const currentTest = testsList[0];
          setTest(currentTest);
          setQuestions(currentTest.questions || []);
          setTimeLeftSeconds((currentTest.duration || 15) * 60);
        }
      }
    } catch (err) {
      console.error('Load practice test error:', err);
      if (err.response?.status === 403 && err.response?.data?.notEnrolled) {
        setNotEnrolled(true);
      } else {
        setErrorMessage(err.response?.data?.message || 'Unauthorized or test access failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const [codeRunning, setCodeRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleRunCode = async (question) => {
    if (codeRunning) return;
    setCodeRunning(true);
    setRunResult(null);
    try {
      const userCode = answers[question.id] !== undefined ? answers[question.id] : (question.codingDetails?.starterCode || '');
      const language = question.codingDetails?.language || 'python';
      const visibleInput = question.codingDetails?.testCases?.[0]?.input || '';

      const res = await apiConnector('POST', practiceEndpoints.RUN_CODE_API, {
        questionId: question.id,
        language,
        sourceCode: userCode,
        input: visibleInput
      }, { Authorization: `Bearer ${token}` });

      if (res.data) {
        setRunResult(res.data);
      }
    } catch (err) {
      setRunResult({
        success: false,
        code: 'CODE_EXECUTOR_UNAVAILABLE',
        message: 'Code execution is currently unavailable. Please try again later.'
      });
    } finally {
      setCodeRunning(false);
    }
  };

  const handleResetCode = (question) => {
    const defaultCode = question.codingDetails?.starterCode || '';
    setAnswers(prev => ({ ...prev, [question.id]: defaultCode }));
    setShowResetConfirm(false);
    setRunResult(null);
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!test || submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, userVal]) => {
        const qObj = questions.find(q => String(q.id) === String(qId));
        if (qObj && qObj.type === 'Coding') {
          return {
            questionId: Number(qId),
            userCode: String(userVal)
          };
        }
        return {
          questionId: Number(qId),
          selectedOptionId: Number(userVal)
        };
      });

      const totalDuration = (test.duration || 15) * 60;
      const timeTakenSeconds = Math.max(1, totalDuration - timeLeftSeconds);

      const res = await apiConnector(
        'POST',
        practiceEndpoints.SUBMIT_ATTEMPT,
        {
          testId: test.id,
          courseId: Number(courseId),
          timeTakenSeconds,
          answers: formattedAnswers
        },
        { Authorization: `Bearer ${token}` }
      );

      if (res.data?.success) {
        setAttemptResult(res.data.data);
      }
    } catch (err) {
      console.error('Submit practice test error:', err);
      alert('Failed to submit test: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const loadAttemptDetails = async (targetAttemptId) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await apiConnector(
        'GET',
        `${practiceEndpoints.GET_ATTEMPT_DETAILS}${targetAttemptId}?courseId=${courseId}&testId=${testId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (res.data?.success) {
        const data = res.data.data;
        setDetailedAttempt(data);
        if (data.test) setTest(data.test);
      }
    } catch (err) {
      console.error('Fetch review answers error:', err);
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setErrorMessage(serverMsg);
      } else if (err.response?.status === 403) {
        setErrorMessage('Access Denied: You do not have permission to view this review.');
      } else {
        setErrorMessage('Unable to load test review.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = () => {
    const targetAttemptId = attemptResult?.id || attemptResult?.attemptId;
    if (targetAttemptId) {
      navigate(`/s/courses/${courseId}/take/pratice-test/${testId}/review/${targetAttemptId}`);
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3 font-['Inter',sans-serif]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Preparing Practice Test...</p>
      </div>
    );
  }

  // Security Guard Check
  if (notEnrolled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <FiLock size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Practice & Tests are available only to students enrolled in this course.
            </p>
          </div>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            View Course & Enroll
          </button>
        </div>
      </div>
    );
  }

  // ================= ANSWER REVIEW ROUTE / VIEW =================
  if (attemptId || detailedAttempt) {
    if (errorMessage) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="text-3xl">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900">Review Unavailable</h2>
            <p className="text-xs text-slate-600">{errorMessage}</p>
            <button
              onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition font-bold"
            >
              Back to Course Practice
            </button>
          </div>
        </div>
      );
    }

    const testTitle = test?.title || detailedAttempt?.test?.title || 'Practice Test';

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-['Inter',sans-serif] flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
              className="p-2 rounded-lg hover:bg-slate-100 text-indigo-700 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <FiArrowLeft size={16} /> Back to Course Practice
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="font-bold text-sm text-slate-900">
              Answer Review — {testTitle}
            </h1>
          </div>
        </header>

        <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
          {/* TOP METRICS STRIP */}
          {detailedAttempt && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Score</span>
                <p className="text-base font-black text-slate-900">{detailedAttempt.score} / {detailedAttempt.totalMarks}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Percentage</span>
                <p className="text-base font-black text-indigo-600">{detailedAttempt.percentage}%</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 block uppercase">Correct</span>
                <p className="text-base font-bold text-emerald-700">{detailedAttempt.correctCount}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-red-600 block uppercase">Incorrect</span>
                <p className="text-base font-bold text-red-700">{detailedAttempt.wrongCount}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {detailedAttempt?.answers?.map((ans, idx) => {
              const q = ans.question || {};
              const selectedOpt = ans.selectedOption || {};
              const correctOpt = q.options?.find((o) => o.isCorrect || o.is_correct);

              const isCorrect = ans.isCorrect;
              const isUnanswered = !ans.selectedOptionId && !ans.userCode && !ans.userInterviewAnswer;

              return (
                <div
                  key={ans.id || idx}
                  className={`bg-white border rounded-2xl p-6 space-y-4 shadow-sm ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isUnanswered
                      ? 'border-amber-200 bg-amber-50/10'
                      : 'border-red-200 bg-red-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-500">Question {idx + 1}</span>
                    {q.type === 'Coding' ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <FiClock size={12} /> Evaluation Pending (Executor Unavailable)
                      </span>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-700'
                            : isUnanswered
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isCorrect ? <FiCheckCircle size={12} /> : isUnanswered ? <FiHelpCircle size={12} /> : <FiXCircle size={12} />}
                        {isCorrect ? 'CORRECT (+1)' : isUnanswered ? 'NOT ANSWERED' : 'INCORRECT (0)'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{q.title}</h3>

                  {q.type === 'Coding' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500">Submitted Language:</span>
                        <span className="px-2 py-0.5 bg-slate-100 font-mono font-bold text-slate-800 rounded uppercase">
                          {q.codingDetails?.language || 'Python'}
                        </span>
                      </div>

                      {ans.userCode ? (
                        <div>
                          <span className="block text-[11px] font-bold text-slate-600 mb-1">Submitted Source Code:</span>
                          <pre className="bg-[#0D1117] text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto">
                            {ans.userCode}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No code submitted.</p>
                      )}
                    </div>
                  )}

                  {/* OPTIONS REVIEW */}
                  <div className="space-y-2 pt-2">
                    {q.options?.map((opt) => {
                      const isSelected = selectedOpt?.id === opt.id;
                      const isOptCorrect = opt.isCorrect || opt.is_correct;

                      let styleClass = 'bg-slate-50 border-slate-200 text-slate-700';

                      if (isOptCorrect) {
                        styleClass = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                      } else if (isSelected && !isOptCorrect) {
                        styleClass = 'bg-red-100 border-red-500 text-red-900 font-bold';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${styleClass}`}
                        >
                          <span>{opt.optionText}</span>
                          <div className="flex items-center gap-2 text-[10px] font-extrabold">
                            {isSelected && !isOptCorrect && (
                              <span className="text-red-700 bg-red-200/60 px-2 py-0.5 rounded">
                                Student Answer ❌
                              </span>
                            )}
                            {isSelected && isOptCorrect && (
                              <span className="text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                                Student Answer ✓
                              </span>
                            )}
                            {!isSelected && isOptCorrect && (
                              <span className="text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                                Correct Answer ✓
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPLANATION */}
                  {q.explanation && (
                    <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                      <span className="font-bold block text-indigo-700">💡 Explanation:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900">Test Not Found</h2>
          <p className="text-xs text-slate-600">{errorMessage || 'The requested practice test is unavailable.'}</p>
          <button
            onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
          >
            Back to Course Tests
          </button>
        </div>
      </div>
    );
  }

  if (attemptResult) {
    const isPassed = attemptResult.isPassed;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner text-3xl ${
              isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isPassed ? '🎉' : '❌'}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              {isPassed ? 'Test Completed Successfully!' : 'Test Completed'}
            </h2>
            <p className="text-xs font-semibold text-slate-500">{test?.title}</p>
          </div>

          {/* METRICS SUMMARY GRID */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Score</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {attemptResult.score || 0} / {attemptResult.totalMarks || test?.totalMarks || 10}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Percentage</span>
              <p className="text-xl font-black text-indigo-600 mt-1">
                {attemptResult.percentage ?? Math.round(((attemptResult.score || 0) / (attemptResult.totalMarks || 10)) * 100)}%
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">Correct</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">
                {attemptResult.correctAnswers ?? attemptResult.correctCount ?? 0}
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <span className="text-[10px] font-bold text-red-600 block uppercase tracking-wider">Incorrect</span>
              <p className="text-lg font-bold text-red-700 mt-0.5">
                {attemptResult.incorrectAnswers ?? attemptResult.wrongCount ?? 0}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReviewClick}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Review Answers
            </button>
            <button
              onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition border border-slate-200"
            >
              Back to Course Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 7. ACTIVE TEST TAKING PAGE =================
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-screen bg-slate-50 text-slate-800 font-['Inter',sans-serif] flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-sm select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition text-xs font-bold flex items-center gap-1"
          >
            <FiArrowLeft size={16} /> Exit
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="font-bold text-sm text-slate-900 line-clamp-1 max-w-sm">
            {test.title}
          </h1>
        </div>

        {/* TIMER */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border shadow-sm ${
              timeLeftSeconds < 180
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <FiClock size={14} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => handleSubmitTest(false)}
            disabled={submitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      {/* TEST RUNNER MAIN AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* QUESTION CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl mx-auto space-y-6">
          {currentQuestion ? (
            currentQuestion.type === 'Coding' ? (
              <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
                {/* LEFT: PROBLEM DETAILS */}
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-y-auto space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-indigo-100 text-indigo-700 text-[10px]">Coding</span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900">{currentQuestion.title}</h2>

                  {currentQuestion.codingDetails?.problemStatement && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Problem Statement</h4>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">{currentQuestion.codingDetails.problemStatement}</p>
                    </div>
                  )}

                  {currentQuestion.codingDetails?.inputFormat && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Input Format</h4>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{currentQuestion.codingDetails.inputFormat}</p>
                    </div>
                  )}

                  {currentQuestion.codingDetails?.outputFormat && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Output Format</h4>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{currentQuestion.codingDetails.outputFormat}</p>
                    </div>
                  )}

                  {currentQuestion.codingDetails?.constraints && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-1">Constraints</h4>
                      <code className="text-slate-700 bg-slate-100 px-2 py-1 rounded">{currentQuestion.codingDetails.constraints}</code>
                    </div>
                  )}

                  {currentQuestion.codingDetails?.testCases?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-700 mb-2">Visible Example Test Cases</h4>
                      <div className="space-y-2">
                        {currentQuestion.codingDetails.testCases.map((tc, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 font-mono text-[11px]">
                            <span className="font-bold text-slate-500 block text-[10px]">Sample #{idx + 1}</span>
                            <div><span className="text-slate-400">Input:</span> {tc.input}</div>
                            <div><span className="text-slate-400">Expected Output:</span> {tc.output || tc.expectedOutput}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: REAL CODE EDITOR & CONTROLS */}
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4 flex flex-col flex-1 shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold text-xs">Language:</span>
                        <span className="px-2.5 py-1 bg-slate-800 text-yellow-400 rounded-lg text-xs font-mono font-bold uppercase">
                          {currentQuestion.codingDetails?.language || 'Python'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                        >
                          <FiRefreshCw className="inline mr-1" /> Reset Code
                        </button>
                        <button
                          onClick={() => handleRunCode(currentQuestion)}
                          disabled={codeRunning}
                          className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold rounded-xl text-xs shadow transition disabled:opacity-50"
                        >
                          {codeRunning ? 'Running...' : 'Run Code'}
                        </button>
                      </div>
                    </div>

                    {/* CODE EDITOR WORKSPACE */}
                    <div className="flex-1 relative font-mono text-xs text-slate-100 min-h-[220px]">
                      <textarea
                        value={
                          answers[currentQuestion.id] !== undefined
                            ? answers[currentQuestion.id]
                            : (currentQuestion.codingDetails?.starterCode || '')
                        }
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        placeholder="// Write your solution here..."
                        className="w-full h-full bg-[#0D1117] text-emerald-400 font-mono p-3 rounded-xl border border-slate-800 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* RUN OUTPUT PANEL */}
                    {runResult && (
                      <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${runResult.success ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {runResult.status || 'Status: Execution Unavailable'}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-snug">{runResult.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RESET CONFIRMATION MODAL */}
                {showResetConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
                      <h3 className="font-bold text-base text-slate-900">Reset Code to Starter Template?</h3>
                      <p className="text-xs text-slate-500">Your currently typed code for this question will be lost.</p>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResetCode(currentQuestion)}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                        >
                          Reset Code
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-slate-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
                    {currentQuestion.type || 'MCQ'}
                  </span>
                </div>

                <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                  {currentQuestion.title}
                </h2>

                {/* OPTIONS GRID */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                        className={`p-4 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 text-indigo-900 font-bold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.optionText}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <p className="text-xs text-slate-400">No questions available in this test.</p>
          )}

          {/* BOTTOM PAGINATION NAV */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                currentQuestionIndex === 0
                  ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FiChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                currentQuestionIndex === questions.length - 1
                  ? 'text-slate-300 border border-slate-200 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* RIGHT SIDEBAR QUESTION NAVIGATION PALETTE */}
        <aside className="w-64 bg-white border-l border-slate-200 p-5 shrink-0 hidden lg:flex flex-col justify-between select-none">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
              Question Navigator
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentQuestionIndex === idx;

                let btnClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isCurrent) {
                  btnClass = 'bg-indigo-600 text-white font-black shadow';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center transition ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Current Question
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 inline-block" /> Unanswered
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
