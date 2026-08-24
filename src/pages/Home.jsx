import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { useSelector } from 'react-redux'
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
import { getUserEnrolledCourses } from '../services/operations/profileAPI'
import { getHomePageStats, fetchCourseCategories, getAllCourses } from '../services/operations/courseDetailsAPI'

import {
    FaRocket,
    FaRegPlayCircle,
    FaUsers,
    FaBookOpen,
    FaCode,
    FaTrophy,
    FaGlobe,
    FaChartBar,
    FaMobileAlt,
    FaTerminal,
    FaCloud,
    FaPalette,
    FaStar
} from "react-icons/fa"

// Helper function to format numbers dynamically (1K+, 10K+, 1.2K+, 1M+, etc.)
const formatStatNumber = (num, defaultLabel = "0") => {
    if (num === null || num === undefined) return defaultLabel;
    if (typeof num === 'string' && isNaN(Number(num))) return num;
    const n = Number(num);
    if (n === 0) return "0";
    if (n >= 1000000) {
        const formatted = (n / 1000000).toFixed(1).replace(/\.0$/, '');
        return `${formatted}M+`;
    }
    if (n >= 1000) {
        const formatted = (n / 1000).toFixed(1).replace(/\.0$/, '');
        return `${formatted}K+`;
    }
    return `${n}+`;
};

// 3 Simple Steps Configuration
const threeStepsConfig = [
    {
        id: 1,
        title: "1. Choose a Course",
        desc: "Explore our wide range of courses and pick what interests you.",
        icon: FaBookOpen
    },
    {
        id: 2,
        title: "2. Learn & Practice",
        desc: "Learn from expert instructors and practice with hands-on projects.",
        icon: FaRegPlayCircle
    },
    {
        id: 3,
        title: "3. Build & Grow",
        desc: "Build real projects, earn certificates and grow your career.",
        icon: FaTrophy
    }
];

// Fallback category design presets for dynamic category mapping
const categoryDesignPresets = [
    { name: "Web Development", icon: FaGlobe, description: "Master modern web development" },
    { name: "Data Science", icon: FaChartBar, description: "Analyse data and build smart models" },
    { name: "Mobile Development", icon: FaMobileAlt, description: "Build apps for iOS & Android" },
    { name: "Programming", icon: FaTerminal, description: "Learn Python, Java, C++, and more" },
    { name: "Cloud Computing", icon: FaCloud, description: "Learn AWS, Azure and cloud technologies" },
    { name: "UI/UX Design", icon: FaPalette, description: "Design beautiful user experiences" }
];

// Badges sequence for featured courses
const featuredBadges = ["BESTSELLER", "MOST POPULAR", "TRENDING", "NEW"];

// Mock FaArrowRight
const FaArrowRight = () => <span>→</span>;

