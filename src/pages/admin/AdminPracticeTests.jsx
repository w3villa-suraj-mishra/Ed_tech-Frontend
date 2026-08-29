import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton } from '../../components/admin/AdminUI';
import { practiceEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import TestBuilderWizard from '../../components/common/TestBuilderWizard';

export default function AdminPracticeTests() {
  return (
    <AdminProtectedRoute>
      <AdminPracticeTestsInner />
    </AdminProtectedRoute>
  );
}

function AdminPracticeTestsInner() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

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

  useEffect(() => {
    fetchTests();
  }, []);

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
          <p className="text-xs text-[#AFB2BF] mt-1">Create and manage Daily Quizzes, Mock Tests, and Topic Tests.</p>
        </div>
        <button
          onClick={() => {
            setEditingTest(null);
            setIsWizardOpen(true);
          }}
          className="px-4 py-2 bg-[#FFD60A] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:bg-yellow-400 transition"
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
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400">
                        {t.testType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#AFB2BF]">{t.questions?.length || t.numberOfQuestions || 0} Questions</td>
                    <td className="px-5 py-4 text-[#AFB2BF]">{t.duration} Mins</td>
                    <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingTest(t);
                          setIsWizardOpen(true);
                        }}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition"
                        title="Edit Test"
                      >
                        <FaEdit />
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

      <TestBuilderWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setEditingTest(null);
        }}
        token={adminToken}
        role="ADMIN"
        initialScope="GLOBAL"
        initialTest={editingTest}
        onSuccess={() => {
          fetchTests();
          setEditingTest(null);
        }}
      />
    </AdminLayout>
  );
}
