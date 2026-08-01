import { useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"
import CourseSubSectionAccordion from "./CourseSubSectionAccordion"

export default function CourseAccordionBar({ course, isActive, handleActive, courseId, isEnrolled }) {
  const contentRef = useRef(null)
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    setActive(isActive?.includes(course._id))
  }, [isActive, course._id])

  useEffect(() => {
    setHeight(active ? contentRef.current.scrollHeight : 0)
  }, [active])

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#020617] shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl">

      {/* HEADER */}
      <div
        onClick={() => handleActive(course._id)}
        className="flex cursor-pointer items-center justify-between px-6 py-5 group"
      >
        <div className="flex items-center gap-3">

          {/* ICON */}
          <div
            style={{ transform: active ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            className="flex items-center justify-center rounded-full bg-white/10 p-2 text-white group-hover:bg-blue-500/20"
          >
            <AiOutlineDown size={18} />
          </div>

          {/* TITLE */}
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-all">
            {course?.sectionName}
          </h3>
        </div>

        {/* LECTURE COUNT & DURATION */}
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
            {course?.subSection?.length || 0} Lectures
          </div>
          <div className="text-sm font-medium text-richblack-300">
            {course?.totalDuration}
          </div>
        </div>
      </div>

      {/* CONTENT (Vanilla CSS Transition) */}
      <div
        style={{
          maxHeight: active ? `${height}px` : "0px",
          opacity: active ? 1 : 0,
          transition: "max-height 0.4s ease, opacity 0.4s ease",
          overflow: "hidden"
        }}
      >
        <div
          ref={contentRef}
          className="px-6 pb-6 pt-2 flex flex-col gap-3"
        >
          {course?.subSection?.map((subSec, i) => (
            <div key={i} style={{ transition: `transform 0.3s ease ${i * 0.05}s` }}>
              <CourseSubSectionAccordion 
                subSec={subSec} 
                courseId={courseId}
                sectionId={course._id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}