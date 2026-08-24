import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ContactDetails from "../components/ContactPage/ContactDetails";
import ContactForm from "../components/ContactPage/ContactForm";
import { getHomePageStats } from "../services/operations/courseDetailsAPI";
import { FaBookOpen, FaUserCog, FaTools, FaQuestionCircle, FaArrowRight, FaUsers, FaEnvelope, FaCommentAlt, FaTimes } from "react-icons/fa";

const faqCategories = [
  {
    id: "courses",
    icon: <FaBookOpen />,
    title: "Courses & Enrollments",
    desc: "Have questions about courses, enrollments or payments?",
    questions: [
      {
        q: "How do I enroll in a course?",
        a: "Browse the courses catalog, select your desired course, click 'Buy Now' or 'Enroll', and complete the checkout process."
      },
      {
        q: "Are the courses self-paced or live?",
        a: "Our platform offers self-paced video lectures along with scheduled live interactive Q&A sessions and projects."
      },
      {
        q: "Will I get a course completion certificate?",
        a: "Yes! Once you complete 100% of all lectures and required assignments in a course, a verified certificate is generated."
      }
    ]
  },
  {
    id: "account",
    icon: <FaUserCog />,
    title: "Account & Settings",
    desc: "Need help with your account or subscription?",
    questions: [
      {
        q: "How do I reset my account password?",
        a: "Click on 'Login' -> 'Forgot Password', enter your registered email address, and follow the link sent to your inbox."
      },
      {
        q: "Can I update my profile picture and details?",
        a: "Yes, navigate to your Student Dashboard -> Settings section to update your display picture, bio, and personal info."
      },
      {
        q: "Is my personal and payment data secure?",
        a: "Absolutely. We use industry-standard SSL encryption and secure payment gateways to safeguard your information."
      }
    ]
  },
  {
    id: "technical",
    icon: <FaTools />,
    title: "Technical Support",
    desc: "Facing technical issues? We're here to help.",
    questions: [
      {
        q: "What should I do if a video fails to play?",
        a: "Try refreshing your browser, clearing your browser cache, or checking your internet connection. If the issue persists, contact us."
      },
      {
        q: "Which browsers are supported?",
        a: "Study_Tech works smoothly on modern versions of Chrome, Firefox, Safari, Edge, and mobile browsers."
      },
      {
        q: "How can I report a technical bug?",
        a: "Fill out the contact form above with subject 'Technical Support' or reach out via support@codelearn.com."
      }
    ]
  },
  {
    id: "general",
    icon: <FaQuestionCircle />,
    title: "General Queries",
    desc: "Any other questions? Let us know.",
    questions: [
      {
        q: "Can I access courses on mobile devices?",
        a: "Yes! Our web application is fully responsive and optimized for mobile, tablet, and desktop screens."
      },
      {
        q: "How can I become an instructor on Study_Tech?",
        a: "Create an instructor account through the Signup page or reach out to our team to submit your instructor application."
      },
      {
        q: "Who do I contact for partnership or business inquiries?",
        a: "Please send an email directly to support@codelearn.com with your proposal and business details."
      }
    ]
  },
];

