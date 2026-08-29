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
      <div className="flex justify-between items-center mb-8 px-5 py-3.5 bg-[#0c0e1a] rounded-2xl border border-blue-950/30 shadow-xl">
        {/* "Select All" Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            className="w-4 h-4 cursor-pointer accent-blue-500 rounded border-blue-950 focus:ring-0"
          />
          <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
            loading || selectedCourses.length === 0
              ? 'bg-blue-950/30 text-blue-400/40 cursor-not-allowed border border-blue-950/20'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-950/50 active:scale-95'
          }`}
        >
          <RiDeleteBin6Line size={16} />
          Delete Selected ({selectedCourses.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {courses?.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3 bg-[#0c0e1a] border border-blue-950/30 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-950/20 flex items-center justify-center text-blue-400">
              <VscPlayCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">No Courses Created Yet</h3>
            <p className="text-xs text-blue-300/60 max-w-sm">
              You haven't created any courses. Click below to add your first course and start teaching!
            </p>
            <button
              onClick={() => navigate("/dashboard/add-course")}
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition"
            >
              Add New Course
            </button>
          </div>
        ) : (
          courses.map((course) => {
            const courseId = course._id || course.id;
            return (
            <div
              key={courseId}
              className="group flex flex-col bg-[#0c0e1a] border border-blue-950/30 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 shadow-xl"
            >
              {/* CARD IMAGE */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail || "https://res.cloudinary.com/dxgdsmdrl/image/upload/v1714470535/placeholder_course_image.jpg"}
                  alt={course.courseName}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/a8b2d1?text=No+Image" }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button
                    disabled={loading}
                    onClick={() => navigate(`/courses/${courseId}`)}
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
                    checked={selectedCourses.includes(courseId)}
                    onChange={() => {
                      if (selectedCourses.includes(courseId)) {
                        setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
                      } else {
                        setSelectedCourses([...selectedCourses, courseId]);
                      }
                    }}
                  />
                </div>

                {/* STATUS BADGE */}
                <div className="absolute top-4 right-4">
                  {course.status === COURSE_STATUS.DRAFT ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 backdrop-blur-md text-blue-100 rounded-full text-xs font-semibold border border-blue-500/30">
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
              <div className="p-5 flex flex-col flex-1 gap-3.5 bg-[#121826]">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-yellow-400 transition-colors line-clamp-2 leading-snug">
                    {course.courseName}
                  </h3>
                  <p className="text-xs text-richblack-300 line-clamp-2 leading-relaxed mb-3">
                    {course.courseDescription || "No description provided"}
                  </p>
                </div>

                {/* DURATION & SECTIONS META */}
                <div className="flex items-center gap-4 text-xs text-richblack-300">
                  <div className="flex items-center gap-1.5">
                    <HiClock size={15} className="text-richblack-400" />
                    <span>{course.totalDuration || "0.0 Hours"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded border border-richblack-400 flex items-center justify-center text-[9px] font-bold">≡</span>
                    <span>{course.sections?.length || course.courseContent?.length || 0} Sections</span>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="w-full bg-richblack-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full w-0" />
                  </div>
                  <span className="text-[11px] text-richblack-400 font-medium">0% Complete</span>
                </div>

                {/* LIFETIME ACCESS & PRICE DISPLAY */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-2">
                    {course?.pricing?.isOfferActive || (course?.originalPrice && Number(course?.originalPrice) > Number(course?.price)) ? (
                      <>
                        <span className="text-xs text-richblack-400 line-through">
                          ₹{course?.pricing?.originalPrice || course?.originalPrice}
                        </span>
                        <span className="text-base font-bold text-yellow-400">
                          ₹{course?.pricing?.finalPrice || course?.price}
                        </span>
                        {course?.pricing?.discountPercentage > 0 && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                            {course?.pricing?.discountPercentage}% OFF
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-base font-bold text-yellow-400">₹{course?.price || 0}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-richblack-400">
                    <span className="text-yellow-500">★ ★ ★ ★ ★</span>
                    <span className="ml-1 text-richblack-300 font-semibold">0 (0)</span>
                  </div>
                </div>

                {/* ACTION BUTTONS (ANALYTICS, EDIT, DELETE) */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                    className="w-full py-2.5 rounded-xl border border-richblack-600 bg-richblack-800 text-sm font-semibold text-richblack-200 hover:border-yellow-400 hover:text-yellow-400 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>📊</span> Analytics
                  </button>

                  <div className="flex gap-2">
                    <button
                      disabled={loading}
                      onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                      className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                    >
                      <FiEdit2 size={16} /> Edit
                    </button>
                    <button
                      disabled={loading}
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Delete Course?",
                          text2: "This action cannot be undone.",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () => handleCourseDelete(courseId),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                      className="px-4 py-2.5 rounded-xl bg-richblack-700 text-blue-300 hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center active:scale-95 border border-richblack-600"
                      title="Delete"
                    >
                      <RiDeleteBin6Line size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )})
        )}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}
