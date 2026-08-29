import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, AdminInput, AdminTextarea, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getAdminArticles, createArticle, updateArticle, deleteArticle } from '../../services/operations/articleAPI';
import toast from 'react-hot-toast';

export default function AdminArticles() {
  return (
    <AdminProtectedRoute>
      <ArticlesInner />
    </AdminProtectedRoute>
  );
}

function ArticlesInner() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [delModal, setDelModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const [form, setForm] = useState({
    title: '',
    category: 'Engineering & Tech',
    readTime: '5 min read',
    author: `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim(),
    summary: '',
    content: '',
    published: true,
  });

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const data = await getAdminArticles(adminToken);
    setArticles(data || []);
    setLoading(false);
  }, [adminToken]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const setF = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error('Title, Summary, and Content are required.');
      return;
    }

    setSaving(true);
    const success = await createArticle(form, adminToken);
    setSaving(false);

    if (success) {
      setCreateModal(false);
      setForm({
        title: '',
        category: 'Engineering & Tech',
        readTime: '5 min read',
        author: `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim(),
        summary: '',
        content: '',
        published: true,
      });
      loadArticles();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error('Title, Summary, and Content are required.');
      return;
    }

    setSaving(true);
    const success = await updateArticle(editModal.id, form, adminToken);
    setSaving(false);

    if (success) {
      setEditModal(null);
      loadArticles();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const success = await deleteArticle(delModal, adminToken);
    setDeleting(false);

    if (success) {
      setDelModal(null);
      loadArticles();
    }
  };

  const openEdit = (art) => {
    setForm({
      title: art.title || '',
      category: art.category || 'Engineering & Tech',
      readTime: art.readTime || '5 min read',
      author: art.author || 'Admin Team',
      summary: art.summary || '',
      content: art.content || '',
      published: art.published !== undefined ? art.published : true,
    });
    setEditModal(art);
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F1F2FF]">Articles Management</h1>
          <p className="text-sm text-[#AFB2BF] mt-0.5">
            Create, publish, and update frontend learn articles ({articles.length} total)
          </p>
        </div>
        <button
          onClick={() => {
            setForm({
              title: '',
              category: 'Engineering & Tech',
              readTime: '5 min read',
              author: `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim(),
              summary: '',
              content: '',
              published: true,
            });
            setCreateModal(true);
          }}
          className="px-4 py-2 bg-[#FFD60A] text-[#000814] rounded-xl font-bold text-sm hover:bg-[#FFEE32] transition-colors"
        >
          + Create Article
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search articles by title or category..."
        className="bg-[#161D29] border border-[#2C333F] rounded-lg px-4 py-2 text-sm text-[#F1F2FF] placeholder-[#585D69] focus:outline-none focus:border-[#FFD60A] w-72 mb-5"
      />

      {loading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : filteredArticles.length === 0 ? (
        <EmptyState
          message="No articles generated yet."
          action={
            <button
              onClick={() => setCreateModal(true)}
              className="px-4 py-2 bg-[#FFD60A] text-[#000814] rounded-xl font-bold text-sm"
            >
              Generate First Article
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-[#161D29] border border-[#2C333F] rounded-2xl p-5 hover:border-[#FFD60A]/30 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] bg-[#FFD60A]/10 text-[#FFD60A] px-2.5 py-0.5 rounded-full font-bold">
                    {art.category}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      art.published
                        ? 'bg-[#0B1120]merald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {art.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-bold text-[#F1F2FF] text-base mb-1.5 line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-[#AFB2BF] mb-3 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#2C333F]">
                <div className="flex items-center justify-between text-[11px] text-[#585D69] mb-3">
                  <span>By {art.author}</span>
                  <span>{art.readTime}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(art)}
                    className="flex-1 py-1.5 rounded-lg bg-[#2C333F] hover:bg-[#424854] text-[#AFB2BF] text-xs font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDelModal(art.id)}
                    className="flex-1 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODALS */}
      {[
        { open: createModal, title: 'Generate New Article', onClose: () => setCreateModal(false), onSubmit: handleCreate },
        { open: !!editModal, title: 'Edit Article', onClose: () => setEditModal(null), onSubmit: handleEdit },
      ].map(({ open, title, onClose, onSubmit }) => (
        <AdminModal key={title} isOpen={open} title={title} onClose={onClose} size="lg">
          <form onSubmit={onSubmit} className="space-y-4">
            <AdminInput
              label="Article Title *"
              value={form.title}
              onChange={setF('title')}
              placeholder="e.g. Advanced System Design Patterns"
            />
            <div className="grid grid-cols-2 gap-3">
              <AdminInput
                label="Category"
                value={form.category}
                onChange={setF('category')}
                placeholder="e.g. Frontend / Backend"
              />
              <AdminInput
                label="Read Time"
                value={form.readTime}
                onChange={setF('readTime')}
                placeholder="e.g. 7 min read"
              />
            </div>
            <AdminInput
              label="Author Name"
              value={form.author}
              onChange={setF('author')}
              placeholder="e.g. Admin Team"
            />
            <AdminTextarea
              label="Short Summary *"
              value={form.summary}
              onChange={setF('summary')}
              placeholder="Enter brief teaser for the article card..."
              rows={2}
            />
            <AdminTextarea
              label="Full Article Content *"
              value={form.content}
              onChange={setF('content')}
              placeholder="Enter complete article text/markdown..."
              rows={6}
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={setF('published')}
                className="w-4 h-4 accent-[#FFD60A] rounded cursor-pointer"
              />
              <label htmlFor="published" className="text-xs text-[#F1F2FF] cursor-pointer font-semibold">
                Publish immediately to student dashboard
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-[#2C333F] text-[#AFB2BF] hover:bg-[#2C333F] text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-[#FFD60A] text-[#000814] font-bold text-sm hover:bg-[#FFEE32] disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </AdminModal>
      ))}

      <DeleteConfirm
        isOpen={!!delModal}
        title="Delete Article?"
        message="This article will be permanently deleted from the frontend."
        onClose={() => setDelModal(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AdminLayout>
  );
}
