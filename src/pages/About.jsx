import React, { useState, useEffect } from 'react';
import { getHomePageStats } from '../services/operations/courseDetailsAPI';
import Reviewslider from '../components/Common/Reviewslider.jsx';
import bannerImage1 from "../assests/Images/aboutus1.webp";
import bannerImage2 from "../assests/Images/aboutus2.webp";
import bannerImage3 from "../assests/Images/aboutus3.webp";
import FoundingStory from "../assests/Images/FoundingStory.png";
import { FaGraduationCap, FaChalkboardTeacher, FaBookOpen, FaAward, FaStar, FaUsers, FaRocket, FaGlobe, FaHeart } from 'react-icons/fa';

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

const About = () => {
  const [stats, setStats] = useState({
    learnersCount: null,
    coursesCount: null,
    projectsCount: null,
    certificationsCount: null
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      const statsData = await getHomePageStats();
      if (isMounted && statsData) {
        setStats({
          learnersCount: statsData.learnersCount,
          coursesCount: statsData.coursesCount,
          projectsCount: statsData.projectsCount,
          certificationsCount: statsData.certificationsCount
        });
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const activeStudents = formatStatNumber(stats.learnersCount, "5K+");
  const publishedCourses = formatStatNumber(stats.coursesCount, "200+");

  return (
    <div className="w-full bg-[#070913] text-richblack-100 font-sans min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1260px] mx-auto space-y-20">

        {/* 1. HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold w-fit">
              <span>★</span>
              <span>About CodeLearn</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Driving Innovation in Online Education for a{" "}
              <span className="text-[#a855f7] block sm:inline">Brighter Future</span>
            </h1>

            <p className="text-sm sm:text-base text-richblack-300 leading-relaxed max-w-xl font-normal">
              At CodeLearn, we believe learning should be accessible, engaging, and future-ready. Our mission is to empower learners worldwide with the skills they need to build better careers and create a better world.
            </p>
          </div>

          {/* Right Column Image Grid & Floating Badge */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-4">
            {/* Background Dot Matrix Accent Patterns */}
            <div className="absolute -left-3 top-16 w-16 h-32 bg-[radial-gradient(#a855f7_2px,transparent_2px)] [background-size:10px_10px] opacity-60 pointer-events-none"></div>
            <div className="absolute -right-3 bottom-8 w-24 h-24 bg-[radial-gradient(#a855f7_2px,transparent_2px)] [background-size:10px_10px] opacity-60 pointer-events-none"></div>

            <div className="relative w-full max-w-[480px] h-[400px] sm:h-[440px]">
              
              {/* 1. TOP MAIN IMAGE CONTAINER WITH VIBRANT PURPLE GLOW SHADOW */}
              <div className="absolute top-0 left-0 w-[72%] h-[240px] sm:h-[270px] rounded-[24px] overflow-hidden border-2 border-[#b870ff] shadow-[0_0_40px_rgba(168,85,247,0.7),0_0_15px_rgba(168,85,247,0.9)] z-10">
                <img src={bannerImage1} alt="Learner studying" className="w-full h-full object-cover" />
              </div>

              {/* 2. FLOATING BADGE (50K+ Happy Learners) ON TOP-RIGHT WITH DROP SHADOW */}
              <div className="absolute top-[35px] right-0 z-30 bg-[#121124]/95 backdrop-blur-xl border border-purple-500/30 px-5 py-3.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(168,85,247,0.35)] flex items-center gap-4 min-w-[200px]">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-400 text-xl shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  <FaUsers />
                </div>
                <div className="text-left">
                  <div className="text-lg font-black text-white leading-none">{activeStudents}</div>
                  <div className="text-xs text-richblack-300 font-medium leading-tight mt-1">Happy Learners</div>
                </div>
              </div>

              {/* 3. BOTTOM-LEFT IMAGE (Developer at dual screens) WITH SUBTLE PURPLE SHADOW */}
              <div className="absolute bottom-0 left-0 w-[48%] h-[150px] sm:h-[165px] rounded-[20px] overflow-hidden border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.35)] z-20">
                <img src={bannerImage2} alt="Code editor" className="w-full h-full object-cover" />
              </div>

              {/* 4. BOTTOM-RIGHT OVERLAPPING IMAGE WITH STRONG VIBRANT PURPLE GLOW SHADOW */}
              <div className="absolute bottom-0 right-0 w-[58%] h-[210px] sm:h-[235px] rounded-[24px] overflow-hidden border-2 border-[#b870ff] shadow-[0_0_40px_rgba(168,85,247,0.75),0_0_15px_rgba(168,85,247,0.9)] z-25">
                <img src={bannerImage3} alt="Student learning" className="w-full h-full object-cover" />
              </div>

            </div>
          </div>
        </section>

        {/* 2. STATS BAR */}
        <section className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          {/* Stat 1 */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:border-r border-white/10 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">{activeStudents}</div>
              <div className="text-xs text-richblack-300 font-medium">Active Students</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:border-r border-white/10 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl shrink-0">
              <FaChalkboardTeacher />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">10+</div>
              <div className="text-xs text-richblack-300 font-medium">Expert Instructors</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:border-r border-white/10 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl shrink-0">
              <FaBookOpen />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">{publishedCourses}</div>
              <div className="text-xs text-richblack-300 font-medium">Courses</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl shrink-0">
              <FaAward />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">50+</div>
              <div className="text-xs text-richblack-300 font-medium">Awards</div>
            </div>
          </div>
        </section>

        {/* 3. OUR FOUNDING STORY */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl group">
              <img src={FoundingStory} alt="Our Founding Story" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-transparent opacity-40"></div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5 text-left">
            <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Our Founding Story
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-richblack-300 leading-relaxed font-normal">
              <p>
                CodeLearn was born out of a shared vision and passion for transforming education. We recognized the gap between traditional learning and the real-world skills needed in today’s tech-driven world.
              </p>
              <p>
                A group of educators, developers, and industry professionals came together to create a platform that delivers high-quality, practical, and affordable learning to everyone, everywhere.
              </p>
              <p>
                From humble beginnings, we’ve grown into a trusted learning community empowering thousands of learners to achieve their dreams.
              </p>
            </div>
          </div>
        </section>

        {/* 4. OUR VISION & OUR MISSION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Our Vision Card */}
          <div className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-8 text-left space-y-4 shadow-xl hover:border-purple-500/40 transition-all">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-2xl border border-purple-500/30">
              <FaGlobe />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-purple-400 uppercase block">Our Vision</span>
            <h3 className="text-2xl font-bold text-white tracking-tight">Learn Without Limits</h3>
            <p className="text-xs sm:text-sm text-richblack-300 leading-relaxed font-normal">
              Our vision is to create a world where anyone, anywhere can access quality education and build the skills to transform their lives. We aim to be the most trusted global platform for learners to grow, innovate, and lead.
            </p>
          </div>

          {/* Our Mission Card */}
          <div className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-8 text-left space-y-4 shadow-xl hover:border-purple-500/40 transition-all">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-2xl border border-purple-500/30">
              <FaRocket />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-purple-400 uppercase block">Our Mission</span>
            <h3 className="text-2xl font-bold text-white tracking-tight">Empower. Educate. Elevate.</h3>
            <p className="text-xs sm:text-sm text-richblack-300 leading-relaxed font-normal">
              Our mission is to empower learners with industry-relevant skills through expertly designed courses, hands-on projects, and a supportive community — helping them achieve more in their personal and professional journeys.
            </p>
          </div>
        </section>

        {/* 5. CORE VALUES & LEARNING APPROACH */}
        <section className="space-y-12 text-center">
          <div>
            <span className="text-xs font-bold tracking-widest text-purple-400 uppercase block">What Makes Us Different</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Our <span className="text-[#a855f7]">Core Values</span> & Learning Approach
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {/* Card 1 */}
            <div className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:-translate-y-1.5 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg shadow-md">
                <FaStar />
              </div>
              <h4 className="text-base font-bold text-white">Quality First</h4>
              <p className="text-xs text-richblack-300 leading-relaxed font-normal">
                We ensure every course meets high standards and delivers real value.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:-translate-y-1.5 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg shadow-md">
                <FaUsers />
              </div>
              <h4 className="text-base font-bold text-white">Learner Centric</h4>
              <p className="text-xs text-richblack-300 leading-relaxed font-normal">
                Our learners are at the heart of everything we build and do.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:-translate-y-1.5 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg shadow-md">
                <FaRocket />
              </div>
              <h4 className="text-base font-bold text-white">Practical Learning</h4>
              <p className="text-xs text-richblack-300 leading-relaxed font-normal">
                Learn by building real projects and solving real-world problems.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:-translate-y-1.5 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg shadow-md">
                <FaGlobe />
              </div>
              <h4 className="text-base font-bold text-white">Accessible for All</h4>
              <p className="text-xs text-richblack-300 leading-relaxed font-normal">
                We make quality education affordable and accessible to everyone.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-[#0e1222]/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 hover:-translate-y-1.5 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg shadow-md">
                <FaHeart />
              </div>
              <h4 className="text-base font-bold text-white">Community Driven</h4>
              <p className="text-xs text-richblack-300 leading-relaxed font-normal">
                We grow together through collaboration, support, and shared success.
              </p>
            </div>
          </div>
        </section>

        {/* 6. LEARNER REVIEWS SLIDER */}
        <section className="pt-6">
          <Reviewslider />
        </section>

      </div>
    </div>
  );
};

export default About;