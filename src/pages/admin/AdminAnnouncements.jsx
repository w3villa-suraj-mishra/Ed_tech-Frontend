import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAdminAnnouncements,
  createAdminAnnouncement,
  updateAdminAnnouncement,
  updateAdminAnnouncementStatus,
  deleteAdminAnnouncement
} from '../../services/admin/announcementAPI';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiEye,
  FiClock,
  FiTag,
  FiArrowRight,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter
} from 'react-icons/fi';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    highlightText: '',
    audience: 'ALL',
    ctaEnabled: false,
    ctaText: 'Claim Now',
    ctaUrl: '/courses',
    countdownEnabled: false,
    startAt: '',
    endAt: '',
    status: 'ACTIVE',
    priority: 'Normal',
    dismissible: true
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getAdminAnnouncements({
        status: statusFilter,
        audience: audienceFilter,
        search: searchTerm
      });
      if (res?.data?.success) {
        setAnnouncements(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [statusFilter, audienceFilter, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      highlightText: '',
      audience: 'ALL',
      ctaEnabled: false,
      ctaText: 'Claim Now',
      ctaUrl: '/courses',
      countdownEnabled: false,
      startAt: '',
      endAt: '',
      status: 'ACTIVE',
      priority: 'Normal',
      dismissible: true
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      message: item.message || '',
      highlightText: item.highlightText || '',
      audience: item.audience || 'ALL',
      ctaEnabled: !!item.ctaEnabled,
      ctaText: item.ctaText || 'Claim Now',
      ctaUrl: item.ctaUrl || '/courses',
      countdownEnabled: !!item.countdownEnabled,
      startAt: item.startAt ? new Date(item.startAt).toISOString().slice(0, 16) : '',
      endAt: item.endAt ? new Date(item.endAt).toISOString().slice(0, 16) : '',
      status: item.status || 'ACTIVE',
      priority: item.priority || 'Normal',
      dismissible: item.dismissible !== undefined ? item.dismissible : true
    });
    setModalOpen(true);
  };

  const handleDuplicate = async (item) => {
    try {
      const payload = {
        ...item,
        title: `${item.title} (Copy)`,
        status: 'DRAFT'
      };
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;

      const res = await createAdminAnnouncement(payload);
      if (res?.data?.success) {
        toast.success('Announcement duplicated as Draft');
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duplicate failed');
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      const res = await updateAdminAnnouncementStatus(item.id, nextStatus);
      if (res?.data?.success) {
        toast.success(`Announcement is now ${nextStatus}`);
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status toggle failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteAdminAnnouncement(id);
      if (res?.data?.success) {
        toast.success('Announcement deleted');
        setDeleteConfirmId(null);
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please enter Title and Message');
      return;
    }

    if (formData.ctaEnabled && (!formData.ctaText.trim() || !formData.ctaUrl.trim())) {
      toast.error('CTA Text and URL are required when CTA is enabled');
      return;
    }

    if (formData.countdownEnabled && (!formData.startAt || !formData.endAt)) {
      toast.error('Start and End dates are required for Countdown');
      return;
    }

    if (formData.startAt && formData.endAt && new Date(formData.endAt) <= new Date(formData.startAt)) {
      toast.error('End date must be later than Start date');
      return;
    }

    try {
      const payload = {
        ...formData,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : null
      };

      if (editingId) {
        const res = await updateAdminAnnouncement(editingId, payload);
        if (res?.data?.success) {
          toast.success('Announcement updated successfully');
          setModalOpen(false);
          fetchAnnouncements();
        }
      } else {
        const res = await createAdminAnnouncement(payload);
        if (res?.data?.success) {
          toast.success('Announcement created successfully');
          setModalOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'SCHEDULED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'DRAFT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'EXPIRED':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>📢 Announcement & Banner Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1">
              Create and target top promotional banners, special offers, and platform announcements.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <FiPlus className="text-base" />
            <span>Create Announcement</span>
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="bg-[#121620] border border-[#252C3A] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-3 text-[#8E95A5] text-sm" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0d16] border border-[#252C3A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8E95A5] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#8E95A5]">
              <FiFilter className="text-sm" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0a0d16] border border-[#252C3A] text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
                <option value="EXPIRED">Expired</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Audience Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#8E95A5]">
              <span>Audience:</span>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="bg-[#0a0d16] border border-[#252C3A] text-white text-xs rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="All">All Audiences</option>
                <option value="ALL">Everyone (ALL)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="INSTRUCTORS">Instructors Only</option>
              </select>
            </div>
          </div>

        </div>

        {/* Data Table */}
        <div className="bg-[#121620] border border-[#252C3A] rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#8E95A5] space-y-3">
              <div className="spinner mx-auto"></div>
              <p>Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8E95A5] space-y-2">
              <p className="text-2xl">📢</p>
              <p className="font-bold text-white text-sm">No announcements found</p>
              <p>Create a new promotional banner to start displaying announcements to learners.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-white border-collapse">
                <thead>
                  <tr className="bg-[#181F2E] border-b border-[#252C3A] text-[#8E95A5] uppercase font-bold text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Title & Details</th>
                    <th className="py-3.5 px-4">Audience</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Schedule / Range</th>
                    <th className="py-3.5 px-4">CTA & Details</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252C3A]">
                  {announcements.map((item) => (
                    <tr key={item.id} className="hover:bg-[#161D2A] transition-colors">
                      
                      {/* Title & Details */}
                      <td className="py-4 px-4 max-w-xs space-y-1">
                        <div className="flex items-center gap-2">
                          {item.highlightText && (
                            <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
                              {item.highlightText}
                            </span>
                          )}
                          <span className="font-bold text-sm text-white line-clamp-1">{item.title}</span>
                        </div>
                        <p className="text-[#8E95A5] line-clamp-2 text-xs">{item.message}</p>
                      </td>

                      {/* Audience */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] uppercase">
                          {item.audience}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4 text-[#8E95A5] whitespace-nowrap text-[11px]">
                        {item.startAt || item.endAt ? (
                          <div className="space-y-0.5">
                            <div>From: {item.startAt ? new Date(item.startAt).toLocaleString() : 'Immediate'}</div>
                            <div>To: {item.endAt ? new Date(item.endAt).toLocaleString() : 'Never'}</div>
                          </div>
                        ) : (
                          <span>Always Active</span>
                        )}
                      </td>

                      {/* CTA & Priority */}
                      <td className="py-4 px-4 whitespace-nowrap text-[#8E95A5] text-[11px] space-y-1">
                        {item.ctaEnabled ? (
                          <div className="text-blue-400 font-semibold">
                            CTA: {item.ctaText} → {item.ctaUrl}
                          </div>
                        ) : (
                          <span className="text-[#64748b]">No CTA</span>
                        )}
                        <div>Priority: <span className="font-bold text-white">{item.priority}</span></div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-1.5">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-2 rounded-lg bg-[#252C3A] text-white hover:bg-blue-600 transition-colors"
                          title="Preview Banner"
                        >
                          <FiEye className="text-sm" />
                        </button>

                        {/* Status Toggle */}
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`p-2 rounded-lg text-white transition-colors ${
                            item.status === 'ACTIVE' ? 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300' : 'bg-slate-700 hover:bg-emerald-600'
                          }`}
                          title={item.status === 'ACTIVE' ? 'Deactivate' : 'Publish / Activate'}
                        >
                          <FiCheckCircle className="text-sm" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-2 rounded-lg bg-[#252C3A] text-white hover:bg-indigo-600 transition-colors"
                          title="Duplicate"
                        >
                          <FiCopy className="text-sm" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-lg bg-[#252C3A] text-white hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="text-sm" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-lg bg-[#252C3A] text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* CREATE / EDIT MODAL WITH LIVE PREVIEW */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#121620] border border-[#252C3A] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl custom-scrollbar text-white">
            
            <div className="flex items-center justify-between border-b border-[#252C3A] pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? '✏️ Edit Announcement' : '📢 Create New Announcement'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#8E95A5] hover:text-white hover:bg-[#252C3A]"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* LIVE BANNER PREVIEW BOX */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                👀 Live User Banner Preview
              </span>
              <div className="w-full bg-gradient-to-r from-[#090d19] via-[#0f172a] to-[#090d19] border border-blue-500/40 text-white rounded-2xl p-3.5 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
                  {formData.highlightText && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm shrink-0">
                      <FiTag className="text-xs" />
                      <span>{formData.highlightText}</span>
                    </span>
                  )}
                  <div className="font-medium text-richblack-100 flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-white">{formData.title || 'Rakshabandhan Special Offer'}:</span>
                    <span>{formData.message || 'Celebrate Rakshabandhan — Get 50% OFF'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 shrink-0">
                  {formData.countdownEnabled && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold">
                      <FiClock className="text-blue-400 text-xs animate-pulse" />
                      <span>07h 32m 28s</span>
                    </div>
                  )}

                  {formData.ctaEnabled && (
                    <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md">
                      <span>{formData.ctaText || 'Claim Now'}</span>
                      <FiArrowRight className="text-xs" />
                    </button>
                  )}

                  {formData.dismissible && (
                    <div className="p-1 text-richblack-400">
                      <FiX className="text-base" />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* FORM INPUTS */}
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8E95A5] font-bold mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rakshabandhan Special Offer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0a0d16] border border-[#252C3A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#8E95A5] font-bold mb-1">Highlight Text / Promo Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. RAKSHA BANDHAN50"
                    value={formData.highlightText}
                    onChange={(e) => setFormData({ ...formData, highlightText: e.target.value })}
                    className="w-full bg-[#0a0d16] border border-[#252C3A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8E95A5] font-bold mb-1">Message *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Celebrate Rakshabandhan — Get 50% OFF on all premium courses"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0a0d16] border border-[#252C3A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#8E95A5] font-bold mb-1">Target Audience *</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-[#0a0d16] border border-[#252C3A] text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Everyone (ALL)</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="INSTRUCTORS">Instructors Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8E95A5] font-bold mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#0a0d16] border border-[#252C3A] text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High (Top Display)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8E95A5] font-bold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0a0d16] border border-[#252C3A] text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">Active (Publish Now)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* CTA OPTIONS */}
              <div className="bg-[#0a0d16] border border-[#252C3A] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Call To Action (CTA Button)</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.ctaEnabled}
                      onChange={(e) => setFormData({ ...formData, ctaEnabled: e.target.checked })}
                      className="accent-blue-600 rounded w-4 h-4"
                    />
                    <span>Enable CTA Button</span>
                  </label>
                </div>

                {formData.ctaEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[#8E95A5] mb-1">Button Text *</label>
                      <input
                        type="text"
                        placeholder="e.g. Claim Now"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full bg-[#121620] border border-[#252C3A] rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8E95A5] mb-1">Button URL *</label>
                      <input
                        type="text"
                        placeholder="e.g. /courses or https://..."
                        value={formData.ctaUrl}
                        onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                        className="w-full bg-[#121620] border border-[#252C3A] rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* COUNTDOWN OPTIONS */}
              <div className="bg-[#0a0d16] border border-[#252C3A] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Countdown Timer & Expiration Schedule</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.countdownEnabled}
                      onChange={(e) => setFormData({ ...formData, countdownEnabled: e.target.checked })}
                      className="accent-blue-600 rounded w-4 h-4"
                    />
                    <span>Enable Countdown</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[#8E95A5] mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                      className="w-full bg-[#121620] border border-[#252C3A] rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8E95A5] mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                      className="w-full bg-[#121620] border border-[#252C3A] rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* DISMISSIBLE TOGGLE */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                  <input
                    type="checkbox"
                    checked={formData.dismissible}
                    onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                    className="accent-blue-600 rounded w-4 h-4"
                  />
                  <span>Allow users to dismiss banner (Show × button)</span>
                </label>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252C3A]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#252C3A] text-[#8E95A5] hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg"
                >
                  {editingId ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FULL BANNER PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121620] border border-[#252C3A] rounded-3xl w-full max-w-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Banner Preview: {previewItem.title}</h3>
              <button onClick={() => setPreviewItem(null)} className="p-1 text-[#8E95A5] hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="w-full bg-gradient-to-r from-[#090d19] via-[#0f172a] to-[#090d19] border border-blue-500/40 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {previewItem.highlightText && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] uppercase">
                    {previewItem.highlightText}
                  </span>
                )}
                <span><strong>{previewItem.title}:</strong> {previewItem.message}</span>
              </div>
              {previewItem.ctaEnabled && (
                <button className="px-3.5 py-1.5 rounded-xl bg-blue-600 font-bold text-white shrink-0">
                  {previewItem.ctaText || 'Claim Now'}
                </button>
              )}
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setPreviewItem(null)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121620] border border-[#252C3A] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center text-xl mx-auto">
              <FiAlertCircle />
            </div>
            <h3 className="text-base font-bold">Delete Announcement?</h3>
            <p className="text-xs text-[#8E95A5]">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#252C3A] text-[#8E95A5] hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