const Contact = () => {
  const [learnersCount, setLearnersCount] = useState("50K+");
  const [activeModalCategory, setActiveModalCategory] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const statsData = await getHomePageStats();
      if (statsData?.learnersCount) {
        const n = Number(statsData.learnersCount);
        if (n >= 1000) {
          setLearnersCount(`${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+`);
        } else {
          setLearnersCount(`${n}+`);
        }
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full bg-[#070913] text-richblack-100 font-sans min-h-screen">
      
      {/* 1. HERO HEADER */}
      <section className="relative py-16 px-4 text-center max-w-[1260px] mx-auto">
        {/* Floating Icons Background Graphics */}
        <div className="absolute top-10 left-10 lg:left-20 w-12 h-12 rounded-2xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl hidden sm:flex shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-pulse">
          <FaCommentAlt />
        </div>
        <div className="absolute top-10 right-10 lg:right-20 w-12 h-12 rounded-2xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl hidden sm:flex shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-pulse">
          <FaEnvelope />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold mb-4">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
          <span>Get in Touch</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          We're Here to Help You <br className="hidden sm:inline" />
          on Your <span className="text-[#a855f7]">Learning Journey</span>
        </h1>

        <p className="text-xs sm:text-sm text-richblack-300 max-w-xl mx-auto mt-3 font-normal leading-relaxed">
          Have a question, suggestion, or need support? Our team is always ready to assist you. Reach out to us anytime!
        </p>
      </section>

      {/* 2. CONTACT CONTENT SECTION */}
      <section className="max-w-[1260px] mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Other Ways to Reach Us */}
          <div className="lg:col-span-4">
            <ContactDetails />
          </div>

          {/* Right Column: Got an Idea? Let's Build It Together Form */}
          <div className="lg:col-span-8">
            <ContactForm />
          </div>

        </div>
      </section>

      {/* 3. FREQUENTLY ASKED QUESTIONS SECTION */}
      <section className="max-w-[1260px] mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-8">
          Frequently Asked <span className="text-[#a855f7]">Questions</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {faqCategories.map((faq) => (
            <div
              key={faq.id}
              onClick={() => setActiveModalCategory(faq)}
              className="bg-[#0e111f]/90 border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg group-hover:scale-105 transition-transform">
                  {faq.icon}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {faq.title}
                </h3>
                <p className="text-xs text-richblack-400 leading-relaxed">
                  {faq.desc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mt-4 group-hover:text-purple-300 transition-colors">
                <span>View FAQ</span>
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. JOIN COMMUNITY BANNER */}
      <section className="max-w-[1260px] mx-auto px-4 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0e111f] via-[#16142e] to-[#0e111f] border border-purple-500/30 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl text-left">
          {/* Ambient Glow */}
          <div className="absolute -left-20 top-0 w-60 h-60 bg-purple-600 opacity-20 blur-3xl pointer-events-none"></div>

          <div className="flex items-start sm:items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 text-2xl shrink-0 shadow-lg">
              <FaUsers />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Join a Community of <span className="text-[#a855f7]">{learnersCount} Learners</span>
              </h3>
              <p className="text-xs sm:text-sm text-richblack-300 mt-1 font-normal">
                Learn, build, and grow together with Study_Tech.
              </p>

              <div className="mt-5">
                <Link to="/courses">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-purple-900/40">
                    <span>Explore Courses</span>
                    <FaArrowRight className="text-xs" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Graphic Avatar illustration placeholder */}
          <div className="hidden lg:flex items-center gap-4 relative z-10 opacity-90">
            <div className="w-24 h-24 rounded-2xl bg-purple-900/40 border border-purple-500/30 p-2 flex items-center justify-center">
              <span className="text-4xl">👨‍💻</span>
            </div>
            <div className="w-24 h-24 rounded-2xl bg-purple-900/40 border border-purple-500/30 p-2 flex items-center justify-center">
              <span className="text-4xl">👩‍💻</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ POPUP MODAL */}
      {activeModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0e111f] border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-[0_0_50px_rgba(168,85,247,0.3)] text-left animate-in fade-in zoom-in duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModalCategory(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-richblack-800 hover:bg-purple-900/50 border border-white/10 flex items-center justify-center text-richblack-300 hover:text-white transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 text-lg">
                {activeModalCategory.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {activeModalCategory.title}
                </h3>
                <p className="text-xs text-richblack-400 font-normal">
                  Frequently Asked Questions & Answers
                </p>
              </div>
            </div>

            {/* Questions & Answers List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {activeModalCategory.questions.map((item, idx) => (
                <div key={idx} className="bg-[#141728] border border-white/10 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-purple-300 flex items-start gap-2">
                    <span className="text-purple-400 font-black">Q.</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-xs text-richblack-300 leading-relaxed font-normal pl-4 border-l-2 border-purple-500/40">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Close CTA */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveModalCategory(null)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                Close FAQ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Contact;
