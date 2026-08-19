import React from 'react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {editCourseDetails,addCourseDetails, fetchCourseCategories} from '../../../../../services/operations/courseDetailsAPI'
import { useForm } from 'react-hook-form'
import {HiOutlineCurrencyRupee} from "react-icons/hi"
import RequirementField from './RequirementField'
import Iconbtn from '../../../../Common/iconbtn'
import {setStep,setCourse} from "../../../../../services/slices/courseSlice"
import {toast} from 'react-hot-toast'
import {COURSE_STATUS} from "../../../../../utils/constants"
import ChipInput from './ChipInput'
import Upload from '../Upload'
import { MdNavigateNext } from "react-icons/md"

export default function CourseInformationForm() {
    const {
      register,
      handleSubmit,
      setValue,
      getValues,
      formState: { errors },
    } = useForm()
  
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { course, editCourse } = useSelector((state) => state.course)
    const [loading, setLoading] = useState(false)
    const [courseCategories, setCourseCategories] = useState([])
  
    useEffect(() => {
      const getCategories = async () => {
        setLoading(true)
        const categories = await fetchCourseCategories()
        if (categories.length > 0) {
          // console.log("categories", categories)
          setCourseCategories(categories)
        }
        setLoading(false)
      }
      // if form is in edit mode
      if (editCourse && course) {
        let parsedTags = course.tag || []
        if (typeof parsedTags === 'string') {
          try { parsedTags = JSON.parse(parsedTags) } catch { parsedTags = parsedTags.split(',').map(s => s.trim()).filter(Boolean) }
        }
        let parsedReqs = course.instructions || []
        if (typeof parsedReqs === 'string') {
          try { parsedReqs = JSON.parse(parsedReqs) } catch { parsedReqs = parsedReqs.split(',').map(s => s.trim()).filter(Boolean) }
        }

        setValue("courseTitle", course.courseName || '')
        setValue("courseShortDesc", course.courseDescription || '')
        setValue("coursePrice", course.price || '')
        setValue("courseTags", parsedTags)
        setValue("courseBenefits", course.whatYouWillLearn || '')
        const catId = typeof course.category === 'object' ? course.category?._id || course.category?.id || course.categoryId : course.category || course.categoryId
        setValue("courseCategory", catId)
        setValue("courseRequirements", parsedReqs)
        setValue("courseImage", course.thumbnail || null)
      }
      getCategories()
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  
    const isFormUpdated = () => {
      const currentValues = getValues()
      const courseCatId = typeof course.category === 'object' ? (course.category?._id || course.category?.id || course.categoryId) : (course.category || course.categoryId)
      const currentTags = Array.isArray(currentValues.courseTags) ? currentValues.courseTags.toString() : String(currentValues.courseTags || '')
      const courseTags = Array.isArray(course.tag) ? course.tag.toString() : String(course.tag || '')
      const currentReqs = Array.isArray(currentValues.courseRequirements) ? currentValues.courseRequirements.toString() : String(currentValues.courseRequirements || '')
      const courseReqs = Array.isArray(course.instructions) ? course.instructions.toString() : String(course.instructions || '')

      if (
        currentValues.courseTitle !== course.courseName ||
        currentValues.courseShortDesc !== course.courseDescription ||
        String(currentValues.coursePrice) !== String(course.price) ||
        currentTags !== courseTags ||
        currentValues.courseBenefits !== course.whatYouWillLearn ||
        String(currentValues.courseCategory) !== String(courseCatId) ||
        currentReqs !== courseReqs ||
        (currentValues.courseImage && currentValues.courseImage !== course.thumbnail)
      ) {
        return true
      }
      return false
    }
  
    //   handle next button click
    const onSubmit = async (data) => {
      const cId = course?._id || course?.id;

      if (editCourse) {
        if (isFormUpdated()) {
          const currentValues = getValues()
          const formData = new FormData()
          formData.append("courseId", cId)
          if (currentValues.courseTitle !== course.courseName) {
            formData.append("courseName", data.courseTitle)
          }
          if (currentValues.courseShortDesc !== course.courseDescription) {
            formData.append("courseDescription", data.courseShortDesc)
          }
          if (String(currentValues.coursePrice) !== String(course.price)) {
            formData.append("price", data.coursePrice)
          }
          const currentTags = Array.isArray(currentValues.courseTags) ? currentValues.courseTags.toString() : String(currentValues.courseTags || '')
          const courseTags = Array.isArray(course.tag) ? course.tag.toString() : String(course.tag || '')
          if (currentTags !== courseTags) {
            formData.append("tag", JSON.stringify(data.courseTags))
          }
          if (currentValues.courseBenefits !== course.whatYouWillLearn) {
            formData.append("whatYouWillLearn", data.courseBenefits)
          }
          const courseCatId = typeof course.category === 'object' ? (course.category?._id || course.category?.id || course.categoryId) : (course.category || course.categoryId)
          if (String(currentValues.courseCategory) !== String(courseCatId)) {
            formData.append("category", data.courseCategory)
          }
          const currentReqs = Array.isArray(currentValues.courseRequirements) ? currentValues.courseRequirements.toString() : String(currentValues.courseRequirements || '')
          const courseReqs = Array.isArray(course.instructions) ? course.instructions.toString() : String(course.instructions || '')
          if (currentReqs !== courseReqs) {
            formData.append(
              "instructions",
              JSON.stringify(data.courseRequirements)
            )
          }
          if (currentValues.courseImage && currentValues.courseImage !== course.thumbnail) {
            formData.append("thumbnailImage", data.courseImage)
          }
          setLoading(true)
          const result = await editCourseDetails(formData, token)
          setLoading(false)
          if (result) {
            dispatch(setStep(2))
            dispatch(setCourse(result))
          }
        } else {
          dispatch(setStep(2))
        }
        return
      }
  
      const formData = new FormData()
      formData.append("courseName", data.courseTitle)
      formData.append("courseDescription", data.courseShortDesc)
      formData.append("price", data.coursePrice)
      formData.append("tag", JSON.stringify(data.courseTags))
      formData.append("whatYouWillLearn", data.courseBenefits)
      formData.append("category", data.courseCategory)
      formData.append("status", COURSE_STATUS.DRAFT)
      formData.append("instructions", JSON.stringify(data.courseRequirements))
      formData.append("thumbnailImage", data.courseImage)
      setLoading(true)
      const result = await addCourseDetails(formData, token)
      if (result) {
        dispatch(setStep(2))
        dispatch(setCourse(result))
      }
      setLoading(false)
    }
  
    return (
     <form
  onSubmit={handleSubmit(onSubmit)}
  className="max-w-4xl mx-auto space-y-8 rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] shadow-2xl"
>
  <div className="rounded-3xl bg-richblack-800 p-8 space-y-8">

    {/* HEADER */}
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
        Course Information
      </h2>
      <p className="text-sm text-richblack-300">
        Fill in the details to create your course
      </p>
    </div>

    {/* TITLE */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-richblack-200">
        Course Title <sup className="text-pink-400">*</sup>
      </label>
      <input
        {...register("courseTitle", { required: true })}
        placeholder="e.g. Complete MERN Stack Bootcamp"
        className="w-full rounded-xl bg-richblack-900 px-4 py-3 text-white border border-richblack-700 focus:border-yellow-400 outline-none transition"
      />
      {errors.courseTitle && (
        <span className="text-xs text-pink-400">Required</span>
      )}
    </div>

    {/* DESCRIPTION */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-richblack-200">
        Short Description <sup className="text-pink-400">*</sup>
      </label>
      <textarea
        {...register("courseShortDesc", { required: true })}
        className="w-full min-h-[130px] rounded-xl bg-richblack-900 px-4 py-3 text-white border border-richblack-700 focus:border-yellow-400 outline-none transition"
      />
      {errors.courseShortDesc && (
        <span className="text-xs text-pink-400">Required</span>
      )}
    </div>

    {/* PRICE */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-richblack-200">
        Course Price <sup className="text-pink-400">*</sup>
      </label>
      <div className="relative">
        <input
          {...register("coursePrice", { required: true })}
          className="w-full rounded-xl bg-richblack-900 px-10 py-3 text-white border border-richblack-700 focus:border-yellow-400 outline-none"
        />
        <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 text-xl" />
      </div>
    </div>

    {/* CATEGORY */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-richblack-200">
        Course Category <sup className="text-pink-400">*</sup>
      </label>
      <select
        {...register("courseCategory", { required: true })}
        className="w-full rounded-xl bg-richblack-900 px-4 py-3 text-white border border-richblack-700 focus:border-yellow-400 outline-none"
      >
        <option value="">Choose Category</option>
        {courseCategories?.map((cat, i) => (
          <option key={i} value={cat._id}>{cat.name}</option>
        ))}
      </select>
    </div>

    {/* TAGS */}
    <ChipInput
      label="Tags"
      name="courseTags"
      placeholder="Press Enter to add tags"
      register={register}
      errors={errors}
      setValue={setValue}
      getValues={getValues}
    />

    {/* IMAGE */}
    <Upload
      name="courseImage"
      label="Course Thumbnail"
      register={register}
      setValue={setValue}
      errors={errors}
      editData={editCourse ? course?.thumbnail : null}
    />

    {/* BENEFITS */}
    <div className="flex flex-col gap-2">
      <label className="text-sm text-richblack-200">
        Course Benefits <sup className="text-pink-400">*</sup>
      </label>
      <textarea
        {...register("courseBenefits", { required: true })}
        className="w-full min-h-[120px] rounded-xl bg-richblack-900 px-4 py-3 text-white border border-richblack-700 focus:border-yellow-400 outline-none"
      />
    </div>

    {/* REQUIREMENTS */}
    <RequirementField
      name="courseRequirements"
      label="Requirements / Instructions"
      register={register}
      setValue={setValue}
      errors={errors}
      getValues={getValues}
    />

    {/* BUTTONS */}
    <div className="flex justify-end gap-4 pt-4">

      {editCourse && (
        <button
          onClick={() => dispatch(setStep(2))}
          className="px-5 py-2 rounded-xl border border-richblack-600 text-richblack-200 hover:bg-richblack-700 transition"
        >
          Skip
        </button>
      )}

      <Iconbtn
        disabled={loading}
        text={!editCourse ? "Next Step" : "Save Changes"}
        customClasses="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 transition"
      >
        <MdNavigateNext />
      </Iconbtn>

    </div>

  </div>
</form>
    )
  }