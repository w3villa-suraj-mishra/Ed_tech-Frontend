import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {  fetchInstructorCourses } from '../../../services/operations/courseDetailsAPI'
import { setCourse } from '../../../services/slices/courseSlice'
import Iconbtn from '../../Common/iconbtn'
import { FaPlus } from "react-icons/fa6";
import CoursesTable from "../Dashboard/InstructorCourses/CoursesTable"

const MyCourses = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      const result = await fetchInstructorCourses(token)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    }
    fetchCourses()
  }, [token])

  return (
    <div className="mx-auto w-11/12 max-w-[1200px] py-10 font-['Inter',sans-serif]">
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-900/30 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            My Courses
            <span className="text-xs px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30 font-bold">
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
            </span>
          </h1>
          <p className="text-xs text-purple-300/70 mt-1">
            Manage your created courses, edit content, and track performance.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/add-course')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02]"
        >
          <FaPlus size={14} /> Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <CoursesTable courses={courses} setCourses={setCourses} />
      )}
    </div>
  )
}

export default MyCourses
