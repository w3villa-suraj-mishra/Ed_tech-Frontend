import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, Pagination, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getReviews, deleteReview } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  return <AdminProtectedRoute><ReviewsInner /></AdminProtectedRoute>;
}

function ReviewsInner() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [totalPages, setTP] = useState(1);
  const [loading, setLoading] = useState(true);
  const [delModal, setDelModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getReviews({ page, limit: 15 })
      .then(({ data }) => { setReviews(data.data.reviews); setTotal(data.data.total); setTP(data.data.totalPages); })
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReview(delModal);
      toast.success('Review deleted');
      setDelModal(null);
      load();
    } catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#F1F2FF]">Reviews & Ratings</h1>
        <p className="text-sm text-[#AFB2BF] mt-0.5">{total} total reviews</p>
      </div>
      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2C333F] text-[#AFB2BF] text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Rating</th>
                <th className="text-left px-5 py-3">Review</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={5} /></td></tr>
               : reviews.length === 0 ? <tr><td colSpan={6}><EmptyState message="No reviews found." /></td></tr>
               : reviews.map(r => (
                <tr key={r.id} className="border-b border-[#2C333F] hover:bg-[#2C333F]/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#F1F2FF]">{r.user ? `${r.user.firstName} ${r.user.lastName}` : '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#AFB2BF] max-w-[150px] truncate">{r.Course?.courseName || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[#FFD60A] text-xs">{stars(r.rating || 0)}</span>
                    <span className="text-[#585D69] text-xs ml-1">({r.rating})</span>
                  </td>
                  <td className="px-5 py-3.5 text-[#AFB2BF] max-w-[200px] truncate">{r.review || '—'}</td>
                  <td className="px-5 py-3.5 text-[#585D69]">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setDelModal(r.id)} className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-[#2C333F]">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      <DeleteConfirm isOpen={!!delModal} title="Delete Review?" message="This review will be permanently removed." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
