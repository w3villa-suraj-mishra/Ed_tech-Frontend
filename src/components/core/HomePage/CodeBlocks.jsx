import React from 'react'
import CTAButton from "./Button"

// Mock for FaArrowRight if react-icons is missing
const FaArrowRight = () => <span>→</span>;

// Mock for TypeAnimation if react-type-animation is missing
const TypeAnimation = ({sequence, cursor, style}) => {
    return (
        <span style={style}>
            {sequence[0]}
            {cursor && <span className="animate-pulse">|</span>}
        </span>
    );
}

const CodeBlocks = ({
    position, heading, subheading, ctabtn1, ctabtn2, codeblock, codeColor, backgroundGradient
}) => {
  return (
    <div className={`flex ${position} my-20 justify-between flex-col lg:gap-10 gap-10`}>
        
        {/* Section 1 */}
        <div className='w-[100%] lg:w-[50%] flex flex-col gap-8'>
            {heading}
            <div className='text-richblack-300 text-base font-bold w-[85%] -mt-3'>
                {subheading}
            </div>

            <div className='flex gap-7 mt-7'>
                <CTAButton active={ctabtn1.active} linkto={ctabtn1.linkto}>
                    <div className='flex gap-2 items-center'>
                        {ctabtn1.btnText}
                        <FaArrowRight/>
                    </div>
                </CTAButton>

                <CTAButton active={ctabtn2.active} linkto={ctabtn2.linkto}>
                    {ctabtn2.btnText}
                </CTAButton>
            </div>
        </div>

        {/* Section 2 */}
        <div className='h-fit code-border flex flex-row py-3 text-[10px] sm:text-sm leading-[18px] sm:leading-[22px] relative w-[100%] lg:w-[470px] bg-white/5 backdrop-blur-sm rounded-lg border border-white/10'>
            {backgroundGradient}
            
            {/* Indexing */}
            <div className='text-center flex flex-col w-[10%] select-none text-richblack-400 font-inter font-bold'>
                {[...Array(11)].map((_, i) => <p key={i}>{i+1}</p>)}
            </div>

            {/* Code */}
            <div className={`w-[90%] flex flex-col gap-2 font-bold font-mono ${codeColor} pr-1`}>
                <TypeAnimation
                    sequence={[codeblock, 2000, ""]}
                    repeat={Infinity}
                    cursor={true}
                    style={{
                        whiteSpace: "pre-line",
                        display: "block",
                    }}
                    omitDeletionAnimation={true}
                />
            </div>
        </div>
    </div>
  )
}

export default CodeBlocks
