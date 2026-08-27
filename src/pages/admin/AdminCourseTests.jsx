import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton } from '../../components/admin/AdminUI';
import AdminModal from '../../components/admin/AdminModal';
import { practiceEndpoints, courseEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEye, FaGraduationCap, FaSearch, FaFilter } from 'react-icons/fa';

const TEST_CATEGORIES = [
  'All',
  'MCQ',
  'Coding',
  'Topic Practice',
  'Mock Test',
  'Interview Test',
  'Daily Quiz'
];

export default function AdminCourseTests() {
  return (
    <AdminProtectedRoute>
      <AdminCourseTestsInner />
    </AdminProtectedRoute>
  );
}

function AdminCourseTestsInner() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTestForStats, setSelectedTestForStats] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    testType: 'MCQ',
    duration: 20,
    totalMarks: 20,
    passingPercentage: 50,
    status: 'published',
    selectedQuestionIds: [],
  });

  const adminToken = localStorage.getItem('adminToken');

  const fetchCourses = async () => {
    try {
      const res = await apiConnector('GET', courseEndpoints.GET_ALL_COURSE_API);
      if (res.data?.success) {
        const list = res.data.data || [];
        setCourses(list);
        if (list.length > 0) {
          const firstId = list[0].id || list[0]._id;
          setFormData((prev) => ({ ...prev, courseId: firstId }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourseTests = async (cId) => {
    setLoading(true);
    try {
      const url = cId
        ? `${practiceEndpoints.ADMIN_TESTS}?scope=COURSE&courseId=${cId}`
        : `${practiceEndpoints.ADMIN_TESTS}?scope=COURSE`;
      const res = await apiConnector('GET', url, null, {
        Authorization: `Bearer ${adminToken}`
      });
      if (res.data?.success) {
        const testData = res.data.data || [];
        setTests(testData);
      }
    } catch (err) {
      console.error('Fetch course tests error:', err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseQuestions = async (cId) => {
    if (!cId) {
      setQuestions([]);
      return;
    }
    try {
      const res = await apiConnector('GET', `${practiceEndpoints.ADMIN_QUESTIONS}?scope=COURSE&courseId=${cId}`, null, {
        Authorization: `Bearer ${adminToken}`
      });
      if (res.data?.success) {
        setQuestions(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourseTests(selectedCourseId);
    if (selectedCourseId) {
      fetchCourseQuestions(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleModalCourseChange = (cId) => {
    setFormData((prev) => ({
      ...prev,
      courseId: cId,
      selectedQuestionIds: []
    }));
    fetchCourseQuestions(cId);
  };

  const handleCreateCourseTest = async (e, testStatus = 'published') => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (!formData.courseId) {
      toast.error('Please select a course first');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Test title is required');
      return;
    }
    if (formData.selectedQuestionIds.length === 0) {
      toast.error('Select at least 1 question belonging to this course');
      return;
    }

    setSubmitting(true);
    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_TESTS, {
        ...formData,
        scope: 'COURSE',
        courseId: formData.courseId,
        status: testStatus,
        questionIds: formData.selectedQuestionIds,
        numberOfQuestions: formData.selectedQuestionIds.length
      }, { Authorization: `Bearer ${adminToken}` });

      toast.success(`Course test ${testStatus === 'published' ? 'published' : 'saved as draft'} successfully! 🎓`);
      setIsTestModalOpen(false);
      const createdCourseId = formData.courseId;
      setFormData({
        courseId: createdCourseId,
        title: '',
        description: '',
        testType: selectedCategory !== 'All' ? selectedCategory : 'MCQ',
        duration: 20,
        totalMarks: 20,
        passingPercentage: 50,
        status: 'published',
        selectedQuestionIds: [],
      });
      // Always update selectedCourseId to match created course and fetch its tests
      setSelectedCourseId(createdCourseId);
      fetchCourseTests(createdCourseId);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create course test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course test?')) return;
    try {
      await apiConnector('DELETE', `${practiceEndpoints.ADMIN_TESTS}/${id}`, null, { Authorization: `Bearer ${adminToken}` });
      toast.success('Course test deleted');
      fetchCourseTests(selectedCourseId);
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  const filteredTests = tests.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.testType === selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableQuestions = questions.filter(q => {
    // If courseId is set on question, ensure it matches selected modal courseId
    if (q.courseId && formData.courseId && String(q.courseId) !== String(formData.courseId)) {
      return false;
    }
    // Match by testCategory if specified
    if (q.testCategory && q.testCategory === formData.testType) {
      return true;
    }
    // Match by type as fallback
    if (formData.testType === 'MCQ') return q.type === 'MCQ' || q.testCategory === 'MCQ';
    if (formData.testType === 'Coding') return q.type === 'Coding' || q.testCategory === 'Coding';
    if (formData.testType === 'Interview Test') return q.type === 'Interview' || q.type === 'Coding' || q.testCategory === 'Interview Test';
    return true;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl text-xl">🎓</span>
            <h1 className="text-2xl font-bold text-[#F1F2FF]">Course-Specific Practice Tests</h1>
          </div>
          <p className="text-xs text-[#AFB2BF] mt-1">Exclusive tests restricted to enrolled students of the specific course.</p>
        </div>
        <button
          onClick={() => {
            const activeCourseId = formData.courseId || selectedCourseId || (courses.length > 0 ? (courses[0].id || courses[0]._id) : '');
            setFormData(prev => ({
              ...prev,
              courseId: activeCourseId,
              testType: selectedCategory !== 'All' ? selectedCategory : 'MCQ',
              selectedQuestionIds: []
            }));
            if (activeCourseId) {
              fetchCourseQuestions(activeCourseId);
            }
            setIsTestModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#FFD60A] text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:bg-yellow-400 transition"
        >
          <FaPlus /> Build Course Test
        </button>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#2C333F] pb-3">
        {TEST_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#FFD60A] text-black shadow-md font-extrabold'
                : 'bg-[#161D29] text-[#AFB2BF] border border-[#2C333F] hover:text-white hover:border-[#585D69]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Selector & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-[11px] font-bold text-[#AFB2BF] uppercase mb-1">Select Active Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-[#161D29] border border-[#2C333F] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.courseName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#AFB2BF] uppercase mb-1">Search Tests</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-[#585D69]" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161D29] border border-[#2C333F] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
            />
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16] border-b border-[#2C333F] text-[#AFB2BF] font-semibold uppercase">
              <tr>
                <th className="px-5 py-3.5">Test Title</th>
                <th className="px-5 py-3.5">Category / Type</th>
                <th className="px-5 py-3.5">Questions</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C333F] text-[#F1F2FF]">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#585D69]">
                    <FaGraduationCap className="mx-auto text-3xl mb-2 opacity-30" />
                    No tests found for the selected course and category.
                  </td>
                </tr>
              ) : (
                filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-[#1f2736] transition">
                    <td className="px-5 py-4 font-bold">
                      {t.title}
                      {t.description && <p className="text-[11px] font-normal text-[#838894] truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {t.testType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#AFB2BF]">{t.questions?.length || t.numberOfQuestions || 0} Questions</td>
                    <td className="px-5 py-4 text-[#AFB2BF]">{t.duration} Mins</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedTestForStats(t)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteTest(t.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete Test"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Create Course Test */}
      {isTestModalOpen && (
        <AdminModal isOpen={isTestModalOpen} title="Build Course-Specific Practice Test 🎓" onClose={() => setIsTestModalOpen(false)}>
          <form className="space-y-4 text-xs">
            <div>
              <label className="block text-[#AFB2BF] font-semibold mb-1">Target Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => handleModalCourseChange(e.target.value)}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
              >
                <option value="">Select a Course</option>
                {courses.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#AFB2BF] font-semibold mb-1">Test Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                placeholder="e.g. React Hooks End of Module Quiz"
              />
            </div>

            <div>
              <label className="block text-[#AFB2BF] font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                placeholder="Brief summary of test objectives..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#AFB2BF] font-semibold mb-1">Category / Test Type</label>
                <select
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value, selectedQuestionIds: [] })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="Coding">Coding</option>
                  <option value="Topic Practice">Topic Practice</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Interview Test">Interview Test</option>
                  <option value="Daily Quiz">Daily Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-[#AFB2BF] font-semibold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#AFB2BF] font-semibold mb-1">Total Marks</label>
                <input
                  type="number"
                  min={1}
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>

              <div>
                <label className="block text-[#AFB2BF] font-semibold mb-1">Passing Percentage (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.passingPercentage}
                  onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                />
              </div>
            </div>

            {/* Course-Specific Questions List */}
            <div>
              <label className="block text-[#AFB2BF] font-semibold mb-2">
                Select Questions from Selected Course Question Bank ({formData.selectedQuestionIds.length} Selected)
              </label>
              <div className="max-h-48 overflow-y-auto bg-[#090D16] border border-[#2C333F] rounded-xl p-3 space-y-2">
                {availableQuestions.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No course questions available for this category.</p>
                ) : (
                  availableQuestions.map((q) => (
                    <label key={q.id} className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none">
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
                      <span className="truncate">{q.title}</span>
                      <span className="text-[10px] text-purple-400 font-bold ml-auto">[{q.type}]</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 flex justify-end gap-3 border-t border-[#2C333F]">
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleCreateCourseTest(e, 'draft')}
                className="px-4 py-2.5 bg-[#2C333F] text-yellow-400 font-bold rounded-xl hover:bg-[#3d4554] transition disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleCreateCourseTest(e, 'published')}
                className="px-5 py-2.5 bg-[#FFD60A] text-black font-bold rounded-xl hover:bg-yellow-400 transition disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Course Test 🎓'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Stats Modal */}
      {selectedTestForStats && (
        <AdminModal isOpen={!!selectedTestForStats} title={`Course Test Details: ${selectedTestForStats.title}`} onClose={() => setSelectedTestForStats(null)}>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-4 bg-[#090D16] p-4 rounded-xl border border-[#2C333F]">
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Scope</p>
                <p className="font-bold text-purple-400">COURSE-SPECIFIC</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Total Questions</p>
                <p className="font-bold text-white">{selectedTestForStats.questions?.length || selectedTestForStats.numberOfQuestions || 0}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Duration</p>
                <p className="font-bold text-white">{selectedTestForStats.duration} Mins</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Passing Mark</p>
                <p className="font-bold text-emerald-400">{selectedTestForStats.passingPercentage}%</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTestForStats(null)}
                className="px-4 py-2 bg-[#2C333F] text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </AdminLayout>
  );
}
