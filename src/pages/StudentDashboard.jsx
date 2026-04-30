import React from 'react';

const StudentDashboard = () => {
  return (
    <div className="py-16 px-8 max-w-[1200px] mx-auto text-center font-['Inter']">
      <h1 className="text-4xl font-bold mb-4 text-slate-800">Student Dashboard</h1>
      <p className="text-slate-500 text-lg mb-12">Welcome back! Here are your enrolled courses and progress.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-slate-800">My Learning</h3>
          <p className="text-slate-500 mt-4 leading-relaxed">Resume your recent courses and pick up where you left off.</p>
        </div>
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-slate-800">Assignments</h3>
          <p className="text-slate-500 mt-4 leading-relaxed">You have 2 pending assignments. Complete them to earn credits.</p>
        </div>
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-slate-800">Certificates</h3>
          <p className="text-slate-500 mt-4 leading-relaxed">View your earned certificates and share them on LinkedIn.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
