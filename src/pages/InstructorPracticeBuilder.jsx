import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { courseEndpoints, practiceEndpoints } from '../services/apis';
import { toast } from 'react-hot-toast';
import { FaPlus, FaBook, FaClock, FaAward } from 'react-icons/fa';

export default function InstructorPracticeBuilder() {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testType: 'Course Test',
    duration: 20,
    totalMarks: 20,
    passingPercentage: 50,
    selectedQuestionIds: [],
  });

  useEffect(() => {
    fetchInstructorCourses();
    fetchQuestionsBank();
  }, []);

  const fetchInstructorCourses = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', courseEndpoints.GET_ALL_INSTRUCTOR_COURSES_API, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setCourses(res.data.data || []);
        if (res.data.data?.length > 0) {
          setSelectedCourseId(res.data.data[0]._id || res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch instructor courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsBank = async () => {
    try {
      const res = await apiConnector('GET', practiceEndpoints.ADMIN_QUESTIONS, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setQuestions(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch question bank error:', err);
    }
  };

  const handleCreateCourseTest = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('Select a course first');
      return;
    }
    if (formData.selectedQuestionIds.length === 0) {
      toast.error('Select at least 1 question for the practice test');
      return;
    }

    try {
      const payload = {
        courseId: selectedCourseId,
        title: formData.title,
        description: formData.description,
        testType: formData.testType,
        duration: formData.duration,
        totalMarks: formData.totalMarks,
        passingPercentage: formData.passingPercentage,
        questionIds: formData.selectedQuestionIds
      };

      const res = await apiConnector('POST', practiceEndpoints.INSTRUCTOR_CREATE_COURSE_TEST, payload, {
        Authorization: `Bearer ${token}`
      });

      if (res.data?.success) {
        toast.success('Course Practice Test published successfully! 🚀');
        setFormData({
          title: '',
          description: '',
          testType: 'Course Test',
          duration: 20,
          totalMarks: 20,
          passingPercentage: 50,
          selectedQuestionIds: [],
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish course practice test');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white p-6 sm:p-10 font-sans space-y-8">
      {/* Header */}
      <div className="border-b border-[#2C333F] pb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          Instructor Practice Builder 🎯
        </h1>
        <p className="text-xs text-[#AFB2BF] mt-1">
          Create course-specific quizzes and module tests attached strictly to your owned courses.
        </p>
      </div>

      <form onSubmit={handleCreateCourseTest} className="max-w-3xl space-y-6 bg-[#161D29] border border-[#2C333F] p-6 sm:p-8 rounded-3xl shadow-xl">
        {/* Select Course */}
        <div>
          <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
            Select Course *
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
          >
            {courses.length === 0 ? (
              <option value="">No Courses Found</option>
            ) : (
              courses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.courseName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
            Practice Test Title *
          </label>
          <input
            required
            type="text"
            placeholder="e.g. React Hooks & Context API Test"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Short overview of what concepts this test assesses..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD60A]"
          />
        </div>

        {/* Duration & Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
              Duration (Mins)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
              Total Marks
            </label>
            <input
              type="number"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
              className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
              Passing %
            </label>
            <input
              type="number"
              value={formData.passingPercentage}
              onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
              className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-sm text-white"
            />
          </div>
        </div>

        {/* Select Questions */}
        <div>
          <label className="block text-xs font-bold text-[#AFB2BF] uppercase tracking-wider mb-2">
            Select Questions ({formData.selectedQuestionIds.length} Selected)
          </label>
          <div className="max-h-60 overflow-y-auto bg-[#090D16] border border-[#2C333F] rounded-xl p-4 space-y-2">
            {questions.length === 0 ? (
              <p className="text-xs text-[#585D69]">No questions in bank yet. Ask admin or add global questions.</p>
            ) : (
              questions.map((q) => (
                <label key={q.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#161D29] cursor-pointer select-none text-xs text-[#F1F2FF]">
                  <input
                    type="checkbox"
                    checked={formData.selectedQuestionIds.includes(q.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, selectedQuestionIds: [...formData.selectedQuestionIds, q.id] });
                      } else {
                        setFormData({ ...formData, selectedQuestionIds: formData.selectedQuestionIds.filter(id => id !== q.id) });
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

        <button
          type="submit"
          className="w-full py-3.5 bg-[#FFD60A] text-black font-bold text-sm rounded-xl shadow-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
        >
          <FaPlus /> Publish Course Practice Test
        </button>
      </form>
    </div>
  );
}
