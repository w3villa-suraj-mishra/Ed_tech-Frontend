import React from 'react'
import HighLightText from './HighLightText'
import CTAButton from "./Button"
import Instructor from "../../../assests/Images/Instructor.png"

const FaArrowRight = () => <span>→</span>;

const InstructorSection = () => {
  return (
    <div className='mt-16'>
        <div className='flex flex-col lg:flex-row gap-20 items-center'>
            
            <div className='lg:w-[50%]'>
                <img
                    src={Instructor}
                    alt="Instructor"
                    className='shadow-white shadow-[-20px_-20px_0px_0px]'
                />
            </div>

            <div className='lg:w-[50%] flex flex-col gap-10'>
                <div className='text-4xl font-semibold w-[50%]'>
                    Become an
                    <HighLightText text={"Instructor"} />
                </div>

                <p className='font-medium text-[16px] w-[80%] text-richblack-300'>
                Instructors from around the world teach millions of students on StudyNotion. We provide the tools and skills to teach what you love.
                </p>

                <div className='w-fit'>
                    <CTAButton active={true} linkto={"/signup"}>
                        <div className='flex flex-row gap-2 items-center'>
                            Start Teaching Today
                            <FaArrowRight />
                        </div>
                    </CTAButton>
                </div>
            </div>

        </div>
    </div>
  )
}

export default InstructorSection
