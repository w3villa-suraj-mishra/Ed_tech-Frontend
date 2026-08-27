import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton } from '../../components/admin/AdminUI';
import AdminModal from '../../components/admin/AdminModal';
import { practiceEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEye, FaGlobe, FaSearch, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminGlobalTests() {
  return (
    <AdminProtectedRoute>
      <AdminGlobalTestsInner />
    </AdminProtectedRoute>
  );
}

function AdminGlobalTestsInner() {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTestForStats, setSelectedTestForStats] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testType: 'Mock Test',
    duration: 20,
    totalMarks: 20,
    passingPercentage: 50,
    status: 'published',
    selectedQuestionIds: [],
  });

  const adminToken = localStorage.getItem('adminToken');

  const fetchGlobalTests = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', `${practiceEndpoints.ADMIN_TESTS}?scope=GLOBAL`, null, {
        Authorization: `Bearer ${adminToken}`
      });
      if (res.data?.success) {
        setTests(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch global tests error:', err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalQuestions = async () => {
    try {
      const res = await apiConnector('GET', `${practiceEndpoints.ADMIN_QUESTIONS}?scope=GLOBAL`, null, {
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
    fetchGlobalTests();
    fetchGlobalQuestions();
  }, []);

  const handleCreateGlobalTest = async (e, testStatus = 'published') => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (!formData.title.trim()) {
      toast.error('Test title is required');
      return;
    }
    if (formData.selectedQuestionIds.length === 0) {
      toast.error('Select at least 1 global question for this test');
      return;
    }

    setSubmitting(true);
    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_TESTS, {
        ...formData,
        scope: 'GLOBAL',
        courseId: null,
        status: testStatus,
        questionIds: formData.selectedQuestionIds,
        numberOfQuestions: formData.selectedQuestionIds.length
      }, { Authorization: `Bearer ${adminToken}` });

      toast.success(`Global test ${testStatus === 'published' ? 'published' : 'saved as draft'} successfully! 🌐`);
      setIsTestModalOpen(false);
      setFormData({
        title: '',
        description: '',
        testType: 'Mock Test',
        duration: 20,
        totalMarks: 20,
        passingPercentage: 50,
        status: 'published',
        selectedQuestionIds: [],
      });
      fetchGlobalTests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create global test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this global test?')) return;
    try {
      await apiConnector('DELETE', `${practiceEndpoints.ADMIN_TESTS}/${id}`, null, { Authorization: `Bearer ${adminToken}` });
      toast.success('Global test deleted');
      fetchGlobalTests();
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  const filteredTests = tests.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || t.testType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-500/20 text-blue-400 rounded-xl text-xl">🌐</span>
            <h1 className="text-2xl font-bold text-[#F1F2FF]">Global Practice Tests</h1>
          </div>
          <p className="text-xs text-[#AFB2BF] mt-1">Available to all registered students without requiring course purchase.</p>
        </div>
        <button
          onClick={() => setIsTestModalOpen(true)}
          className="px-4 py-2.5 bg-[#FFD60A] text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:bg-yellow-400 transition"
        >
          <FaPlus /> Build Global Test
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3.5 top-3.5 text-[#585D69]" />
          <input
            type="text"
            placeholder="Search global tests by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161D29] border border-[#2C333F] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#161D29] border border-[#2C333F] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD60A]"
        >
          <option value="">All Test Types</option>
          <option value="Daily Quiz">Daily Quiz</option>
          <option value="Topic Practice">Topic Practice</option>
          <option value="Mock Test">Mock Test</option>
          <option value="Interview Test">Interview Test</option>
        </select>
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
                <th className="px-5 py-3.5">Type</th>
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
                    <FaGlobe className="mx-auto text-3xl mb-2 opacity-30" />
                    No global tests created yet.
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
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
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
                        title="View Stats"
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

      {/* Modal: Create Global Test */}
      {isTestModalOpen && (
        <AdminModal isOpen={isTestModalOpen} title="Build Global Practice Test 🌐" onClose={() => setIsTestModalOpen(false)}>
          <form className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-[#AFB2BF] font-semibold mb-1">Test Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                placeholder="e.g. Daily JavaScript Quiz #1"
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
                <label className="block text-[#AFB2BF] font-semibold mb-1">Test Type</label>
                <select
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFD60A]"
                >
                  <option value="Daily Quiz">Daily Quiz</option>
                  <option value="Topic Practice">Topic Practice</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Interview Test">Interview Test</option>
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

            {/* Global Questions List */}
            <div>
              <label className="block text-[#AFB2BF] font-semibold mb-2">
                Select Questions from Global Question Bank ({formData.selectedQuestionIds.length} Selected)
              </label>
              <div className="max-h-48 overflow-y-auto bg-[#090D16] border border-[#2C333F] rounded-xl p-3 space-y-2">
                {questions.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No global questions available in Practice Bank.</p>
                ) : (
                  questions.map((q) => (
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
                onClick={(e) => handleCreateGlobalTest(e, 'draft')}
                className="px-4 py-2.5 bg-[#2C333F] text-yellow-400 font-bold rounded-xl hover:bg-[#3d4554] transition disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleCreateGlobalTest(e, 'published')}
                className="px-5 py-2.5 bg-[#FFD60A] text-black font-bold rounded-xl hover:bg-yellow-400 transition disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Global Test 🌐'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Stats Modal */}
      {selectedTestForStats && (
        <AdminModal isOpen={!!selectedTestForStats} title={`Test Details: ${selectedTestForStats.title}`} onClose={() => setSelectedTestForStats(null)}>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-4 bg-[#090D16] p-4 rounded-xl border border-[#2C333F]">
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Scope</p>
                <p className="font-bold text-blue-400">GLOBAL</p>
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
