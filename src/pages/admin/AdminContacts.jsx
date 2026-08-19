import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, StatusBadge, Pagination, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getContacts, updateContactStatus, deleteContact } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  return <AdminProtectedRoute><ContactsInner /></AdminProtectedRoute>;
}

function ContactsInner() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTP]     = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [searchInput, setSI]    = useState('');
  const [statusFilter, setSF]   = useState('');

  const [viewModal, setViewModal] = useState(null);
  const [delModal, setDelModal]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getContacts({ page, limit: 15, search, status: statusFilter })
      .then(({ data }) => {
        setContacts(data.data.contacts);
        setTotal(data.data.total);
        setTP(data.data.totalPages);
      })
      .catch(() => toast.error('Failed to load contact submissions'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400); return () => clearTimeout(t); }, [searchInput]);

  const handleStatusChange = async (contact, newStatus) => {
    try {
      await updateContactStatus(contact.id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      load();
      if (viewModal?.id === contact.id) {
        setViewModal(p => ({ ...p, status: newStatus }));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContact(delModal);
      toast.success('Entry deleted');
      setDelModal(null);
      load();
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F1F2FF]">Contact Submissions</h1>
          <p className="text-sm text-[#AFB2BF] mt-0.5">{total} total inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={searchInput}
          onChange={e => setSI(e.target.value)}
          placeholder="Search name, email or message…"
          className="bg-[#161D29] border border-[#2C333F] rounded-lg px-4 py-2 text-sm text-[#F1F2FF] placeholder-[#585D69] focus:outline-none focus:border-[#FFD60A] w-72"
        />
        <select
          value={statusFilter}
          onChange={e => { setSF(e.target.value); setPage(1); }}
          className="bg-[#161D29] border border-[#2C333F] rounded-lg px-3 py-2 text-sm text-[#F1F2FF] focus:outline-none focus:border-[#FFD60A]"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
          <option value="Ignored">Ignored</option>
        </select>
      </div>

      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2C333F] text-[#AFB2BF] text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">User Details</th>
                <th className="text-left px-5 py-3">Phone</th>
                <th className="text-left px-5 py-3">Message</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={5} /></td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="No contact inquiries found." /></td></tr>
              ) : contacts.map(c => (
                <tr key={c.id} className="border-b border-[#2C333F] hover:bg-[#2C333F]/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#F1F2FF]">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-[#585D69]">{c.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#AFB2BF]">
                    {c.phoneNo ? `${c.countrycode || ''} ${c.phoneNo}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[#AFB2BF] max-w-[240px] truncate">
                    {c.message}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[#585D69]">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewModal(c)} className="px-3 py-1 rounded-lg bg-[#2C333F] hover:bg-[#424854] text-[#AFB2BF] text-xs transition-colors">
                        View
                      </button>
                      {c.status !== 'Resolved' && (
                        <button onClick={() => handleStatusChange(c, 'Resolved')} className="px-3 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs transition-colors">
                          Resolve
                        </button>
                      )}
                      {isSA && (
                        <button onClick={() => setDelModal(c.id)} className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">
                          Delete
                        </button>
                      )}
                    </div>
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

      {/* View Details Modal */}
      <AdminModal isOpen={!!viewModal} title="Inquiry Details" onClose={() => setViewModal(null)}>
        {viewModal && (
          <div className="space-y-4 text-sm text-[#F1F2FF]">
            <div className="grid grid-cols-2 gap-4 bg-[#000814] p-4 rounded-xl border border-[#2C333F]">
              <div>
                <p className="text-xs text-[#AFB2BF]">Name</p>
                <p className="font-semibold">{viewModal.firstName} {viewModal.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-[#AFB2BF]">Email</p>
                <p className="font-semibold">{viewModal.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#AFB2BF]">Phone</p>
                <p className="font-semibold">{viewModal.phoneNo ? `${viewModal.countrycode || ''} ${viewModal.phoneNo}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#AFB2BF]">Status</p>
                <StatusBadge status={viewModal.status} />
              </div>
            </div>

            <div>
              <p className="text-xs text-[#AFB2BF] mb-1">Message</p>
              <div className="bg-[#000814] p-4 rounded-xl border border-[#2C333F] whitespace-pre-wrap leading-relaxed">
                {viewModal.message}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStatusChange(viewModal, 'Pending')}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${viewModal.status === 'Pending' ? 'border-[#FFD60A] text-[#FFD60A]' : 'border-[#2C333F] text-[#AFB2BF]'}`}
              >
                Mark Pending
              </button>
              <button
                onClick={() => handleStatusChange(viewModal, 'Resolved')}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${viewModal.status === 'Resolved' ? 'border-green-500 text-green-400' : 'border-[#2C333F] text-[#AFB2BF]'}`}
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleStatusChange(viewModal, 'Ignored')}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold ${viewModal.status === 'Ignored' ? 'border-gray-500 text-gray-400' : 'border-[#2C333F] text-[#AFB2BF]'}`}
              >
                Ignore
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <DeleteConfirm isOpen={!!delModal} title="Delete Contact Entry?" message="This contact submission will be permanently removed." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
