import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/core/Dashboard/Sidebar';

function Dashboard() {
  const { loading: authloading } = useSelector((state) => state.auth);
  const { loading: profileloading } = useSelector((state) => state.profile);

  if (profileloading || authloading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#F9FAFE]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F9FAFE] text-gray-800 font-sans">
      <div className="max-w-[1440px] w-full mx-auto flex flex-col md:flex-row px-3 sm:px-5 lg:px-6">
        <Sidebar />
        <main className="flex-1 min-w-0 py-6 md:py-7 lg:pl-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;