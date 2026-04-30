import React from "react"
import { HiOutlineVideoCamera } from "react-icons/hi"

function CourseSubSectionAccordion({ subSec }) {
  return (
    <div className="group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-300 hover:bg-white/5 hover:shadow-sm">

      {/* LEFT CONTENT */}
      <div className="flex items-center gap-3">

        {/* ICON */}
        <div className="flex items-center justify-center rounded-lg bg-white/10 p-2 text-blue-400 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:scale-105">
          <HiOutlineVideoCamera size={18} />
        </div>

        {/* TITLE */}
        <p className="text-sm font-medium text-richblack-50 transition-all duration-300 group-hover:text-white">
          {subSec?.title}
        </p>
      </div>

      {/* OPTIONAL RIGHT SIDE (future-ready UI space) */}
      <div className="text-xs text-richblack-300 opacity-0 transition-all duration-300 group-hover:opacity-100">
        ▶
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion