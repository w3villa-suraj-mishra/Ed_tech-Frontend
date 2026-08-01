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
      const { course } = useSelector((state) => state.course)
      const [courses, setCourses] = useState([])

useEffect(()=>{
    const fetchCourses = async()=>{
        const result = await fetchInstructorCourses(token);

        if(result){
            setCourses(result)
        }
    }
    fetchCourses()
},[])
  return (
    <div className="mx-auto w-11/12 max-w-[1000px] py-10">
      <div className="mb-14 flex items-center justify-between">
        <h1 className="text-3xl font-medium text-richblack-5">My Courses</h1>
        <Iconbtn
          text="Add Course"
          onclick={() => navigate("/dashboard/add-course")}
        >
          <FaPlus />
        </Iconbtn>
      </div>
      {courses && <CoursesTable courses={courses} setCourses={setCourses} />}
    </div>
  )
}

export default MyCourses
