import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, StatCard, TableSkeleton } from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/AdminUI';
import { getDashboardStats } from '../../services/admin/adminAPI';

export default function AdminDashboard() {
  return <AdminProtectedRoute><DashboardInner /></AdminProtectedRoute>;
}

function DashboardInner() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n?.toLocaleString() ?? '—';

  return (
    <AdminLayout>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F1F2FF]">
          Welcome back, <span className="text-[#FFD60A]">{adminUser.firstName}</span> 👋
        </h1>
        <p className="text-sm text-[#AFB2BF] mt-1">Here's what's happening on your platform today.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-[#161D29] animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Users"      value={fmt(stats?.totalUsers)}       icon="👥" color="blue" />
            <StatCard label="Students"         value={fmt(stats?.totalStudents)}     icon="🎓" color="purple" />
            <StatCard label="Instructors"      value={fmt(stats?.totalInstructors)}  icon="👨‍🏫" color="green" />
            <StatCard label="Admins"           value={fmt(stats?.totalAdmins)}       icon="🛡️"  color="yellow" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Courses"    value={fmt(stats?.totalCourses)}      icon="📚" color="blue" />
            <StatCard label="Published"        value={fmt(stats?.publishedCourses)}  icon="✅" color="green" />
            <StatCard label="Enrollments"      value={fmt(stats?.totalEnrollments)}  icon="📋" color="purple" />
            <StatCard label="Reviews"          value={fmt(stats?.totalReviews)}      icon="⭐" color="yellow" />
          </div>
        </>
      )}

      {/* Recent rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#F1F2FF]">Recent Courses</h2>
            <Link to="/admin/courses" className="text-xs text-[#FFD60A] hover:underline">View all →</Link>
          </div>
          {loading ? <TableSkeleton rows={5} cols={3} /> : (
            <div className="space-y-3">
              {(stats?.recentCourses || []).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#2C333F] last:border-0">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-[#F1F2FF] truncate">{c.courseName}</p>
                    <p className="text-xs text-[#585D69]">
                      {c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : '—'}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {!stats?.recentCourses?.length && <p className="text-sm text-[#585D69]">No courses yet.</p>}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#F1F2FF]">Recent Users</h2>
            <Link to="/admin/users" className="text-xs text-[#FFD60A] hover:underline">View all →</Link>
          </div>
          {loading ? <TableSkeleton rows={5} cols={3} /> : (
            <div className="space-y-3">
              {(stats?.recentUsers || []).map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-[#2C333F] last:border-0">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-[#F1F2FF] truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-[#585D69] truncate">{u.email}</p>
                  </div>
                  <StatusBadge status={u.accountType} />
                </div>
              ))}
              {!stats?.recentUsers?.length && <p className="text-sm text-[#585D69]">No users yet.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
