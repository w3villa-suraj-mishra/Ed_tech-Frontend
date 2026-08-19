import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BsCollectionPlay, BsPeople, BsWallet2, BsGraphUp } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { getInstructorData } from '../services/operations/profileAPI';
import { fetchInstructorCourses } from '../services/operations/courseDetailsAPI';

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [instructorData, setInstructorData] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const getCourseDataWithStats = async () => {
      setLoading(true);
      const instructorApiData = await getInstructorData(token);
      const result = await fetchInstructorCourses(token);
      
      if (instructorApiData) {
        setInstructorData(instructorApiData);
      }
      if (result) {
        setCourses(result);
      }
      setLoading(false);
    };
    getCourseDataWithStats();
  }, [token]);

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0);
  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0);

  const stats = [
    { 
      label: "Total Courses", 
      value: courses.length, 
      icon: <BsCollectionPlay />, 
      color: "from-blue-400 to-indigo-500" 
    },
    { 
      label: "Total Students", 
      value: totalStudents, 
      icon: <BsPeople />, 
      color: "from-emerald-400 to-teal-500" 
    },
    { 
      label: "Total Earnings", 
      value: `₹${totalAmount}`, 
      icon: <BsWallet2 />, 
      color: "from-yellow-400 to-orange-500" 
    },
    { 
      label: "Avg. Engagement", 
      value: courses.length > 0 ? `${Math.round((totalStudents / courses.length) * 10) / 10}` : "0", 
      icon: <BsGraphUp />, 
      color: "from-pink-400 to-rose-500" 
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-richblack-900">
        <div className="w-16 h-16 border-4 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-richblack-900 font-['Inter'] pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-richblack-800 border-b border-richblack-700">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{user?.firstName || 'Instructor'}!</span> 👋
          </h1>
          <p className="text-richblack-300">Here's what's happening with your courses today.</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-10 space-y-10">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="bg-richblack-800 rounded-2xl p-6 h-full flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white bg-opacity-20 backdrop-blur-md`}>
                    {React.cloneElement(stat.icon, { size: 24 })}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
                  <p className="text-richblack-300 text-sm font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COURSE PERFORMANCE TABLE */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] rounded-3xl shadow-xl">
            <div className="bg-richblack-800 rounded-3xl p-8 h-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white">Course Performance</h2>
                <button 
                  onClick={() => navigate('/dashboard/add-course')}
                  className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded-lg font-semibold hover:bg-yellow-100 transition-colors text-sm"
                >
                  + New Course
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-richblack-700 text-richblack-300 text-sm">
                      <th className="pb-4 font-medium uppercase tracking-wider">Course</th>
                      <th className="pb-4 font-medium uppercase tracking-wider">Students</th>
                      <th className="pb-4 font-medium uppercase tracking-wider">Earnings</th>
                      <th className="pb-4 font-medium uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructorData?.length > 0 ? (
                      instructorData.map((course) => (
                        <tr key={course._id} className="border-b border-richblack-700/50 hover:bg-white/5 transition-colors group">
                          <td className="py-6">
                            <p className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{course.courseName}</p>
                            <p className="text-xs text-richblack-400 mt-1 max-w-[200px] truncate">{course.courseDescription}</p>
                          </td>
                          <td className="py-6 text-richblack-50">{course.totalStudentsEnrolled}</td>
                          <td className="py-6 font-bold text-emerald-400">₹{course.totalAmountGenerated}</td>
                          <td className="py-6">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-10 text-center text-richblack-400">
                          No performance data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] rounded-3xl shadow-xl">
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Creator Program</h2>
              <p className="text-white/80 text-sm mb-6 relative z-10">
                Unlock exclusive analytics and higher payout rates.
              </p>
              <button className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold hover:scale-105 transition-transform relative z-10 text-sm">
                Learn More
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
