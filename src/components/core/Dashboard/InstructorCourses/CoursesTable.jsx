import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Tbody, Thead } from 'react-super-responsive-table';
import { COURSE_STATUS } from '../../../../utils/constants';
import { deleteCourse, fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI';
import ConfirmationModal from '../../../Common/ConfirmationModal';
import { Th, Td, Tr } from 'react-super-responsive-table';
import { HiClock } from 'react-icons/hi';
import { FaCheck } from 'react-icons/fa6';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { VscPlayCircle } from 'react-icons/vsc';
import { BsCameraVideoFill } from 'react-icons/bs';

export default function CoursesTable({ courses, setCourses }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [selectAll, setSelectAll] = useState(false); // Track "Select All" state
  const [selectedCourses, setSelectedCourses] = useState([]); // Track selected courses
  const TRUNCATE_LENGTH = 30;

  const handleCourseDelete = async (courseId) => {
    setLoading(true);
    if (courseId) {
      await deleteCourse({ courseId }, token);
    } else {
      for (const id of selectedCourses) {
        await deleteCourse({ courseId: id }, token);
      }
    }
    const result = await fetchInstructorCourses(token);
    if (result) {
      setCourses(result);
    }
    setConfirmationModal(null);
    setSelectedCourses([]); // Clear selected courses
    setSelectAll(false); // Reset "Select All" state
    setLoading(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCourses([]); // Unselect all
    } else {
      setSelectedCourses(courses.map((course) => course._id)); // Select all
    }
    setSelectAll(!selectAll);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8 px-4 py-3 bg-richblack-800 rounded-xl border border-richblack-700">
        {/* "Select All" Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            className="w-5 h-5 cursor-pointer accent-yellow-400 border-none rounded focus:ring-0"
          />
          <div className="text-sm font-semibold text-richblack-100 uppercase tracking-wider">
            Select All
          </div>
        </div>

        {/* Delete Selected Button */}
        <button
          disabled={loading || selectedCourses.length === 0}
          onClick={() => {
            setConfirmationModal({
              text1: "Delete Selected Courses?",
              text2: "This will permanently remove all selected courses and their content.",
              btn1Text: !loading ? "Delete All" : "Deleting...",
              btn2Text: "Cancel",
              btn1Handler: !loading ? () => handleCourseDelete() : () => { },
              btn2Handler: () => setConfirmationModal(null),
            });
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
            loading || selectedCourses.length === 0
              ? 'bg-richblack-700 text-richblack-400 cursor-not-allowed border border-richblack-600'
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-95'
          }`}
        >
          <RiDeleteBin6Line size={18} />
          Delete Selected ({selectedCourses.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {courses?.length === 0 ? (
          <div className="col-span-full py-10 text-center text-2xl font-medium text-richblack-100">
            No courses found
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="group flex flex-col bg-richblack-800 border border-richblack-700 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,214,10,0.1)]"
            >
              {/* CARD IMAGE */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail || "https://res.cloudinary.com/dxgdsmdrl/image/upload/v1714470535/placeholder_course_image.jpg"}
                  alt={course.courseName}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/a8b2d1?text=No+Image" }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button
                    disabled={loading}
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-yellow-400 hover:text-richblack-900 transition-all duration-200"
                    title="Preview"
                  >
                    <VscPlayCircle size={24} />
                  </button>
                </div>
                
                {/* SELECT CHECKBOX */}
                <div className="absolute top-4 left-4">
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer accent-yellow-400 border-none rounded focus:ring-0"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => {
                      if (selectedCourses.includes(course._id)) {
                        setSelectedCourses(selectedCourses.filter((id) => id !== course._id));
                      } else {
                        setSelectedCourses([...selectedCourses, course._id]);
                      }
                    }}
                  />
                </div>

                {/* STATUS BADGE */}
                <div className="absolute top-4 right-4">
                  {course.status === COURSE_STATUS.DRAFT ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-pink-900/80 backdrop-blur-md text-pink-100 rounded-full text-xs font-semibold border border-pink-500/30">
                      <HiClock size={14} />
                      Draft
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-caribbeangreen-900/80 backdrop-blur-md text-caribbeangreen-100 rounded-full text-xs font-semibold border border-caribbeangreen-500/30">
                      <FaCheck size={12} />
                      Published
                    </span>
                  )}
                </div>
              </div>

              {/* CARD CONTENT */}
              <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-richblack-5 mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">
                    {course.courseName}
                  </h3>
                  <p className="text-sm text-richblack-300 line-clamp-2 leading-relaxed">
                    {course.courseDescription || "No description provided"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-richblack-700">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-richblack-400 font-bold">Duration</span>
                    <span className="text-sm text-richblack-5 font-semibold">{course.totalDuration || "0m"}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-richblack-400 font-bold">Price</span>
                    <span className="text-lg text-yellow-400 font-black">₹{course.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={loading}
                    onClick={() => navigate(`/live-class/${course._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-300 active:scale-95 shadow-lg shadow-red-600/20"
                    title="Start Live Class"
                  >
                    <BsCameraVideoFill size={16} />
                    <span>Live</span>
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                    className="p-2.5 rounded-xl bg-richblack-700 text-white font-semibold hover:bg-caribbeangreen-600 transition-all duration-300 active:scale-95"
                    title="Edit Course"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    disabled={loading}
                    onClick={() =>
                      setConfirmationModal({
                        text1: "Delete Course?",
                        text2: "This action cannot be undone.",
                        btn1Text: "Delete",
                        btn2Text: "Cancel",
                        btn1Handler: () => handleCourseDelete(course._id),
                        btn2Handler: () => setConfirmationModal(null),
                      })
                    }
                    className="p-2.5 rounded-xl bg-richblack-700 text-richblack-200 hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-95"
                    title="Delete"
                  >
                    <RiDeleteBin6Line size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
