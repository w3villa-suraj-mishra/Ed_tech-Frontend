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
  className="max-w-4xl mx-auto space-y-8 rounded-2xl bg-[#0c0e1a] border border-blue-950/30 p-6 sm:p-8 shadow-2xl"
>
  <div className="space-y-6">

    {/* HEADER */}
    <div className="border-b border-blue-950/30 pb-4">
      <h2 className="text-xl font-bold text-white tracking-tight">
        Course Information
      </h2>
      <p className="text-xs text-blue-300/70 mt-1">
        Fill in the details to create or update your course.
      </p>
    </div>

    {/* TITLE */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-blue-200">
        Course Title <sup className="text-red-400">*</sup>
      </label>
      <input
        {...register("courseTitle", { required: true })}
        placeholder="e.g. Complete MERN Stack Bootcamp"
        className="w-full rounded-xl bg-[#070913] px-4 py-3 text-xs text-white border border-blue-950/40 focus:border-blue-500 outline-none transition"
      />
      {errors.courseTitle && (
        <span className="text-[11px] font-semibold text-red-400">Title is required</span>
      )}
    </div>

    {/* DESCRIPTION */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-blue-200">
        Short Description <sup className="text-red-400">*</sup>
      </label>
      <textarea
        {...register("courseShortDesc", { required: true })}
        placeholder="Enter short overview of the course"
        className="w-full min-h-[110px] rounded-xl bg-[#070913] px-4 py-3 text-xs text-white border border-blue-950/40 focus:border-blue-500 outline-none transition"
      />
      {errors.courseShortDesc && (
        <span className="text-[11px] font-semibold text-red-400">Description is required</span>
      )}
    </div>

    {/* PRICE */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-blue-200">
        Course Price <sup className="text-red-400">*</sup>
      </label>
      <div className="relative">
        <input
          {...register("coursePrice", { required: true })}
          placeholder="0.00"
          className="w-full rounded-xl bg-[#070913] px-10 py-3 text-xs text-white border border-blue-950/40 focus:border-blue-500 outline-none"
        />
        <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg" />
      </div>
      {errors.coursePrice && (
        <span className="text-[11px] font-semibold text-red-400">Price is required</span>
      )}
    </div>

    {/* CATEGORY */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-blue-200">
        Course Category <sup className="text-red-400">*</sup>
      </label>
      <select
        {...register("courseCategory", { required: true })}
        className="w-full rounded-xl bg-[#070913] px-4 py-3 text-xs text-white border border-blue-950/40 focus:border-blue-500 outline-none"
      >
        <option value="">Choose Category</option>
        {courseCategories?.map((cat, i) => (
          <option key={i} value={cat._id}>{cat.name}</option>
        ))}
      </select>
      {errors.courseCategory && (
        <span className="text-[11px] font-semibold text-red-400">Category is required</span>
      )}
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
      <label className="text-xs font-semibold text-blue-200">
        Course Benefits <sup className="text-red-400">*</sup>
      </label>
      <textarea
        {...register("courseBenefits", { required: true })}
        placeholder="Enter key benefits students will gain"
        className="w-full min-h-[100px] rounded-xl bg-[#070913] px-4 py-3 text-xs text-white border border-blue-950/40 focus:border-blue-500 outline-none"
      />
      {errors.courseBenefits && (
        <span className="text-[11px] font-semibold text-red-400">Benefits are required</span>
      )}
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
    <div className="flex justify-end gap-4 pt-4 border-t border-blue-950/30">
      {editCourse && (
        <button
          type="button"
          onClick={() => dispatch(setStep(2))}
          className="px-5 py-2.5 rounded-xl border border-blue-950/40 text-blue-300 hover:bg-blue-950/30 text-xs font-bold transition"
        >
          Continue to Builder
        </button>
      )}

      <button
        disabled={loading}
        type="submit"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-950/50 transition-all hover:scale-[1.02]"
      >
        <span>{!editCourse ? "Next Step" : "Save Changes"}</span>
        <MdNavigateNext size={18} />
      </button>
    </div>

  </div>
</form>
    )
  }