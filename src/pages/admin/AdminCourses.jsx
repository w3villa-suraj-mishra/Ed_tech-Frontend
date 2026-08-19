import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, StatusBadge, Pagination, AdminInput, AdminSelect, AdminTextarea, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import {
  getCourses, getCourse, updateCourse, updateCourseStatus, deleteCourse, getCategories,
  createSection, updateSection, deleteSection,
  createSubSection, updateSubSection, deleteSubSection
} from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  return <AdminProtectedRoute><CoursesInner /></AdminProtectedRoute>;
}

function CoursesInner() {
  const [courses, setCourses] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTP]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Modals
  const [editModal, setEditModal]       = useState(null);
  const [sectionsModal, setSectionsModal] = useState(null); // course obj
  const [delModal, setDelModal]         = useState(null);
  
  // Section / SubSection state inside sectionsModal
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Section forms
  const [secForm, setSecForm] = useState({ sectionName: '' });
  const [editingSec, setEditingSec] = useState(null);
  const [delSecId, setDelSecId] = useState(null);

  // SubSection forms
  const [subModal, setSubModal] = useState(null); // { secId, subObj (optional) }
  const [subForm, setSubForm] = useState({ title: '', description: '', timeDuration: '' });
  const [subVideo, setSubVideo] = useState(null);
  const [delSubId, setDelSubId] = useState(null);

  const [form, setForm]             = useState({});
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [thumbnail, setThumbnail]   = useState(null);

  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getCourses({ page, limit: 15, search, status: statusFilter })
      .then(({ data }) => { setCourses(data.data.courses); setTotal(data.data.total); setTP(data.data.totalPages); })
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getCategories().then(({ data }) => setCategories(data.data)).catch(() => {}); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCourseFull = (courseId) => {
    setLoadingDetails(true);
    getCourse(courseId)
      .then(({ data }) => setCourseDetails(data.data))
      .catch(() => toast.error('Failed to load course sections'))
      .finally(() => setLoadingDetails(false));
  };

  const openSectionsModal = (c) => {
    setSectionsModal(c);
    loadCourseFull(c.id);
  };

  const openEdit = (c) => {
    setForm({ courseName: c.courseName, courseDescription: c.courseDescription, price: c.price, tag: c.tag, status: c.status, categoryId: c.categoryId, whatYouWillLearn: c.whatYouWillLearn, instructions: c.instructions });
    setThumbnail(null);
    setEditModal(c);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.courseName?.trim()) { toast.error('Course name required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
      if (thumbnail) fd.append('thumbnailImage', thumbnail);
      await updateCourse(editModal.id, fd);
      toast.success('Course updated');
      setEditModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const toggleStatus = async (c) => {
    const next = c.status === 'Published' ? 'Draft' : 'Published';
    try {
      await updateCourseStatus(c.id, next);
      toast.success(`Course ${next.toLowerCase()}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(delModal);
      toast.success('Course deleted');
      setDelModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setDeleting(false); }
  };

  // Section CRUD
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!secForm.sectionName.trim()) return;
    try {
      if (editingSec) {
        await updateSection(editingSec.id, { sectionName: secForm.sectionName });
        toast.success('Section updated');
      } else {
        await createSection({ courseId: sectionsModal.id, sectionName: secForm.sectionName });
        toast.success('Section created');
      }
      setSecForm({ sectionName: '' });
      setEditingSec(null);
      loadCourseFull(sectionsModal.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteSection = async () => {
    try {
      await deleteSection(delSecId);
      toast.success('Section deleted');
      setDelSecId(null);
      loadCourseFull(sectionsModal.id);
    } catch { toast.error('Failed to delete section'); }
  };

  // SubSection CRUD
  const openSubModal = (secId, sub = null) => {
    setSubModal({ secId, sub });
    setSubForm(sub ? { title: sub.title || '', description: sub.description || '', timeDuration: sub.timeDuration || '' } : { title: '', description: '', timeDuration: '' });
    setSubVideo(null);
  };

  const handleSaveSubSection = async (e) => {
    e.preventDefault();
    if (!subForm.title.trim()) return;
    try {
      const fd = new FormData();
      fd.append('title', subForm.title);
      if (subForm.description) fd.append('description', subForm.description);
      if (subForm.timeDuration) fd.append('timeDuration', subForm.timeDuration);
      if (subVideo) fd.append('video', subVideo);

      if (subModal.sub) {
        await updateSubSection(subModal.sub.id, fd);
        toast.success('Lecture updated');
      } else {
        fd.append('sectionId', subModal.secId);
        await createSubSection(fd);
        toast.success('Lecture added');
      }
      setSubModal(null);
      loadCourseFull(sectionsModal.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteSubSection = async () => {
    try {
      await deleteSubSection(delSubId);
      toast.success('Lecture deleted');
      setDelSubId(null);
      loadCourseFull(sectionsModal.id);
    } catch { toast.error('Failed to delete lecture'); }
  };

  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F1F2FF]">Courses</h1>
          <p className="text-sm text-[#AFB2BF] mt-0.5">{total} total courses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search courses…"
          className="bg-[#161D29] border border-[#2C333F] rounded-lg px-4 py-2 text-sm text-[#F1F2FF] placeholder-[#585D69] focus:outline-none focus:border-[#FFD60A] w-64" />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#161D29] border border-[#2C333F] rounded-lg px-3 py-2 text-sm text-[#F1F2FF] focus:outline-none focus:border-[#FFD60A]">
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2C333F] text-[#AFB2BF] text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Instructor</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Price</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={6} /></td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="No courses found." /></td></tr>
              ) : courses.map(c => (
                <tr key={c.id} className="border-b border-[#2C333F] hover:bg-[#2C333F]/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {c.thumbnail && <img src={c.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                      <span className="font-medium text-[#F1F2FF] max-w-[180px] truncate">{c.courseName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#AFB2BF]">{c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : '—'}</td>
                  <td className="px-5 py-3.5 text-[#AFB2BF]">{c.Category?.name || c.category?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-[#AFB2BF]">₹{c.price ?? 0}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openSectionsModal(c)} className="px-3 py-1 rounded-lg bg-[#FFD60A]/10 hover:bg-[#FFD60A]/20 text-[#FFD60A] text-xs font-semibold transition-colors">
                        Sections
                      </button>
                      <button onClick={() => toggleStatus(c)}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${c.status === 'Published' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                        {c.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => openEdit(c)} className="px-3 py-1 rounded-lg bg-[#2C333F] hover:bg-[#424854] text-[#AFB2BF] text-xs transition-colors">Edit</button>
                      {isSA && <button onClick={() => setDelModal(c.id)} className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">Delete</button>}
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

      {/* Edit Course Modal */}
      <AdminModal isOpen={!!editModal} title="Edit Course" onClose={() => setEditModal(null)} size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <AdminInput label="Course Name" value={form.courseName || ''} onChange={setF('courseName')} />
          <AdminTextarea label="Description" value={form.courseDescription || ''} onChange={setF('courseDescription')} rows={3} />
          <AdminTextarea label="What You Will Learn" value={form.whatYouWillLearn || ''} onChange={setF('whatYouWillLearn')} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Price (₹)" type="number" value={form.price ?? ''} onChange={setF('price')} />
            <AdminInput label="Tag" value={form.tag || ''} onChange={setF('tag')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminSelect label="Status" value={form.status || 'Draft'} onChange={setF('status')}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </AdminSelect>
            <AdminSelect label="Category" value={form.categoryId || ''} onChange={setF('categoryId')}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </AdminSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#AFB2BF] mb-1">Thumbnail</label>
            {editModal?.thumbnail && !thumbnail && <img src={editModal.thumbnail} alt="current" className="w-24 h-16 object-cover rounded-lg mb-2" />}
            <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])}
              className="text-sm text-[#AFB2BF] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#2C333F] file:text-[#F1F2FF] file:text-xs hover:file:bg-[#424854]" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-lg border border-[#2C333F] text-[#AFB2BF] hover:bg-[#2C333F] text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#FFD60A] text-[#000814] font-bold text-sm hover:bg-[#FFEE32] disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </AdminModal>

      {/* Sections & Subsections Management Modal */}
      <AdminModal isOpen={!!sectionsModal} title={`Manage Sections — ${sectionsModal?.courseName}`} onClose={() => setSectionsModal(null)} size="xl">
        <div className="space-y-6">
          {/* Create / Edit Section Form */}
          <form onSubmit={handleSaveSection} className="flex items-center gap-3 bg-[#000814] p-3 rounded-xl border border-[#2C333F]">
            <input
              value={secForm.sectionName}
              onChange={e => setSecForm({ sectionName: e.target.value })}
              placeholder={editingSec ? "Update section name…" : "Add new section name…"}
              className="flex-1 bg-transparent text-sm text-[#F1F2FF] focus:outline-none px-2"
            />
            {editingSec && (
              <button type="button" onClick={() => { setEditingSec(null); setSecForm({ sectionName: '' }); }} className="text-xs text-[#AFB2BF] hover:text-white px-2">Cancel</button>
            )}
            <button type="submit" className="px-4 py-2 bg-[#FFD60A] text-[#000814] font-bold text-xs rounded-lg hover:bg-[#FFEE32]">
              {editingSec ? 'Update' : '+ Add Section'}
            </button>
          </form>

          {/* Sections List */}
          {loadingDetails ? (
            <TableSkeleton rows={4} cols={2} />
          ) : !courseDetails?.sections?.length ? (
            <p className="text-sm text-[#AFB2BF] text-center py-6">No sections yet. Create one above!</p>
          ) : (
            <div className="space-y-4">
              {courseDetails.sections.map((sec, idx) => (
                <div key={sec.id} className="bg-[#000814] border border-[#2C333F] rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-[#2C333F] pb-3 mb-3">
                    <span className="font-semibold text-sm text-[#F1F2FF]">
                      Section {idx + 1}: {sec.sectionName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openSubModal(sec.id)} className="px-2.5 py-1 rounded bg-[#FFD60A]/10 text-[#FFD60A] text-xs font-semibold hover:bg-[#FFD60A]/20">
                        + Add Lecture
                      </button>
                      <button onClick={() => { setEditingSec(sec); setSecForm({ sectionName: sec.sectionName }); }} className="px-2 py-1 rounded bg-[#2C333F] text-[#AFB2BF] text-xs hover:text-white">
                        Edit
                      </button>
                      <button onClick={() => setDelSecId(sec.id)} className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20">
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Subsections List */}
                  <div className="pl-4 space-y-2">
                    {sec.subSections?.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-[#161D29] p-2.5 rounded-lg border border-[#2C333F]/50">
                        <div>
                          <p className="text-xs font-medium text-[#F1F2FF]">{sub.title}</p>
                          {sub.timeDuration && <p className="text-[10px] text-[#585D69]">Duration: {sub.timeDuration}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.videoUrl && (
                            <a href={sub.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                              ▶ Video
                            </a>
                          )}
                          <button onClick={() => openSubModal(sec.id, sub)} className="text-xs text-[#AFB2BF] hover:text-white px-1">Edit</button>
                          <button onClick={() => setDelSubId(sub.id)} className="text-xs text-red-400 hover:text-red-300 px-1">Delete</button>
                        </div>
                      </div>
                    ))}
                    {!sec.subSections?.length && (
                      <p className="text-xs text-[#585D69] italic">No lectures in this section.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminModal>

      {/* Add / Edit SubSection Modal */}
      <AdminModal isOpen={!!subModal} title={subModal?.sub ? "Edit Lecture" : "Add Lecture"} onClose={() => setSubModal(null)}>
        <form onSubmit={handleSaveSubSection} className="space-y-4">
          <AdminInput label="Lecture Title" value={subForm.title} onChange={e => setSubForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to Variables" />
          <AdminTextarea label="Description" value={subForm.description} onChange={e => setSubForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          <AdminInput label="Duration (e.g. 10m 30s)" value={subForm.timeDuration} onChange={e => setSubForm(p => ({ ...p, timeDuration: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-[#AFB2BF] mb-1">Video File</label>
            <input type="file" accept="video/*" onChange={e => setSubVideo(e.target.files[0])} className="text-sm text-[#AFB2BF] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#2C333F] file:text-[#F1F2FF] file:text-xs" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setSubModal(null)} className="flex-1 py-2.5 rounded-lg border border-[#2C333F] text-[#AFB2BF] text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#FFD60A] text-[#000814] font-bold text-sm hover:bg-[#FFEE32]">Save Lecture</button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmations */}
      <DeleteConfirm isOpen={!!delModal} title="Delete Course?" message="This will permanently delete the course, all its sections, subsections, and enrollments." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
      <DeleteConfirm isOpen={!!delSecId} title="Delete Section?" message="This will delete this section and all its lectures." onClose={() => setDelSecId(null)} onConfirm={handleDeleteSection} />
      <DeleteConfirm isOpen={!!delSubId} title="Delete Lecture?" message="This will delete this video lecture." onClose={() => setDelSubId(null)} onConfirm={handleDeleteSubSection} />
    </AdminLayout>
  );
}
