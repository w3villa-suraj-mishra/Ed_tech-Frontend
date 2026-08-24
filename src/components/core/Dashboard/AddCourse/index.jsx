// logic defined course add karne ka
import React from 'react'
import RenderSteps from "./RenderSteps"

export default function AddCourse() {
  return (
    <div className="mx-auto w-11/12 max-w-[1200px] py-10 font-['Inter',sans-serif]">
      <div className="flex w-full items-start gap-x-8">
        <div className="flex flex-1 flex-col">
          <h1 className="mb-8 text-3xl font-extrabold text-white tracking-tight">
            Add Course
          </h1>
          <div className="flex-1">
            <RenderSteps />
          </div>
        </div>

        {/* Course Upload Tips */}
        <div className="sticky top-10 hidden max-w-[360px] flex-1 rounded-2xl border border-purple-900/30 bg-[#0c0e1a] p-6 xl:block shadow-2xl space-y-4">
          <p className="text-base font-bold text-white flex items-center gap-2">
            <span>⚡</span> Course Upload Tips
          </p>
          <ul className="list-disc space-y-3 pl-5 text-xs text-purple-300/70 leading-relaxed font-medium">
            <li>Set the Course Price option or make it free.</li>
            <li>Standard size for the course thumbnail is 1024x576.</li>
            <li>Video section controls the course overview video.</li>
            <li>Course Builder is where you create & organize a course.</li>
            <li>
              Add Topics in the Course Builder section to create lessons,
              quizzes, and assignments.
            </li>
            <li>
              Information from the Additional Data section shows up on the
              course single page.
            </li>
            <li>Make Announcements to notify any important updates.</li>
            <li>Notes to all enrolled students at once.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}