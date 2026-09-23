import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HighLightText from "./HighLightText";
import { FiBookOpen, FiArrowRight, FiCompass } from 'react-icons/fi';

export const HomePageExplore = [
  {
    tag: 'Free',
    courses: [
      {
        heading: "Learn HTML5",
        description: "Master the structure of modern web pages including semantic markup, forms, media integration, and accessibility best practices.",
        level: 'Beginner',
        lessionNumber: 6,
        tag: 'Popular'
      },
      {
        heading: "Modern CSS3",
        description: "Style responsive web interfaces with Flexbox, CSS Grid, custom properties, animations, and modern layout techniques.",
        level: 'Beginner',
        lessionNumber: 8,
        tag: 'Foundational'
      },
      {
        heading: "Responsive Web Design",
        description: "Build adaptive websites that look stunning on smartphones, tablets, laptops, and ultra-wide desktop monitors.",
        level: 'Beginner',
        lessionNumber: 6,
        tag: 'Essential'
      },
    ]
  },
  {
    tag: 'New to coding',
    courses: [
      {
        heading: "JavaScript Essentials",
        description: "Learn the core fundamentals of JavaScript: variables, functions, DOM manipulation, asynchronous events, and modern ES6+.",
        level: 'Beginner',
        lessionNumber: 10,
        tag: 'Core'
      },
      {
        heading: "Python for Beginners",
        description: "Master Python programming syntax, data structures, algorithms, and automated scripting with hands-on exercises.",
        level: 'Beginner',
        lessionNumber: 12,
        tag: 'High Demand'
      },
      {
        heading: "C++ Fundamentals",
        description: "Dive deep into systems programming, memory management, pointers, and object-oriented programming concepts.",
        level: 'Beginner',
        lessionNumber: 14,
        tag: 'Systems'
      },
    ]
  },
  {
    tag: 'Most popular',
    courses: [
      {
        heading: "Full-Stack React & Node",
        description: "Build scalable, end-to-end full-stack web applications with React 19, Node.js, Express, MongoDB, and RESTful APIs.",
        level: 'Intermediate',
        lessionNumber: 24,
        tag: 'Bestseller'
      },
      {
        heading: "Next.js 15 Fullstack",
        description: "Master server components, App Router, static generation, serverless APIs, and Vercel edge deployment.",
        level: 'Intermediate',
        lessionNumber: 18,
        tag: 'Trending'
      },
      {
        heading: "Enterprise Java Mastery",
        description: "Develop enterprise-grade cloud backends using Java, Spring Boot, microservices architecture, and SQL database design.",
        level: 'Intermediate',
        lessionNumber: 20,
        tag: 'Enterprise'
      },
    ]
  },
  {
    tag: 'Skills paths',
    courses: [
      {
        heading: "FastAPI Microservices",
        description: "Architect lightning-fast asynchronous REST and GraphQL APIs with Python type hints, Pydantic, and Docker.",
        level: 'Intermediate',
        lessionNumber: 12,
        tag: 'Modern Backend'
      },
      {
        heading: "Django Web Development",
        description: "Build robust data-driven web applications with Django's built-in authentication, ORM, and admin dashboard.",
        level: 'Intermediate',
        lessionNumber: 16,
        tag: 'Rapid Dev'
      },
      {
        heading: "Docker & Cloud Deploy",
        description: "Containerize applications, orchestrate multi-container services, and configure automated CI/CD deployment pipelines.",
        level: 'Advanced',
        lessionNumber: 14,
        tag: 'DevOps'
      },
    ]
  },
  {
    tag: 'Career paths',
    courses: [
      {
        heading: "Frontend Engineer Career Path",
        description: "Complete roadmap from HTML/CSS to advanced TypeScript, React, state management, testing, and performance optimization.",
        level: 'All Levels',
        lessionNumber: 42,
        tag: 'Job Ready'
      },
      {
        heading: "AI & Machine Learning Engineer",
        description: "From data wrangling with Pandas and NumPy to neural networks, LLMs, fine-tuning, and production model deployment.",
        level: 'Advanced',
        lessionNumber: 38,
        tag: 'Future Proof'
      },
      {
        heading: "Cloud Architect Career Path",
        description: "Master AWS & Azure cloud infrastructure, high availability, serverless computing, and security compliance.",
        level: 'Advanced',
        lessionNumber: 36,
        tag: 'High Salary'
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
  const [selectedCard, setSelectedCard] = useState(HomePageExplore[0].courses[0].heading);

  const setMyCards = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.find((course) => course.tag === value);
    if (result) {
      setCourses(result.courses);
      setSelectedCard(result.courses[0]?.heading || "");
    }
  };

  const handleCardClick = (heading) => {
    setSelectedCard(heading);
    navigate(`/courses?search=${encodeURIComponent(heading)}`);
  };

  return (
    <section className="w-full max-w-maxContent mx-auto px-4 text-center py-[15px]">
      
      {/* Header */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#7FE7D6]/10 text-[#7FE7D6] text-xs font-semibold px-3.5 py-1 rounded-full border border-[#7FE7D6]/30 shadow-2xs">
          <FiCompass className="text-xs text-[#7FE7D6]" />
          <span>Curated Pathways</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          Unlock the <HighLightText text="Power of Code" />
        </h2>
        <p className="text-base text-gray-600 font-normal leading-relaxed">
          Learn to build anything you can imagine with structured lessons, hands-on challenges, and real-time guidance.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200">
          {tabsName.map((element, index) => (
            <button
              key={index}
              onClick={() => setMyCards(element)}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                currentTab === element
                  ? "bg-white text-blue-600 shadow-xs border border-gray-200/80"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {element}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 text-left">
        {courses.map((element, index) => {
          const isSelected = selectedCard === element.heading;
          return (
            <div
              key={index}
              onClick={() => handleCardClick(element.heading)}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-white border-2 border-blue-500 shadow-lg -translate-y-1"
                  : "bg-white border border-gray-200 shadow-2xs hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5"
              }`}
            >
              <div>
                {/* Card Tag Pill */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    element.level === 'Beginner' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : element.level === 'Intermediate'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                  }`}>
                    {element.level}
                  </span>
                  {element.tag && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {element.tag}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {element.heading}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {element.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <FiBookOpen className="text-blue-600" />
                  <span>{element.lessionNumber} Lessons</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <FiArrowRight />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default ExploreMore;
