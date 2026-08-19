import axios from 'axios';

const BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('adminToken');

const api = axios.create({ baseURL: `${BASE}/admin` });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isLoginUrl = err.config?.url?.includes('/login');
    if (err.response?.status === 401 && !isLoginUrl) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const checkInit       = ()        => api.get('/check-init');
export const adminSetup      = (data)    => api.post('/setup', data);
export const adminLogin      = (data)    => api.post('/login', data);
export const adminGetMe      = ()        => api.get('/me');

// ── Dashboard ─────────────────────────────────────────
export const getDashboardStats = ()      => api.get('/dashboard/stats');

// ── Users ─────────────────────────────────────────────
export const getUsers        = (p)       => api.get('/users', { params: p });
export const getUser         = (id)      => api.get(`/users/${id}`);
export const createUser      = (data)    => api.post('/users', data);
export const updateUser      = (id, d)   => api.put(`/users/${id}`, d);
export const deleteUser      = (id)      => api.delete(`/users/${id}`);
export const resetPassword   = (id, d)   => api.put(`/users/${id}/reset-password`, d);

// ── Categories ────────────────────────────────────────
export const getCategories   = (p)       => api.get('/categories', { params: p });
export const createCategory  = (data)    => api.post('/categories', data);
export const updateCategory  = (id, d)   => api.put(`/categories/${id}`, d);
export const deleteCategory  = (id)      => api.delete(`/categories/${id}`);

// ── Courses ───────────────────────────────────────────
export const getCourses      = (p)       => api.get('/courses', { params: p });
export const getCourse       = (id)      => api.get(`/courses/${id}`);
export const updateCourse    = (id, fd)  => api.put(`/courses/${id}`, fd);
export const updateCourseStatus = (id, s) => api.put(`/courses/${id}/status`, { status: s });
export const updateCoursePricing = (id, d) => api.patch(`/courses/${id}/pricing`, d);
export const deleteCourse    = (id)      => api.delete(`/courses/${id}`);

// ── Enrollments ───────────────────────────────────────
export const getEnrollments  = (p)       => api.get('/enrollments', { params: p });
export const deleteEnrollment = (id)     => api.delete(`/enrollments/${id}`);

// ── Reviews ───────────────────────────────────────────
export const getReviews      = (p)       => api.get('/reviews', { params: p });
export const deleteReview    = (id)      => api.delete(`/reviews/${id}`);

// ── Live Sessions ─────────────────────────────────────
export const getLiveSessions    = (p)    => api.get('/live-sessions', { params: p });
export const createLiveSession  = (d)    => api.post('/live-sessions', d);
export const updateLiveSession  = (id,d) => api.put(`/live-sessions/${id}`, d);
export const deleteLiveSession  = (id)   => api.delete(`/live-sessions/${id}`);

// ── Sections ──────────────────────────────────────────
export const getSections        = (p)    => api.get('/sections', { params: p });
export const createSection      = (d)    => api.post('/sections', d);
export const updateSection      = (id,d) => api.put(`/sections/${id}`, d);
export const deleteSection      = (id)   => api.delete(`/sections/${id}`);

// ── SubSections ───────────────────────────────────────
export const getSubSections     = (p)    => api.get('/subsections', { params: p });
export const createSubSection   = (fd)   => api.post('/subsections', fd);
export const updateSubSection   = (id,fd)=> api.put(`/subsections/${id}`, fd);
export const deleteSubSection   = (id)   => api.delete(`/subsections/${id}`);

// ── Contact Submissions ────────────────────────────────
export const getContacts          = (p)    => api.get('/contacts', { params: p });
export const updateContactStatus   = (id,s)  => api.put(`/contacts/${id}/status`, { status: s });
export const deleteContact         = (id)   => api.delete(`/contacts/${id}`);

// ── Notifications ──────────────────────────────────────
export const getNotifications      = ()     => api.get('/notifications');

export default api;
