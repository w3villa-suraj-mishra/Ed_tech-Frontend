import React from 'react'
import { FaCheck } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import CourseInformationForm from './CourseInformation/CourseInformationForm'
import PublishCourse from './PublishCourse'
import CourseBuliderForm from "../../Dashboard/AddCourse/CourseBulider/CourseBuliderForm"


const RenderSteps = () => {

    const { step } = useSelector((state) => state.course)

    const steps = [
      {
        id: 1,
        title: "Course Information",
      },
      {
        id: 2,
        title: "Course Builder",
      },
      {
        id: 3,
        title: "Publish",
      },
    ]
  
    return (
      <>
        <div className="relative mb-4 flex w-full justify-center items-center">
          {steps.map((item) => (
            <React.Fragment key={item.id}>
              <div className="flex flex-col items-center">
                <button
                  className={`grid cursor-default aspect-square w-9 place-items-center rounded-full text-xs font-extrabold transition-all border ${
                    step === item.id
                      ? "border-purple-400 bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                      : step > item.id
                      ? "border-emerald-500/40 bg-emerald-600 text-white"
                      : "border-purple-900/40 bg-[#0c0e1a] text-purple-400/60"
                  }`}
                >
                  {step > item.id ? (
                    <FaCheck className="text-white text-xs" />
                  ) : (
                    item.id
                  )}
                </button>
              </div>
              {item.id !== steps.length && (
                <div
                  className={`h-0.5 w-[25%] mx-2 transition-all ${
                    step > item.id ? "bg-emerald-500" : "bg-purple-900/40"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="relative mb-10 flex w-full select-none justify-between max-w-xl mx-auto px-4">
          {steps.map((item) => (
            <div
              className="flex flex-col items-center text-center"
              key={item.id}
            >
              <p
                className={`text-xs font-bold transition-colors ${
                  step >= item.id ? "text-purple-300" : "text-purple-400/40"
                }`}
              >
                {item.title}
              </p>
            </div>
          ))}
        </div>
        {/* Render specific component based on current step */}
        {step === 1 && <CourseInformationForm />}
        {step === 2 && <CourseBuliderForm />}
        {step === 3 && <PublishCourse />}
      </>
    )
  }
export default RenderSteps
