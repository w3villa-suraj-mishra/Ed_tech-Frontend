import React, { useState, useEffect } from 'react';
import api from '../api';

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Premium mock data to fallback on if backend is not ready
  const mockCourses = [
    { id: 1, title: 'Full-Stack Web Development', category: 'Engineering', duration: '40 Hours', rating: '4.9', students: '12,340' },
    { id: 2, title: 'Advanced Machine Learning', category: 'Data Science', duration: '35 Hours', rating: '4.8', students: '8,120' },
    { id: 3, title: 'UI/UX Design Masterclass', category: 'Design', duration: '20 Hours', rating: '4.7', students: '5,430' },
    { id: 4, title: 'Cloud Computing with AWS', category: 'Engineering', duration: '25 Hours', rating: '4.8', students: '9,210' },
    { id: 5, title: 'Mobile App Development (React Native)', category: 'Engineering', duration: '30 Hours', rating: '4.6', students: '4,890' },
    { id: 6, title: 'Data Analytics & Visualization', category: 'Data Science', duration: '18 Hours', rating: '4.7', students: '6,100' },
  ];

  useEffect(() => {
    // Simulate network delay for the premium skeleton effect
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/v1/courses');
        if (response.data && response.data.length > 0) {
          setCourses(response.data);
        } else {
          setCourses(mockCourses);
        }
      } catch (error) {
        console.log("Backend not ready, falling back to premium mock data");
        setCourses(mockCourses);
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-8 font-['Inter'] min-h-[80vh] bg-richblack-900 text-richblack-5">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-richblack-5 mb-4">Explore Our Course Catalog</h1>
        <p className="text-richblack-300 text-lg mb-8">Discover thousands of courses designed to help you advance your career in tech.</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-[600px] mx-auto">
          <input type="text" placeholder="Search for courses..." className="flex-1 px-6 py-4 rounded-full bg-richblack-800 border border-richblack-700 text-richblack-5 text-base shadow-sm outline-none transition-all focus:border-yellow-50 focus:ring-4 focus:ring-yellow-50/10" />
          <select className="px-6 py-5 rounded-full border border-richblack-700 text-richblack-5 text-base bg-richblack-800 outline-none cursor-pointer">
            <option>All Categories</option>
            <option>Engineering</option>
            <option>Data Science</option>
            <option>Design</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          // Premium Skeleton Loaders
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-richblack-800 rounded-2xl overflow-hidden shadow-sm border border-richblack-700 flex flex-col">
              <div className="h-52 w-full bg-richblack-700 animate-pulse"></div>
              <div className="p-6">
                <div className="w-20 h-6 bg-richblack-700 rounded-full mb-4 animate-pulse"></div>
                <div className="h-6 bg-richblack-700 rounded-md mb-2 w-full animate-pulse"></div>
                <div className="h-6 bg-richblack-700 rounded-md w-3/5 mb-8 animate-pulse"></div>
                <div className="flex justify-between pt-4 border-t border-richblack-700">
                  <div className="h-4 bg-richblack-700 rounded-md w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-richblack-700 rounded-md w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Actual Course Cards
          courses.map(course => (
            <div key={course.id} className="bg-richblack-800 rounded-2xl overflow-hidden shadow-sm border border-richblack-700 transition-all hover:-translate-y-2 hover:shadow-xl flex flex-col">
              <div className="h-52 bg-gradient-to-br from-richblack-700 to-richblack-900 relative flex justify-end items-start p-4">
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider">{course.category}</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-richblack-5 mb-6 leading-tight">{course.title}</h3>
                <div className="flex justify-between text-richblack-300 text-sm font-medium mb-6 pt-4 border-t border-richblack-700">
                  <span>⏱ {course.duration}</span>
                  <span>⭐ {course.rating}</span>
                  <span>👥 {course.students}</span>
                </div>
                <button className="mt-auto w-full py-4 bg-transparent text-yellow-50 border-2 border-yellow-50 rounded-lg text-base font-bold transition-all hover:bg-yellow-50 hover:text-richblack-900">
                  Enroll Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Catalog;
