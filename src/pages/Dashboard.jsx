import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/core/Dashboard/Sidebar';

function Dashboard() {
  const { loading: authloading } = useSelector((state) => state.auth);
  const { loading: profileloading } = useSelector((state) => state.profile);

  if (profileloading || authloading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-[#070913]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#070913]">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col md:flex-row px-4 sm:px-6 lg:px-8">
        <Sidebar />
        <main className="flex-1 min-w-0 py-6 md:py-8 lg:pl-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;