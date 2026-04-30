import React from 'react'
import HighLightText from './HighLightText'
import CTAButton from "./Button"
import know_your_progress  from "../../../assests/Images/Know_your_progress.png"
import compare_with_others from "../../../assests/Images/Compare_with_others.png"
import plan_your_lessons from "../../../assests/Images/Plan_your_lessons.png"

const LearningLanguageSection = () => {
  return (
    <div className='mt-[130px] mb-32'>
        <div className='flex flex-col gap-5 items-center'>

            <div className='text-4xl font-semibold text-center'>
                Your swiss knife for
                <HighLightText text={" learning any language"} />
            </div>

            <div className='text-center text-richblack-600 mx-auto text-base font-medium w-[70%]'>
                Using spin making learning multiple languages easy. with 20+ languages realistic voice-over, progress tracking, custom schedule and more.
            </div>

            <div className='flex flex-col lg:flex-row items-center justify-center mt-5'>
                <img 
                    src={know_your_progress}
                    alt="KnowYourProgressImage"
                    className='object-contain lg:-mr-32 '
                />
                <img 
                    src={compare_with_others}
                    alt="CompareWithOthersImage"
                    className='object-contain'
                />
                <img 
                    src={plan_your_lessons}
                    alt="PlanYourLessonsImage"
                    className='object-contain lg:-ml-36'
                />
            </div>

            <div className='w-fit mt-10'>
                <CTAButton active={true} linkto={"/signup"}>
                    Learn More
                </CTAButton>
            </div>

        </div>
    </div>
  )
}

export default LearningLanguageSection