const Home = () => {
    const { token } = useSelector((state) => state.auth);

    const [hasActiveCourses, setHasActiveCourses] = useState(false);
    const [stats, setStats] = useState({
        learnersCount: null,
        coursesCount: null,
        projectsCount: null,
        certificationsCount: null
    });
    const [dbCategories, setDbCategories] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [showAllCatModal, setShowAllCatModal] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchStatsAndCategories = async () => {
            const [statsData, catData, coursesData] = await Promise.all([
                getHomePageStats(),
                fetchCourseCategories(),
                getAllCourses()
            ]);
            if (isMounted) {
                if (statsData) {
                    setStats({
                        learnersCount: statsData.learnersCount,
                        coursesCount: statsData.coursesCount,
                        projectsCount: statsData.projectsCount,
                        certificationsCount: statsData.certificationsCount
                    });
                }
                if (catData && Array.isArray(catData)) {
                    setDbCategories(catData);
                }
                if (coursesData && Array.isArray(coursesData)) {
                    setFeaturedCourses(coursesData.slice(0, 4));
                }
            }
        };
        fetchStatsAndCategories();
        return () => {
            isMounted = false;
        };
    }, []);

    // Merge backend categories with visual presets dynamically and take ONLY the first 6
    const popularCategoriesList = (dbCategories.length > 0 ? dbCategories : categoryDesignPresets).slice(0, 6).map((cat, idx) => {
        const preset = categoryDesignPresets.find(p => p.name.toLowerCase() === (cat.name || '').toLowerCase()) || categoryDesignPresets[idx % categoryDesignPresets.length];
        const categoryId = cat._id || cat.id;
        const categorySlug = (cat.name || preset.name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const targetLink = categoryId ? `/courses?category=${categoryId}` : `/courses?category=${categorySlug}`;
        return {
            _id: categoryId,
            name: cat.name || preset.name,
            description: cat.description || preset.description,
            icon: preset.icon,
            courseCount: cat.courseCount !== undefined ? cat.courseCount : (cat.courses?.length || 0),
            link: targetLink
        };
    });

    useEffect(() => {
        let isMounted = true;
        const checkEnrollment = async () => {
            if (token) {
                try {
                    const enrolled = await getUserEnrolledCourses(token);
                    if (isMounted) {
                        if (enrolled && Array.isArray(enrolled)) {
                            const validCourses = enrolled.filter((item) => {
                                const courseObj = item?.course || item;
                                const plan = item?.plan || courseObj?.plan;
                                const expiresAt = item?.expiresAt || courseObj?.expiresAt;

                                if (plan === 'silver' && expiresAt) {
                                    return new Date(expiresAt) > new Date();
                                }
                                return true;
                            });
                            setHasActiveCourses(validCourses.length > 0);
                        } else {
                            setHasActiveCourses(false);
                        }
                    }
                } catch (err) {
                    console.error("Error checking enrolled courses:", err);
                    if (isMounted) setHasActiveCourses(false);
                }
            } else {
                if (isMounted) {
                    setHasActiveCourses(false);
                }
            }
        };

        checkEnrollment();
        return () => {
            isMounted = false;
        };
    }, [token]);

    // Determine Primary CTA Button Text & Destination
    let primaryText = "Get Started Free";
    let primaryLink = "/signup";

    if (token) {
        if (hasActiveCourses) {
            primaryText = "Continue Learning";
            primaryLink = "/t/u/activeCourses";
        } else {
            primaryText = "Start Learning";
            primaryLink = "/courses";
        }
    }

    const secondaryText = "Explore Courses";
    const secondaryLink = "/courses";

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

                {/* Hero Action Buttons */}
                <div className='flex flex-row flex-wrap items-center justify-center gap-5 mt-8'>
                    <Link to={primaryLink}>
                        <button className='flex items-center gap-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold text-base px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] hover:scale-105'>
                            <FaRocket className='text-lg' />
                            <span>{primaryText}</span>
                        </button>
                    </Link>

                    <Link to={secondaryLink}>
                        <button className='flex items-center gap-3 bg-transparent border border-white/20 hover:border-white/40 text-white font-semibold text-base px-6 py-3.5 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:bg-white/5 hover:scale-105'>
                            <FaRegPlayCircle className='text-xl' />
                            <span>{secondaryText}</span>
                        </button>
                    </Link>
                </div>

                {/* Dynamic Stats Section */}
                <div className='w-full max-w-4xl mt-6 py-4 px-4 flex flex-wrap items-center justify-around gap-4 text-white bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl'>
                    {/* Stat 1: Learners */}
                    <div className='flex items-center gap-3.5'>
                        <div className='text-[#a855f7] text-2xl p-2 bg-[#a855f7]/10 rounded-xl'>
                            <FaUsers />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-xl font-bold tracking-tight'>
                                {formatStatNumber(stats.learnersCount)}
                            </span>
                            <span className='text-xs text-richblack-300 font-medium'>Learners</span>
                        </div>
                    </div>

                    <div className='hidden sm:block h-10 w-[1px] bg-white/10'></div>

                    {/* Stat 2: Courses */}
                    <div className='flex items-center gap-3.5'>
                        <div className='text-[#a855f7] text-2xl p-2 bg-[#a855f7]/10 rounded-xl'>
                            <FaBookOpen />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-xl font-bold tracking-tight'>
                                {formatStatNumber(stats.coursesCount)}
                            </span>
                            <span className='text-xs text-richblack-300 font-medium'>Courses</span>
                        </div>
                    </div>

                    <div className='hidden sm:block h-10 w-[1px] bg-white/10'></div>

                    {/* Stat 3: Projects */}
                    <div className='flex items-center gap-3.5'>
                        <div className='text-[#a855f7] text-2xl p-2 bg-[#a855f7]/10 rounded-xl'>
                            <FaCode />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-xl font-bold tracking-tight'>
                                {formatStatNumber(stats.projectsCount)}
                            </span>
                            <span className='text-xs text-richblack-300 font-medium'>Projects</span>
                        </div>
                    </div>

                    <div className='hidden sm:block h-10 w-[1px] bg-white/10'></div>

                    {/* Stat 4: Certifications */}
                    <div className='flex items-center gap-3.5'>
                        <div className='text-amber-400 text-2xl p-2 bg-amber-400/10 rounded-xl'>
                            <FaTrophy />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-xl font-bold tracking-tight'>
                                {stats.certificationsCount !== null && stats.certificationsCount > 0
                                    ? formatStatNumber(stats.certificationsCount)
                                    : "Top"}
                            </span>
                            <span className='text-xs text-richblack-300 font-medium'>Certifications</span>
                        </div>
                    </div>
                </div>

                {/* Video Banner */}
                <div className='mx-3 my-5 h-[420px] shadow-[10px_-5px_50px_-5px] shadow-blue-200 rounded-lg overflow-hidden w-[100%] max-w-[1260px]'>
                    <video
                        muted
                        loop
                        autoPlay
                        className="shadow-[20px_20px_rgba(255,255,255)] aspect-video object-cover"
                    >
                        <source src={Banner} type="video/mp4" />
                    </video>
                </div>

                {/* 1. POPULAR CATEGORIES SECTION */}
                <div className='w-full max-w-[1260px] my-6 px-4 text-center'>
                    <h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight text-white'>
                        Popular <span className='text-[#a855f7]'>Categories</span>
                    </h2>
                    <p className='text-sm text-richblack-300 mt-2 font-medium'>
                        Explore top technologies and skills
                    </p>

                    {/* Categories Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6'>
                        {popularCategoriesList.map((cat, idx) => {
                            const IconComponent = cat.icon;
                            return (
                                <Link
                                    key={cat._id || idx}
                                    to={cat.link}
                                    className='bg-[#111422]/90 hover:bg-[#161a2e] border border-white/10 hover:border-[#a855f7]/50 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 shadow-lg group'
                                >
                                    <div className='w-12 h-12 rounded-2xl bg-[#a855f7]/15 flex items-center justify-center text-[#a855f7] text-xl group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'>
                                        <IconComponent />
                                    </div>
                                    <h3 className='text-sm font-bold text-white mt-4 line-clamp-1 group-hover:text-[#a855f7] transition-colors'>
                                        {cat.name}
                                    </h3>
                                    <p className='text-[11px] text-richblack-300 mt-2 line-clamp-2 leading-relaxed min-h-[32px]'>
                                        {cat.description}
                                    </p>
                                    <span className='text-xs font-semibold text-richblack-400 mt-4 bg-white/5 px-3 py-1 rounded-full border border-white/5'>
                                        {formatStatNumber(cat.courseCount)} Courses
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Browse All Categories Button */}
                    <div className='mt-6 flex justify-center'>
                        <button
                            onClick={() => setShowAllCatModal(true)}
                            className='flex items-center gap-2 bg-[#121624] hover:bg-[#1c2238] border border-[#a855f7]/40 hover:border-[#a855f7] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md group'
                        >
                            <span>View All Categories ({dbCategories.length || categoryDesignPresets.length})</span>
                            <span className='group-hover:translate-x-1 transition-transform'>→</span>
                        </button>
                    </div>
                </div>

                {/* ALL CATEGORIES MODAL */}
                {showAllCatModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-[#0e111f] border border-purple-500/30 max-w-4xl w-full rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-[0_0_40px_rgba(168,85,247,0.3)] max-h-[85vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h2 className="text-xl font-extrabold text-white">All Course Categories</h2>
                                    <p className="text-xs text-richblack-300 mt-0.5">Explore all tech domains and learning tracks</p>
                                </div>
                                <button
                                    onClick={() => setShowAllCatModal(false)}
                                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-richblack-300 hover:text-white flex items-center justify-center text-lg font-bold transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {(dbCategories.length > 0 ? dbCategories : categoryDesignPresets).map((cat, idx) => {
                                    const preset = categoryDesignPresets.find(p => p.name.toLowerCase() === (cat.name || '').toLowerCase()) || categoryDesignPresets[idx % categoryDesignPresets.length];
                                    const IconComponent = preset.icon;
                                    const categoryId = cat._id || cat.id;
                                    const categorySlug = (cat.name || preset.name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                                    const targetLink = categoryId ? `/courses?category=${categoryId}` : `/courses?category=${categorySlug}`;
                                    const count = cat.courseCount !== undefined ? cat.courseCount : (cat.courses?.length || 0);

                                    return (
                                        <Link
                                            key={categoryId || idx}
                                            to={targetLink}
                                            onClick={() => setShowAllCatModal(false)}
                                            className="bg-[#141728] hover:bg-[#1c213b] border border-purple-500/20 hover:border-purple-500/50 rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 shadow-md group"
                                        >
                                            <div className="w-11 h-11 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                                                <IconComponent />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 truncate transition-colors">
                                                    {cat.name || preset.name}
                                                </h3>
                                                <p className="text-[11px] text-richblack-400 truncate">
                                                    {cat.description || preset.description}
                                                </p>
                                                <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">
                                                    {formatStatNumber(count)} Courses
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. START LEARNING IN 3 SIMPLE STEPS SECTION */}
                <div className='w-full max-w-[1260px] my-6 px-4 text-center'>
                    <h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight text-white'>
                        Start Learning in <span className='text-[#a855f7]'>3 Simple Steps</span>
                    </h2>
                    <p className='text-sm text-richblack-300 mt-2 font-medium'>
                        Your journey to become a developer starts here
                    </p>

                    <div className='relative mt-6 max-w-4xl mx-auto'>
                        {/* Connected Dotted Line for desktop */}
                        <div className='hidden md:block absolute top-7 left-[15%] right-[15%] h-[2px] border-b-2 border-dashed border-[#a855f7]/40 z-0'></div>

                        {/* Steps Grid */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10'>
                            {threeStepsConfig.map((step) => {
                                const StepIcon = step.icon;
                                return (
                                    <div key={step.id} className='flex flex-col items-center text-center px-4'>
                                        <div className='w-14 h-14 rounded-full bg-[#0d0f1a] border-2 border-[#a855f7] flex items-center justify-center text-[#a855f7] text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-transform hover:scale-110'>
                                            <StepIcon />
                                        </div>
                                        <h3 className='text-base font-bold text-white mt-5'>
                                            {step.title}
                                        </h3>
                                        <p className='text-xs text-richblack-300 mt-2 leading-relaxed max-w-[240px]'>
                                            {step.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. EXISTING UNLOCK THE POWER OF CODE SECTION */}
                <div className='w-full my-6'>
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
                <div className='w-full my-6'>
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
            <div className='bg-richblack-900 text-richblack-5 my-6'>
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

                <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-6 py-6'>
                    <div className='flex flex-row gap-5 mb-6'>
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

                {/* FEATURED COURSES SECTION */}
                <div className='w-full max-w-[1260px] mx-auto py-6 px-4 text-center'>
                    <h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight text-white'>
                        Featured <span className='text-[#a855f7]'>Courses</span>
                    </h2>
                    <p className='text-sm text-richblack-300 mt-2 font-medium mb-6'>
                        Hand-picked top courses for you
                    </p>

                    {/* Course Cards Grid: Desktop (4 cols), Tablet (2 cols), Mobile (1 col) */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left'>
                        {featuredCourses.map((course, index) => {
                            const badge = featuredBadges[index % featuredBadges.length];
                            const price = course.price || 0;
                            const originalPrice = course.originalPrice || Math.round(price * 1.5) || 999;
                            const rating = course.rating || (4.7 + (index % 3) * 0.1).toFixed(1);
                            const reviewsCount = course.reviewsCount || `${(1.5 + index * 0.5).toFixed(1)}K`;
                            const instructorName = course.instructor
                                ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim()
                                : "Suraj Mishra";
                            const instructorImg = course.instructor?.image || "https://api.dicebear.com/5.x/initials/svg?seed=Suraj%20Mishra";

                            return (
                                <div
                                    key={course._id || course.id || index}
                                    onClick={() => window.location.href = `/courses/${course._id || course.id}`}
                                    className='bg-[#111422]/90 hover:bg-[#161a2e] border border-white/10 hover:border-[#a855f7]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-xl cursor-pointer group'
                                >
                                    <div>
                                        {/* Card Header Thumbnail / Gradient */}
                                        <div className='relative h-44 bg-gradient-to-br from-[#1a103c] to-[#0a0d18] flex items-center justify-center p-4 overflow-hidden'>
                                            {/* Badge */}
                                            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider z-10 text-white ${
                                                index % 4 === 0 ? 'bg-amber-500' :
                                                index % 4 === 1 ? 'bg-purple-600' :
                                                index % 4 === 2 ? 'bg-emerald-500' : 'bg-blue-600'
                                            }`}>
                                                {badge}
                                            </span>

                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.courseName}
                                                    className='w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105'
                                                />
                                            ) : (
                                                <div className='w-16 h-16 rounded-2xl bg-[#a855f7]/20 flex items-center justify-center text-[#a855f7] text-3xl shadow-inner'>
                                                    <FaCode />
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Content */}
                                        <div className='p-5'>
                                            <h3 className='text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-[#a855f7] transition-colors min-h-[44px]'>
                                                {course.courseName}
                                            </h3>

                                            {/* Instructor */}
                                            <div className='flex items-center gap-2.5 mt-4'>
                                                <img
                                                    src={instructorImg}
                                                    alt={instructorName}
                                                    className='w-6 h-6 rounded-full object-cover border border-white/20'
                                                />
                                                <span className='text-xs text-richblack-300 font-medium truncate'>
                                                    {instructorName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer: Rating & Pricing */}
                                    <div className='px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between mt-auto'>
                                        <div className='flex items-center gap-1.5 text-amber-400 text-xs font-bold'>
                                            <FaStar />
                                            <span>{rating}</span>
                                            <span className='text-richblack-400 font-normal text-[11px]'>({reviewsCount})</span>
                                        </div>
                                        <div className='flex items-baseline gap-1.5'>
                                            <span className='text-sm font-extrabold text-white'>₹{price}</span>
                                            {originalPrice > price && (
                                                <span className='text-[11px] text-richblack-400 line-through'>₹{originalPrice}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* View All Courses Button */}
                    <div className='mt-10 flex justify-center'>
                        <Link to='/courses'>
                            <button className='flex items-center gap-2 bg-[#121624] hover:bg-[#1c2238] border border-[#a855f7]/40 hover:border-[#a855f7] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all duration-300 shadow-md group'>
                                <span>View All Courses</span>
                                <span className='group-hover:translate-x-1 transition-transform'>→</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Section 3 */}
            <div className='w-11/12 mx-auto max-w-maxContent flex flex-col items-center justify-between gap-24 bg-richblack-900 text-white py-20'>
                <InstructorSlider />
                
                <div className='w-full border-t border-richblack-800 pt-20'>
                    <InstructorSection />
                </div>

                <div className='w-full flex flex-col items-center'>
                    <Reviewslider />
                </div>
            </div>

           
        </div>
    )
}

export default Home;
