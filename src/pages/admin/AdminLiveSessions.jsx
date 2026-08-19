import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, StatusBadge, Pagination, AdminInput, AdminSelect, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getLiveSessions, createLiveSession, updateLiveSession, deleteLiveSession, getCourses } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminLiveSessions() {
  return <AdminProtectedRoute><LiveSessionsInner /></AdminProtectedRoute>;
}

const EMPTY = { courseId: '', sessionName: '', startTime: '', endTime: '', status: 'Scheduled' };

function LiveSessionsInner() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [totalPages, setTP] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(null);
  const [delModal, setDelModal]       = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getLiveSessions({ page, limit: 15 })
      .then(({ data }) => { setSessions(data.data.sessions); setTotal(data.data.total); setTP(data.data.totalPages); })
      .catch(() => toast.error('Failed to load sessions'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getCourses({ limit: 200 }).then(({ data }) => setCourses(data.data.courses)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.sessionName) { toast.error('Course and session name required'); return; }
    setSaving(true);
    try { await createLiveSession(form); toast.success('Session created'); setCreateModal(false); setForm(EMPTY); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateLiveSession(editModal.id, form); toast.success('Session updated'); setEditModal(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteLiveSession(delModal); toast.success('Session deleted'); setDelModal(null); load(); }
    catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  const openEdit = (s) => { setForm({ courseId: s.courseId, sessionName: s.sessionName, startTime: s.startTime?.slice(0,16) || '', endTime: s.endTime?.slice(0,16) || '', status: s.status }); setEditModal(s); };
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const SessionForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <AdminSelect label="Course" value={form.courseId} onChange={setF('courseId')}>
        <option value="">Select course</option>
        {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
      </AdminSelect>
      <AdminInput label="Session Name" value={form.sessionName} onChange={setF('sessionName')} placeholder="e.g. Live Q&A Week 1" />
      <div className="grid grid-cols-2 gap-3">
        <AdminInput label="Start Time" type="datetime-local" value={form.startTime} onChange={setF('startTime')} />
        <AdminInput label="End Time" type="datetime-local" value={form.endTime} onChange={setF('endTime')} />
      </div>
      <AdminSelect label="Status" value={form.status} onChange={setF('status')}>
        <option value="Scheduled">Scheduled</option>
        <option value="Live">Live</option>
        <option value="Ended">Ended</option>
      </AdminSelect>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setCreateModal(false); setEditModal(null); }} className="flex-1 py-2.5 rounded-lg border border-[#2C333F] text-[#AFB2BF] hover:bg-[#2C333F] text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#FFD60A] text-[#000814] font-bold text-sm hover:bg-[#FFEE32] disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F1F2FF]">Live Sessions</h1>
          <p className="text-sm text-[#AFB2BF] mt-0.5">{total} total sessions</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setCreateModal(true); }}
          className="px-4 py-2 bg-[#FFD60A] text-[#000814] rounded-xl font-bold text-sm hover:bg-[#FFEE32] transition-colors">
          + Schedule Session
        </button>
      </div>

      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2C333F] text-[#AFB2BF] text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">Session</th>
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Start</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="px-5 py-4"><TableSkeleton rows={6} cols={4} /></td></tr>
               : sessions.length === 0 ? <tr><td colSpan={5}><EmptyState message="No sessions found." /></td></tr>
               : sessions.map(s => (
                <tr key={s.id} className="border-b border-[#2C333F] hover:bg-[#2C333F]/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[#F1F2FF]">{s.sessionName}</td>
                  <td className="px-5 py-3.5 text-[#AFB2BF]">{s.Course?.courseName || '—'}</td>
                  <td className="px-5 py-3.5 text-[#585D69]">{s.startTime ? new Date(s.startTime).toLocaleString() : '—'}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="px-3 py-1 rounded-lg bg-[#2C333F] hover:bg-[#424854] text-[#AFB2BF] text-xs transition-colors">Edit</button>
                      <button onClick={() => setDelModal(s.id)} className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">Delete</button>
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

      <AdminModal isOpen={createModal} title="Schedule Live Session" onClose={() => setCreateModal(false)}>
        <SessionForm onSubmit={handleCreate} />
      </AdminModal>
      <AdminModal isOpen={!!editModal} title="Edit Live Session" onClose={() => setEditModal(null)}>
        <SessionForm onSubmit={handleEdit} />
      </AdminModal>
      <DeleteConfirm isOpen={!!delModal} title="Delete Session?" message="This live session will be permanently removed." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
