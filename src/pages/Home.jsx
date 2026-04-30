import React from 'react'
import { Link } from "react-router-dom"
import HighLightText from '../components/core/HomePage/HighLightText'
import CTAButton from "../components/core/HomePage/Button"
import CodeBlocks from '../components/core/HomePage/CodeBlocks'
import TimelineSection from '../components/core/HomePage/TimelineSection'
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection'
import InstructorSection from '../components/core/HomePage/InstructorSection'
import ExploreMore from '../components/core/HomePage/ExploreMore'
import Reviewslider from '../components/Common/Reviewslider'
import Banner from "../assests/Images/banner.mp4"
import SparkleEffect from '../components/Common/SparkleEffect'
import InstructorSlider from '../components/core/HomePage/InstructorSlider'

// Mock FaArrowRight
const FaArrowRight = () => <span>→</span>;

const Home = () => {
    return (
        <div className='font-inter relative'>
            <SparkleEffect />
            {/* Section 1 */}
            <div className='relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between'>

                <Link to={"/signup"}>
                    <div className='group mt-8 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit shadow-[0_1px_1px_rgba(255,255,255,0.2)]'>
                        <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900'>
                            <p>Become an Instructor</p>
                            <FaArrowRight />
                        </div>
                    </div>
                </Link>

                <div className='text-center text-4xl font-semibold mt-8'>
                    Empower Your Future With
                    <HighLightText text={" Coding Skills"} />
                </div>

                <div className='mt-4 w-[90%] text-center text-lg font-bold text-richblack-300'>
                    With our online coding courses, you can learn
                    at your own pace, from anywhere in the world, and get access to
                    a wealth of resources, including hands-on
                    projects, quizzes, and personalized feedback from instructors.
                </div>

                <div className='flex flex-row gap-7 mt-8'>
                    <CTAButton active={true} linkto={"/signup"}>
                        Learn More
                    </CTAButton>
                    <CTAButton active={false} linkto={"/login"}>
                        Book a Demo
                    </CTAButton>
                </div>

                <div className='mx-3 my-7 h-[500px] shadow-[10px_-5px_50px_-5px] shadow-blue-200 rounded-lg overflow-hidden w-[100%] max-w-[1260px]'>
                    <video
                        muted
                        loop
                        autoPlay
                        className="shadow-[20px_20px_rgba(255,255,255)] aspect-video object-cover"
                    >
                        <source src={Banner} type="video/mp4" />
                    </video>
                </div>

                {/* Code Section 1 */}
                <div className='w-full'>
                    <CodeBlocks
                        position={"lg:flex-row"}
                        heading={
                            <div className='text-4xl font-semibold'>
                                Unlock Your
                                <HighLightText text={" coding potential "} />
                                with our online courses
                            </div>
                        }
                        subheading={
                            "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
                        }
                        ctabtn1={{
                            btnText: "Try it Yourself",
                            linkto: "/signup",
                            active: true,
                        }}
                        ctabtn2={{
                            btnText: "Learn More",
                            linkto: "/login",
                            active: false,
                        }}
                        codeblock={`<!DOCTYPE html>\n<html>\n<head>\n<title>Example</title>\n<link rel="stylesheet" href="styles.css">\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav>\n<a href="one/">One</a>\n<a href="two/">Two</a>\n<a href="three/">Three</a>\n</nav>\n</body>\n</html>`}
                        codeColor={"text-yellow-25"}
                        backgroundGradient={<div className='codeblock1 absolute'></div>}
                    />
                </div>

                {/* Code Section 2 */}
                <div className='w-full'>
                    <CodeBlocks
                        position={"lg:flex-row-reverse"}
                        heading={
                            <div className='text-4xl font-semibold'>
                                Start
                                <HighLightText text={" coding in seconds "} />
                            </div>
                        }
                        subheading={
                            "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson"
                        }
                        ctabtn1={{
                            btnText: "Continue Lesson",
                            linkto: "/signup",
                            active: true,
                        }}
                        ctabtn2={{
                            btnText: "Learn More",
                            linkto: "/login",
                            active: false,
                        }}
                        codeblock={`import React from 'react';\nconst App = () => {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n};\nexport default App;`}
                        codeColor={"text-blue-5"}
                        backgroundGradient={<div className='codeblock2 absolute'></div>}
                    />
                </div>

                <ExploreMore />
            </div>

            {/* Section 2 */}
            <div className='bg-richblack-900 text-richblack-5'>
                <div className='homepage_bg h-[310px] flex items-center justify-center'>
                    <div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>
                        <div className='h-[150px]'></div>
                        <div className='flex flex-row gap-7 text-white'>
                            <CTAButton active={true} linkto={"/signup"}>
                                <div className='flex items-center gap-3'>
                                    Explore Full Catalog
                                    <FaArrowRight />
                                </div>
                            </CTAButton>
                            <CTAButton active={false} linkto={"/signup"}>
                                <div>Learn More</div>
                            </CTAButton>
                        </div>
                    </div>
                </div>

                <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7 py-16'>
                    <div className='flex flex-row gap-5 mb-10'>
                        <div className='text-4xl font-semibold w-[45%] text-richblack-5'>
                            Get the Skills you need for a
                            <HighLightText text={" Job that is in demand"} />
                        </div>

                        <div className='flex flex-col gap-10 w-[40%] items-start'>
                            <div className='text-[16px] text-richblack-300'>
                                The modern StudyNotion is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                            </div>
                            <CTAButton active={true} linkto={"/signup"}>
                                <div>Learn More</div>
                            </CTAButton>
                        </div>
                    </div>

                    <TimelineSection />
                    <LearningLanguageSection />
                </div>
            </div>

            {/* Section 3 */}
            <div className='w-11/12 mx-auto max-w-maxContent flex flex-col items-center justify-between gap-24 bg-richblack-900 text-white py-20'>
                <InstructorSlider />
                
                <div className='w-full border-t border-richblack-800 pt-20'>
                    <InstructorSection />
                </div>

                <div className='w-full flex flex-col items-center gap-10'>
                    <h1 className='text-center text-4xl font-semibold'>
                        What our <HighLightText text={"Students Say"} />
                    </h1>
                    <Reviewslider />
                </div>
            </div>

           
        </div>
    )
}

export default Home;
