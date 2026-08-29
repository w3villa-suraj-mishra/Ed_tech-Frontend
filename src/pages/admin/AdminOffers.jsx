import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAllOffers,
  createOffer,
  updateOffer,
  updateOfferStatus,
  duplicateOffer,
  deleteOffer
} from '../../services/admin/offerAPI';
import { getAdminCourses } from '../../services/admin/adminAPI';
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
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiPercent,
  FiDollarSign,
  FiBookOpen
} from 'react-icons/fi';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [viewDetailItem, setViewDetailItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    scope: 'ALL_COURSES',
    courseIds: [],
    startAt: '',
    endAt: '',
    maxUses: '',
    maxUsesPerUser: '',
    audience: 'ALL',
    status: 'ACTIVE'
  });

  const [courseSearch, setCourseSearch] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await getAllOffers({
        search: searchTerm,
        status: statusFilter,
        discountType: discountTypeFilter
      });
      if (res.data?.success) {
        setOffers(res.data.offers || []);
      }
    } catch (err) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    try {
      const res = await getAdminCourses();
      if (res.data?.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses list for selection');
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchCoursesList();
  }, [statusFilter, discountTypeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOffers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const parseLocalDatetime = (dtStr) => {
    if (!dtStr) return '';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  };

  const formatLocalDatetime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setFormData({
      name: '',
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      scope: 'ALL_COURSES',
      courseIds: [],
      startAt: formatLocalDatetime(now.toISOString()),
      endAt: formatLocalDatetime(future.toISOString()),
      maxUses: '',
      maxUsesPerUser: '1',
      audience: 'ALL',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingId(offer.id);
    setFormData({
      name: offer.name || '',
      code: offer.code || '',
      description: offer.description || '',
      discountType: offer.discountType || 'PERCENTAGE',
      discountValue: offer.discountValue !== undefined ? String(offer.discountValue) : '',
      scope: offer.scope || 'ALL_COURSES',
      courseIds: offer.courses ? offer.courses.map((c) => c.id) : [],
      startAt: formatLocalDatetime(offer.startAt),
      endAt: formatLocalDatetime(offer.endAt),
      maxUses: offer.maxUses !== null && offer.maxUses !== undefined ? String(offer.maxUses) : '',
      maxUsesPerUser: offer.maxUsesPerUser !== null && offer.maxUsesPerUser !== undefined ? String(offer.maxUsesPerUser) : '',
      audience: offer.audience || 'ALL',
      status: offer.status || 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (publishAction = 'PUBLISH') => {
    if (!formData.name.trim()) {
      toast.error('Offer name is required');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Promo code is required');
      return;
    }
    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      toast.error('Valid positive discount value is required');
      return;
    }
    if (formData.discountType === 'PERCENTAGE' && parseFloat(formData.discountValue) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }
    if (!formData.startAt || !formData.endAt) {
      toast.error('Start and End dates are required');
      return;
    }

    const startISO = parseLocalDatetime(formData.startAt);
    const endISO = parseLocalDatetime(formData.endAt);

    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    if (formData.scope === 'SELECTED_COURSES' && formData.courseIds.length === 0) {
      toast.error('Please select at least one course for Selected Courses eligibility');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      scope: formData.scope,
      courseIds: formData.scope === 'SELECTED_COURSES' ? formData.courseIds : [],
      startAt: startISO,
      endAt: endISO,
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
      maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser, 10) : null,
      audience: formData.audience,
      status: publishAction === 'DRAFT' ? 'DRAFT' : formData.status
    };

    try {
      if (editingId) {
        const res = await updateOffer(editingId, payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Offer updated successfully!');
          setModalOpen(false);
          fetchOffers();
        }
      } else {
        const res = await createOffer(payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Offer created successfully!');
          setModalOpen(false);
          fetchOffers();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save offer';
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (offer) => {
    const newStatus = offer.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    try {
      const res = await updateOfferStatus(offer.id, newStatus);
      if (res.data?.success) {
        toast.success(`Offer ${newStatus === 'DISABLED' ? 'disabled' : 'activated'}`);
        fetchOffers();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await duplicateOffer(id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Offer duplicated as Draft!');
        fetchOffers();
      }
    } catch (err) {
      toast.error('Failed to duplicate offer');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await deleteOffer(deleteConfirmItem.id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Offer removed');
        setDeleteConfirmItem(null);
        fetchOffers();
      }
    } catch (err) {
      toast.error('Failed to delete offer');
    }
  };

  const toggleCourseSelection = (courseId) => {
    setFormData((prev) => {
      const exists = prev.courseIds.includes(courseId);
      return {
        ...prev,
        courseIds: exists
          ? prev.courseIds.filter((id) => id !== courseId)
          : [...prev.courseIds, courseId]
      };
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ACTIVE</span>;
      case 'SCHEDULED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">SCHEDULED</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">EXPIRED</span>;
      case 'DISABLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">DISABLED</span>;
      case 'DRAFT':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">DRAFT</span>;
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.courseName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161D29] p-6 rounded-2xl border border-[#2C333F]">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiTag className="text-[#FFD60A]" /> Offers & Coupons
            </h1>
            <p className="text-sm text-[#AFB2BF] mt-1">
              Create and manage promotional discounts for courses.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFD60A] hover:bg-[#ffe14d] text-black font-bold text-sm transition-all shadow-lg cursor-pointer"
          >
            <FiPlus className="text-lg" />
            <span>Create Offer</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-[#161D29] p-4 rounded-xl border border-[#2C333F] flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <FiSearch className="absolute left-3.5 top-3.5 text-[#838894]" />
            <input
              type="text"
              placeholder="Search by offer name or promo code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#2C333F] border border-[#3E4553] rounded-lg text-white placeholder-[#838894] text-sm focus:outline-none focus:border-[#FFD60A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-[#838894]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#2C333F] border border-[#3E4553] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFD60A]"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="EXPIRED">Expired</option>
                <option value="DISABLED">Disabled</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Discount Type Filter */}
            <select
              value={discountTypeFilter}
              onChange={(e) => setDiscountTypeFilter(e.target.value)}
              className="bg-[#2C333F] border border-[#3E4553] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFD60A]"
            >
              <option value="ALL">All Discount Types</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₹)</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="bg-[#161D29] rounded-2xl border border-[#2C333F] overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-[#AFB2BF]">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="py-20 text-center text-[#AFB2BF]">
              <FiTag className="text-4xl mx-auto text-gray-600 mb-3" />
              <p className="text-base font-semibold text-white">No offers found</p>
              <p className="text-xs text-[#838894] mt-1">Create your first offer or adjust filter parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#AFB2BF]">
                <thead className="bg-[#2C333F] text-xs uppercase text-[#999DAA]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Offer</th>
                    <th className="px-6 py-4 font-bold">Code</th>
                    <th className="px-6 py-4 font-bold">Discount</th>
                    <th className="px-6 py-4 font-bold">Applicable Courses</th>
                    <th className="px-6 py-4 font-bold">Validity</th>
                    <th className="px-6 py-4 font-bold">Usage</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C333F]">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-[#1f2736] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{offer.name}</div>
                        {offer.description && (
                          <div className="text-xs text-[#838894] truncate max-w-xs">{offer.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-[#2C333F] border border-[#3E4553] text-[#FFD60A] font-mono font-bold text-xs">
                          {offer.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {offer.discountType === 'PERCENTAGE'
                          ? `${offer.discountValue}%`
                          : `₹${offer.discountValue}`}
                      </td>
                      <td className="px-6 py-4">
                        {offer.scope === 'ALL_COURSES' ? (
                          <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-medium">All Courses</span>
                        ) : (
                          <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-medium">
                            {offer.courses ? `${offer.courses.length} Courses` : 'Selected Courses'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        <div>
                          {new Date(offer.startAt).toLocaleDateString([], { day: '2-digit', month: 'short' })} → {' '}
                          {new Date(offer.endAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {offer.totalUses} / {offer.maxUses ? offer.maxUses : '∞'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(offer.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewDetailItem(offer)}
                            className="p-2 rounded-lg bg-[#2C333F] text-[#AFB2BF] hover:text-white hover:bg-[#3E4553]"
                            title="View Offer Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(offer)}
                            className="p-2 rounded-lg bg-[#2C333F] text-blue-400 hover:bg-blue-500/20"
                            title="Edit Offer"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDuplicate(offer.id)}
                            className="p-2 rounded-lg bg-[#2C333F] text-purple-400 hover:bg-purple-500/20"
                            title="Duplicate Offer"
                          >
                            <FiCopy />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(offer)}
                            className={`p-2 rounded-lg bg-[#2C333F] ${
                              offer.status === 'DISABLED'
                                ? 'text-emerald-400 hover:bg-emerald-500/20'
                                : 'text-amber-400 hover:bg-amber-500/20'
                            }`}
                            title={offer.status === 'DISABLED' ? 'Activate Offer' : 'Disable Offer'}
                          >
                            {offer.status === 'DISABLED' ? <FiCheckCircle /> : <FiAlertCircle />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(offer)}
                            className="p-2 rounded-lg bg-[#2C333F] text-red-400 hover:bg-red-500/20"
                            title="Delete Offer"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── CREATE / EDIT MODAL ─────────────────────────────────────── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C333F]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiTag className="text-[#FFD60A]" />
                  {editingId ? 'Edit Offer' : 'Create Offer'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-[#AFB2BF] hover:text-white p-1"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      Offer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Raksha Bandhan Special Offer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      Promo Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RAKSHA50"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-[#FFD60A] font-mono font-bold text-sm focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Get 50% OFF on selected courses."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 50' : 'e.g. 500'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>

                {/* Course Eligibility Scope */}
                <div>
                  <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                    Applicable Courses *
                  </label>
                  <div className="flex items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-medium">
                      <input
                        type="radio"
                        name="scope"
                        checked={formData.scope === 'ALL_COURSES'}
                        onChange={() => setFormData({ ...formData, scope: 'ALL_COURSES', courseIds: [] })}
                        className="accent-[#FFD60A]"
                      />
                      <span>All Courses</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white font-medium">
                      <input
                        type="radio"
                        name="scope"
                        checked={formData.scope === 'SELECTED_COURSES'}
                        onChange={() => setFormData({ ...formData, scope: 'SELECTED_COURSES' })}
                        className="accent-[#FFD60A]"
                      />
                      <span>Selected Courses</span>
                    </label>
                  </div>

                  {formData.scope === 'SELECTED_COURSES' && (
                    <div className="bg-[#2C333F] p-3.5 rounded-xl border border-[#3E4553] space-y-3">
                      <input
                        type="text"
                        placeholder="Search courses to select..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#161D29] border border-[#3E4553] rounded-lg text-white text-xs focus:outline-none focus:border-[#FFD60A]"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {filteredCourses.map((course) => {
                          const isSelected = formData.courseIds.includes(course.id);
                          return (
                            <label
                              key={course.id}
                              className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                isSelected ? 'bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-white' : 'hover:bg-[#161D29] text-[#AFB2BF]'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleCourseSelection(course.id)}
                                  className="accent-[#FFD60A]"
                                />
                                <span className="font-medium truncate">{course.courseName}</span>
                              </div>
                              <span className="font-mono text-[#FFD60A]">₹{course.price}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="text-[11px] text-[#838894]">
                        Selected: <strong className="text-white">{formData.courseIds.length}</strong> courses
                      </div>
                    </div>
                  )}
                </div>

                {/* Validity Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      Maximum Total Uses
                    </label>
                    <input
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                      Max Uses Per User
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                    />
                  </div>
                </div>

                {/* Audience Eligibility */}
                <div>
                  <label className="block text-xs font-bold text-[#AFB2BF] mb-1.5">
                    Eligible Users
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#2C333F] border border-[#3E4553] rounded-xl text-white text-sm focus:outline-none focus:border-[#FFD60A]"
                  >
                    <option value="ALL">All Users</option>
                    <option value="STUDENTS">Students</option>
                    <option value="INSTRUCTORS">Instructors</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C333F] bg-[#1a2332]">
                <button
                  onClick={() => handleSubmit('DRAFT')}
                  className="px-4 py-2 rounded-xl bg-[#2C333F] hover:bg-[#3E4553] text-[#AFB2BF] hover:text-white font-medium text-xs transition-all cursor-pointer"
                >
                  Save Draft
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-transparent text-[#AFB2BF] hover:text-white font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit('PUBLISH')}
                    className="px-5 py-2 rounded-xl bg-[#FFD60A] hover:bg-[#ffe14d] text-black font-bold text-xs transition-all cursor-pointer shadow-md"
                  >
                    {editingId ? 'Update Offer' : 'Publish Offer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DETAIL VIEW MODAL ─────────────────────────────────────── */}
        {viewDetailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2C333F] pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiTag className="text-[#FFD60A]" /> Offer Details
                </h3>
                <button onClick={() => setViewDetailItem(null)} className="text-[#AFB2BF] hover:text-white">
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-[#AFB2BF]">
                <div>
                  <span className="text-xs text-[#838894] block">Offer Name</span>
                  <span className="text-white font-semibold text-base">{viewDetailItem.name}</span>
                </div>

                <div className="flex justify-between items-center bg-[#2C333F] p-3 rounded-xl">
                  <div>
                    <span className="text-xs text-[#838894] block">Promo Code</span>
                    <span className="font-mono text-[#FFD60A] font-extrabold text-base">{viewDetailItem.code}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#838894] block">Discount</span>
                    <span className="text-white font-extrabold text-base">
                      {viewDetailItem.discountType === 'PERCENTAGE' ? `${viewDetailItem.discountValue}%` : `₹${viewDetailItem.discountValue}`}
                    </span>
                  </div>
                </div>

                {viewDetailItem.description && (
                  <div>
                    <span className="text-xs text-[#838894] block">Description</span>
                    <span className="text-white text-xs">{viewDetailItem.description}</span>
                  </div>
                )}

                <div>
                  <span className="text-xs text-[#838894] block mb-1">Applicable Courses</span>
                  {viewDetailItem.scope === 'ALL_COURSES' ? (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md font-medium inline-block">
                      All Courses
                    </span>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {viewDetailItem.courses && viewDetailItem.courses.length > 0 ? (
                        viewDetailItem.courses.map((c) => (
                          <div key={c.id} className="text-xs bg-[#2C333F] px-2.5 py-1.5 rounded text-white flex justify-between">
                            <span>{c.courseName}</span>
                            <span className="text-[#FFD60A]">₹{c.price}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Selected courses</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#838894] block">Validity</span>
                    <span className="text-white font-medium">
                      {new Date(viewDetailItem.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      <br />
                      → {new Date(viewDetailItem.endAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#838894] block">Usage & Limits</span>
                    <span className="text-white font-medium">
                      {viewDetailItem.totalUses} / {viewDetailItem.maxUses ? viewDetailItem.maxUses : 'Unlimited'}
                      <br />
                      Per User: {viewDetailItem.maxUsesPerUser ? viewDetailItem.maxUsesPerUser : 'Unlimited'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-xs text-[#838894] block">Audience</span>
                    <span className="text-white font-semibold text-xs">{viewDetailItem.audience}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#838894] block mb-0.5">Status</span>
                    {getStatusBadge(viewDetailItem.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRMATION MODAL ───────────────────────────────── */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiTrash2 className="text-red-400" /> Remove Offer?
              </h3>
              <p className="text-sm text-[#AFB2BF]">
                Are you sure you want to remove <strong className="text-white">{deleteConfirmItem.name}</strong> ({deleteConfirmItem.code})?
                {deleteConfirmItem.totalUses > 0 && (
                  <span className="block mt-2 text-xs text-amber-400 font-semibold">
                    Note: Since this offer has historical usage, it will be Disabled rather than permanently deleted.
                  </span>
                )}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#2C333F] text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
