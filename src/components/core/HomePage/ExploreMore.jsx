import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import HighLightText from "./HighLightText";

export const HomePageExplore = [
    {
        tag: 'Free',
        courses : [
            {
                heading : "Learn HTML",
                description : "This course covers the basic concepts of HTML including creating and linking pages, inserting images and more.",
                level : 'Beginner',
                lessionNumber : 6
            },
            {
                heading : "Learn CSS",
                description : "This course covers the basic concepts of CSS including styling elements, using flexbox and grid, and more.",
                level : 'Beginner',
                lessionNumber : 6
            },
            {
                heading : "Responsive Design",
                description : "This course covers responsive web design techniques, including media queries, flexible grids, and images.",
                level : 'Beginner',
                lessionNumber : 6
            },
        ]
    },
    {
        tag: 'New to coding',
        courses : [
            {
                heading : "JavaScript",
                description : "Learn the fundamentals of JavaScript, the language that powers the interactive web.",
                level : 'Beginner',
                lessionNumber : 8
            },
            {
                heading : "Python",
                description : "Master Python, the versatile language used for everything from web dev to AI.",
                level : 'Beginner',
                lessionNumber : 10
            },
            {
                heading : "C++",
                description : "Dive into systems programming and competitive coding with C++.",
                level : 'Beginner',
                lessionNumber : 12
            },
        ]
    },
    {
        tag: 'Most popular',
        courses : [
            {
                heading : "Java",
                description : "Build robust applications with Java, one of the most widely used enterprise languages.",
                level : 'Beginner',
                lessionNumber : 15
            },
            {
                heading : "React JS",
                description : "Create dynamic user interfaces with the most popular JavaScript library.",
                level : 'Intermediate',
                lessionNumber : 20
            },
            {
                heading : "Node JS",
                description : "Learn back-end development with JavaScript and the Node runtime.",
                level : 'Intermediate',
                lessionNumber : 18
            },
        ]
    },
    {
        tag: 'Skills paths',
        courses : [
            {
                heading : "Flask",
                description : "Build lightweight web applications with Python and the Flask framework.",
                level : 'Intermediate',
                lessionNumber : 8
            },
            {
                heading : "Django",
                description : "Master the 'batteries-included' web framework for rapid development with Python.",
                level : 'Advanced',
                lessionNumber : 15
            },
            {
                heading : "Fast API",
                description : "Build high-performance APIs with Python 3.6+ using standard Python type hints.",
                level : 'Intermediate',
                lessionNumber : 10
            },
        ]
    },
    {
        tag: 'Career paths',
        courses : [
            {
                heading : "Next.js",
                description : "The React framework for production. Learn server-side rendering and static site generation.",
                level : 'Intermediate',
                lessionNumber : 12
            },
            {
                heading : "Nuxt.js",
                description : "Build powerful Vue applications with server-side rendering capabilities.",
                level : 'Intermediate',
                lessionNumber : 10
            },
            {
                heading : "Sanity",
                description : "Learn to manage content at scale with Sanity's headless CMS platform.",
                level : 'Intermediate',
                lessionNumber : 6
            },
        ]
    },
];

const tabsName = [
    "Free",
    "New to coding",
    "Most popular",
    "Skills paths",
    "Career paths",
];

const ExploreMore = () => {
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(tabsName[0]);
    const [courses, setCourses] = useState(HomePageExplore[0].courses);
    const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0].heading);

    const setMyCards = (value) => {
        setCurrentTab(value);
        const result = HomePageExplore.filter((course) => course.tag === value);
        setCourses(result[0].courses);
        setCurrentCard(result[0].courses[0].heading);
    }

    const handleCardClick = (heading) => {
        setCurrentCard(heading);
        navigate(`/courses?search=${encodeURIComponent(heading)}`);
    }

  return (
    <div className='relative w-full flex flex-col items-center mt-10'>
        <div className='text-4xl font-semibold text-center'>
            Unlock the
            <HighLightText text={"Power of Code"} />
        </div>

        <p className='text-center text-richblack-300 text-lg font-semibold mt-3'>
            Learn to build anything you can imagine
        </p>

        <div className='mt-5 flex flex-row rounded-full bg-richblack-800 mb-5 border-richblack-100
        px-1 py-1'>
            {
                tabsName.map( (element, index) => {
                    return (
                        <div
                        className={`text-[16px] flex flex-row items-center gap-2 
                        ${currentTab === element 
                        ? "bg-richblack-900 text-richblack-5 font-medium"
                        : "text-richblack-200" } rounded-full transition-all duration-200 cursor-pointer
                        hover:bg-richblack-900 hover:text-richblack-5 px-7 py-2`}
                        key={index}
                        onClick={() => setMyCards(element)}
                        >
                            {element}
                        </div>
                    )
                })
            }
        </div>

        <div className='lg:h-[150px]'></div>

        {/* Course Cards */}
        <div className='lg:absolute flex flex-row gap-10 justify-between w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[50%] text-black mb-7 lg:mb-0 px-3'>
            {courses.map((element, index) => (
                <div 
                    key={index} 
                    className={`w-[360px] h-[300px] p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer
                    ${currentCard === element.heading 
                        ? "bg-white shadow-[12px_12px_0_0_#FFD60A] text-richblack-800" 
                        : "bg-richblack-800 text-richblack-200"}`}
                    onClick={() => handleCardClick(element.heading)}
                >
                    <div>
                        <h2 className={`font-bold text-[20px] mb-3 ${currentCard === element.heading ? "text-richblack-800" : "text-richblack-5"}`}>
                            {element.heading}
                        </h2>
                        <p className={`text-[16px] ${currentCard === element.heading ? "text-richblack-500" : "text-richblack-400"}`}>
                            {element.description}
                        </p>
                    </div>
                    <div className={`flex justify-between border-t border-dashed border-richblack-600 pt-4 font-medium
                        ${currentCard === element.heading ? "text-blue-300" : "text-richblack-300"}`}>
                        <div className='flex items-center gap-2'>
                            <span>👤</span>
                            <p>{element.level}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <span>📄</span>
                            <p>{element.lessionNumber} Lessons</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default ExploreMore
