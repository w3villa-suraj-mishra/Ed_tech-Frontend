import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, AdminInput, AdminTextarea, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  return <AdminProtectedRoute><CategoriesInner /></AdminProtectedRoute>;
}

function CategoriesInner() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [searchInput, setSI]  = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(null);
  const [delModal, setDelModal]       = useState(null);
  const [form, setForm]               = useState({ name: '', description: '' });
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getCategories({ search })
      .then(({ data }) => setCats(data.data))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 400); return () => clearTimeout(t); }, [searchInput]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await createCategory(form);
      toast.success('Category created');
      setCreateModal(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await updateCategory(editModal.id, form);
      toast.success('Category updated');
      setEditModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(delModal);
      toast.success('Category deleted');
      setDelModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditModal(c); };
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F1F2FF]">Categories</h1>
          <p className="text-sm text-[#AFB2BF] mt-0.5">{cats.length} categories</p>
        </div>
        <button onClick={() => { setForm({ name: '', description: '' }); setCreateModal(true); }}
          className="px-4 py-2 bg-[#FFD60A] text-[#000814] rounded-xl font-bold text-sm hover:bg-[#FFEE32] transition-colors">
          + Add Category
        </button>
      </div>

      <input value={searchInput} onChange={e => setSI(e.target.value)} placeholder="Search categories…"
        className="bg-[#161D29] border border-[#2C333F] rounded-lg px-4 py-2 text-sm text-[#F1F2FF] placeholder-[#585D69] focus:outline-none focus:border-[#FFD60A] w-64 mb-5" />

      {loading ? <TableSkeleton rows={6} cols={3} /> : cats.length === 0 ? (
        <EmptyState message="No categories found." action={
          <button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-[#FFD60A] text-[#000814] rounded-xl font-bold text-sm">Create First Category</button>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map(c => (
            <div key={c.id} className="bg-[#161D29] border border-[#2C333F] rounded-2xl p-5 hover:border-[#FFD60A]/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#F1F2FF]">{c.name}</h3>
                <span className="text-xs text-[#585D69] bg-[#2C333F] px-2 py-0.5 rounded-full">{c.courseCount || 0} courses</span>
              </div>
              <p className="text-sm text-[#AFB2BF] mb-4 line-clamp-2">{c.description || 'No description'}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="flex-1 py-1.5 rounded-lg bg-[#2C333F] hover:bg-[#424854] text-[#AFB2BF] text-xs transition-colors">Edit</button>
                {isSA && <button onClick={() => setDelModal(c.id)} className="flex-1 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit shared form */}
      {[{ open: createModal, title: 'Create Category', onClose: () => setCreateModal(false), onSubmit: handleCreate },
        { open: !!editModal, title: 'Edit Category', onClose: () => setEditModal(null), onSubmit: handleEdit }
      ].map(({ open, title, onClose, onSubmit }) => (
        <AdminModal key={title} isOpen={open} title={title} onClose={onClose}>
          <form onSubmit={onSubmit} className="space-y-4">
            <AdminInput label="Name" value={form.name} onChange={setF('name')} placeholder="e.g. Web Development" />
            <AdminTextarea label="Description (optional)" value={form.description} onChange={setF('description')} placeholder="Brief description…" rows={3} />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[#2C333F] text-[#AFB2BF] hover:bg-[#2C333F] text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#FFD60A] text-[#000814] font-bold text-sm hover:bg-[#FFEE32] disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </AdminModal>
      ))}

      <DeleteConfirm isOpen={!!delModal} title="Delete Category?" message="Courses in this category may also be affected." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
