import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton, Modal } from '../../components/admin/AdminUI';
import { practiceEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function AdminPracticeTests() {
  return (
    <AdminProtectedRoute>
      <AdminPracticeTestsInner />
    </AdminProtectedRoute>
  );
}

function AdminPracticeTestsInner() {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testType: 'Mock Test',
    duration: 15,
    totalMarks: 10,
    passingPercentage: 40,
    status: 'published',
    selectedQuestionIds: [],
  });

  const adminToken = localStorage.getItem('adminToken');

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', practiceEndpoints.ADMIN_TESTS, null, { Authorization: `Bearer ${adminToken}` });
      if (res.data?.success) {
        setTests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await apiConnector('GET', practiceEndpoints.ADMIN_QUESTIONS, null, { Authorization: `Bearer ${adminToken}` });
      if (res.data?.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchQuestions();
  }, []);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (formData.selectedQuestionIds.length === 0) {
      toast.error('Select at least 1 question for the test');
      return;
    }

    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_TESTS, {
        ...formData,
        questionIds: formData.selectedQuestionIds,
        numberOfQuestions: formData.selectedQuestionIds.length
      }, { Authorization: `Bearer ${adminToken}` });

      toast.success('Practice Test created successfully');
      setIsTestModalOpen(false);
      fetchTests();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create test');
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    try {
      await apiConnector('DELETE', `${practiceEndpoints.ADMIN_TESTS}/${id}`, null, { Authorization: `Bearer ${adminToken}` });
      toast.success('Test deleted');
      fetchTests();
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F2FF]">Practice Test Builder 📝</h1>
          <p className="text-xs text-[#AFB2BF] mt-1">Create Daily Quizzes, Mock Tests, and Topic Tests.</p>
        </div>
        <button
          onClick={() => setIsTestModalOpen(true)}
          className="px-4 py-2 bg-[#FFD60A] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
        >
          <FaPlus /> Build New Test
        </button>
      </div>

      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16] border-b border-[#2C333F] text-[#AFB2BF] font-semibold uppercase">
              <tr>
                <th className="px-5 py-3.5">Test Title</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Questions</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C333F] text-[#F1F2FF]">
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#585D69]">No tests created yet.</td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t.id} className="hover:bg-[#1f2736]">
                    <td className="px-5 py-4 font-bold">{t.title}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-400">
                        {t.testType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#AFB2BF]">{t.questions?.length || t.numberOfQuestions || 0} Questions</td>
                    <td className="px-5 py-4 text-[#AFB2BF]">{t.duration} Mins</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTest(t.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
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

      {isTestModalOpen && (
        <Modal title="Build Practice Test" onClose={() => setIsTestModalOpen(false)}>
          <form onSubmit={handleCreateTest} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Test Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                placeholder="e.g. JavaScript Full Mock Test #1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Test Type</label>
                <select
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                >
                  <option value="Daily Quiz">Daily Quiz</option>
                  <option value="Topic Practice">Topic Practice</option>
                  <option value="Course Test">Course Test</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Interview Test">Interview Test</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Select Questions from Bank ({formData.selectedQuestionIds.length} Selected)</label>
              <div className="max-h-48 overflow-y-auto bg-[#090D16] border border-[#2C333F] rounded-xl p-3 space-y-2">
                {questions.map((q) => (
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
                    <span className="text-[10px] text-slate-500 ml-auto">({q.type})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 bg-[#2C333F] text-white rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FFD60A] text-black font-bold rounded-xl"
              >
                Save Practice Test
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
