import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, Pagination, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getEnrollments, deleteEnrollment } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminEnrollments() {
  return <AdminProtectedRoute><EnrollmentsInner /></AdminProtectedRoute>;
}

function EnrollmentsInner() {
  const [enrollments, setEnrollments] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [totalPages, setTP] = useState(1);
  const [loading, setLoading] = useState(true);
  const [delModal, setDelModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getEnrollments({ page, limit: 15 })
      .then(({ data }) => { setEnrollments(data.data.enrollments); setTotal(data.data.total); setTP(data.data.totalPages); })
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEnrollment(delModal);
      toast.success('Enrollment removed');
      setDelModal(null);
      load();
    } catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F1F2FF]">Enrollments</h1>
        <p className="text-sm text-[#AFB2BF] mt-0.5">{total} total enrollments</p>
      </div>
      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2C333F] text-[#AFB2BF] text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Plan / Status</th>
                <th className="text-left px-5 py-3">Pricing</th>
                <th className="text-left px-5 py-3">Activated / Expires</th>
                {isSA && <th className="text-right px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={5} /></td></tr>
               : enrollments.length === 0 ? <tr><td colSpan={6}><EmptyState message="No enrollments found." /></td></tr>
               : enrollments.map(e => {
                const instructor = (e.course || e.Course)?.instructor;
                const planName = (e.plan || 'free').toUpperCase();
                const isExpired = e.plan === 'silver' && e.expiresAt && new Date(e.expiresAt) <= new Date();
                const statusLabel = isExpired ? 'EXPIRED' : (e.status || 'ACTIVE').toUpperCase();

                return (
                  <tr key={e.id} className="border-b border-[#2C333F] hover:bg-[#2C333F]/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#F1F2FF]">
                        {(e.user || e.User) ? `${(e.user || e.User).firstName || ''} ${(e.user || e.User).lastName || ''}` : '—'}
                      </p>
                      <p className="text-xs text-[#585D69]">{(e.user || e.User)?.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#AFB2BF]">
                      <p className="font-medium text-white">{(e.course || e.Course)?.courseName || '—'}</p>
                      <p className="text-xs text-[#585D69]">Instructor: {instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}` : '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          e.plan === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          e.plan === 'silver' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                        }`}>
                          {planName}
                        </span>
                        <span className={`text-[10px] font-semibold ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#AFB2BF]">
                      <p>Paid: <strong className="text-emerald-400">₹{e.purchasePrice || 0}</strong></p>
                      <p className="text-[11px] text-[#585D69]">Course: ₹{e.coursePrice || (e.course || e.Course)?.price || 0}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#585D69]">
                      <p>Start: {new Date(e.activatedAt || e.createdAt).toLocaleDateString()}</p>
                      <p className={isExpired ? 'text-red-400 font-semibold' : ''}>
                        Expires: {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : 'Never'}
                      </p>
                    </td>
                    {isSA && <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setDelModal(e.id)} className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">Unenroll</button>
                    </td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-[#2C333F]">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      <DeleteConfirm isOpen={!!delModal} title="Remove Enrollment?" message="The student will lose access to this course." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
