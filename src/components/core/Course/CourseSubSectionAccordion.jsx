import React from "react"
import { HiOutlineVideoCamera, HiLockClosed } from "react-icons/hi"
import { BsPlayFill } from "react-icons/bs"
import { useNavigate } from "react-router-dom"

function CourseSubSectionAccordion({ subSec, isLocked = false, courseId, sectionId }) {
  const navigate = useNavigate();

  const handleLectureClick = () => {
    if (!isLocked && courseId && sectionId && subSec?._id) {
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSec._id}`);
    }
  };

  return (
    <div 
      onClick={handleLectureClick}
      className={`group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-300 ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/5 hover:shadow-sm cursor-pointer'
    }`}>

      {/* LEFT: ICON + TITLE */}
      <div className="flex items-center gap-3">

        <div className={`flex items-center justify-center rounded-lg p-2 transition-all duration-300 ${
          isLocked
            ? 'bg-richblack-700 text-richblack-400'
            : 'bg-white/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105'
        }`}>
          <HiOutlineVideoCamera size={18} />
        </div>

        <p className="text-sm font-medium text-richblack-50 transition-all duration-300 group-hover:text-white line-clamp-1">
          {subSec?.title}
        </p>
      </div>

      {/* RIGHT: PLAY or LOCK icon */}
      <div className="shrink-0 ml-2">
        {isLocked ? (
          <HiLockClosed size={16} className="text-richblack-400" />
        ) : (
          <BsPlayFill size={16} className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        )}
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion