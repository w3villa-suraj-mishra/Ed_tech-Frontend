import React from 'react'

import Logo1 from "../../../assests/TimeLineLogo/Logo1.svg"
import Logo2 from "../../../assests/TimeLineLogo/Logo2.svg"
import Logo3 from "../../../assests/TimeLineLogo/Logo3.svg"
import Logo4 from "../../../assests/TimeLineLogo/Logo4.svg"
import timelineImage from "../../../assests/Images/TimelineImage.png"

const timeline = [
    {
        Logo: Logo1,
        heading: "Leadership",
        Description: "Fully committed to the success company",
    },
    {
        Logo: Logo2,
        heading: "Responsibility",
        Description: "Students will always be our top priority",
    },
    {
        Logo: Logo3,
        heading: "Flexibility",
        Description: "The ability to switch is an important skills",
    },
    {
        Logo: Logo4,
        heading: "Solve the problem",
        Description: "Code your way to a solution",
    },
];

const TimelineSection = () => {
  return (
    <div>
        <div className='flex flex-col lg:flex-row gap-15 items-center'>
            <div className='w-[100%] lg:w-[45%] flex flex-col gap-5'>
                {
                    timeline.map( (element, index) => {
                        return (
                            <div className='flex flex-col gap-3' key={index}>
                                <div className='flex flex-row gap-6' key={index}>
                                    <div className='w-[50px] h-[50px] bg-white flex items-center justify-center rounded-full shadow-[#00000012] shadow-[0_0_62px_0]'>
                                        <img src={element.Logo} alt="" />
                                    </div>

                                    <div>
                                        <h2 className='font-semibold text-[18px] text-richblack-900'>{element.heading}</h2>
                                        <p className='text-base text-richblack-700'>{element.Description}</p>
                                    </div>
                                </div>
                                <div className={`${timeline.length - 1 === index ? "hidden" : "lg:block"}  h-14 border-dotted border-r border-richblack-100 bg-richblack-400/0 w-[26px]`}></div>
                            </div>
                        )
                    } )
                }
            </div>

            <div className='relative shadow-blue-200'>
                <img src={timelineImage}
                alt="timelineImage"
                className='shadow-white object-cover h-fit'
                />

              <div className='absolute 
    bg-black/60 backdrop-blur-md
    flex flex-row text-white uppercase py-7
    left-[50%] translate-x-[-50%] translate-y-[-50%]
    rounded-xl shadow-2xl border border-white/20'>

    <div className='flex flex-row gap-5 items-center border-r border-white/30 px-7'>
        <p className='text-3xl font-bold'>10</p>
        <p className='text-gray-200 text-sm'>Years of Experience</p>
    </div>

    <div className='flex gap-5 items-center px-7'>
        <p className='text-3xl font-bold'>250</p>
        <p className='text-gray-200 text-sm'>Type of Courses</p>
    </div>

</div>
            </div>
        </div>
    </div>
  )
}

export default TimelineSection
