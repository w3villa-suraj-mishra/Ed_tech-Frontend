import React from 'react';

const InstructorDashboard = () => {
  return (
    <div className="py-16 px-8 max-w-[1200px] mx-auto text-center font-['Inter']">
      <h1 className="text-4xl font-bold mb-4 text-slate-800">Instructor Dashboard</h1>
      <p className="text-slate-500 text-lg mb-12">Manage your courses, students, and earnings from your personalized dashboard.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md flex flex-col">
          <h3 className="text-xl font-bold text-slate-800">Manage Courses</h3>
          <p className="text-slate-500 mt-4 leading-relaxed mb-6">Create or edit your courses to keep your content fresh and engaging.</p>
          <button className="mt-auto py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Create Course
          </button>
        </div>
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-slate-800">Student Analytics</h3>
          <p className="text-slate-500 mt-4 leading-relaxed">View student engagement and progress to understand how learners interact with your material.</p>
        </div>
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-slate-800">Earnings</h3>
          <p className="text-slate-500 mt-4 leading-relaxed">Track your revenue for this month and manage your payout settings easily.</p>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
