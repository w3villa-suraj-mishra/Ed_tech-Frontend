import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  VscAdd,
  VscSearch,
  VscChevronDown,
  VscMail,
  VscCommentDiscussion,
  VscCallIncoming,
  VscOrganization,
  VscFileCode,
  VscArrowRight,
  VscQuestion
} from "react-icons/vsc";
import { FiClock } from "react-icons/fi";
import { AiOutlineCheckCircle, AiOutlineTrophy } from "react-icons/ai";

import { apiConnector } from "../../../services/apiConnector";
import { contactusEndpoint } from "../../../services/apis";
import toast from "react-hot-toast";

const HelpSupport = () => {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("faqs");
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Dynamic FAQ list
  const defaultFaqs = [
    {
      id: 1,
      q: "I purchased a course but it's not showing on my dashboard / in my 'Course not found'. What do I do?",
      a: "Please refresh your browser or log out and log back in. If your order status is confirmed, your course should immediately appear under your Enrolled Courses section."
    },
    {
      id: 2,
      q: "My payment was successful but the course isn't activated. Help!",
      a: "If the payment went through but your status shows pending, our payment gateway webhook may take up to 5 minutes. If it persists, create a ticket below with your Transaction ID."
    },
    {
      id: 3,
      q: "How does course validity / access work now?",
      a: "All purchased courses on StudyTech come with lifetime access including all future lecture updates and downloadable study resources."
    },
    {
      id: 4,
      q: "I'm not able to log in / OTP is not coming.",
      a: "Check your spam/junk folder. Ensure you entered the correct email address associated with your registered StudyTech account."
    },
    {
      id: 5,
      q: "Can I change the email address linked to my account?",
      a: "Yes, navigate to Settings in your profile dropdown menu to update your account email and personal information."
    }
  ];

  // Popular Help Articles
  const popularArticles = [
    { id: 1, title: "How to Enroll in a Course", desc: "Step-by-step guide to enroll" },
    { id: 2, title: "Understanding Course Access", desc: "Learn about validity & access" },
    { id: 3, title: "Payment & Refund Policy", desc: "All about payments and refunds" },
    { id: 4, title: "Certificates & Completion", desc: "How to earn and view certificates" }
  ];

  const filteredFaqs = defaultFaqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;

    try {
      setSubmitting(true);
      const payload = {
        firstname: user?.firstName || "Student",
        lastname: user?.lastName || "User",
        email: user?.email || "student@studytech.com",
        subject: ticketSubject,
        message: `[SUPPORT TICKET]: ${ticketSubject}\n\n${ticketMsg}`,
        phoneNo: user?.additionalDetails?.contactNumber || "",
      };

      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        payload
      );

      if (res?.data?.success) {
        toast.success("Support ticket submitted to admin! 🎉");
        const newTicket = {
          id: Date.now(),
          subject: ticketSubject,
          message: ticketMsg,
          status: "Pending",
          date: new Date().toLocaleDateString()
        };
        setTickets([newTicket, ...tickets]);
        setTicketSubject("");
        setTicketMsg("");
        setSubmittedSuccess(true);
        setTimeout(() => {
          setSubmittedSuccess(false);
          setShowTicketModal(false);
          setActiveTab("tickets");
        }, 1200);
      } else {
        toast.error(res?.data?.message || "Failed to submit ticket");
      }
    } catch (err) {
      console.error("Ticket submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit support ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto pb-10">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Help & Support</h1>
          <p className="text-xs sm:text-sm text-richblack-300">
            We're here to help you succeed. Find answers to your questions or reach out to our support team.
          </p>
        </div>

        {/* Headphones Graphic & Create Ticket Action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-purple-900/40 text-purple-300 border border-purple-500/30 items-center justify-center text-3xl shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            🎧
          </div>
          <button
            onClick={() => setShowTicketModal(true)}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
          >
            <VscAdd className="text-base" />
            <span>Create a New Ticket</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative">
        <VscSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-richblack-400 text-base" />
        <input
          type="text"
          placeholder="Search help articles, topics or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0e111f] border border-purple-500/20 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
        />
      </div>

      {/* 3. GET IN TOUCH (4 CARDS GRID) */}
      <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Get in Touch</h2>
          <p className="text-xs text-richblack-400">Choose the best way to reach us</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Email Support */}
          <div className="p-4 rounded-xl bg-[#141728] border border-white/5 hover:border-purple-500/30 transition-all flex items-start gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-purple-900/40 text-purple-400 flex items-center justify-center shrink-0">
              <VscMail className="text-lg" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Email Support</span>
                <VscArrowRight className="text-xs text-richblack-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <span className="text-[10px] text-richblack-400 mt-0.5">Get help via email</span>
              <span className="text-[10px] text-purple-300 font-medium truncate mt-1">support@studytech.com</span>
            </div>
          </div>

          {/* Live Chat */}
          <div className="p-4 rounded-xl bg-[#141728] border border-white/5 hover:border-purple-500/30 transition-all flex items-start gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-indigo-900/40 text-indigo-400 flex items-center justify-center shrink-0">
              <VscCommentDiscussion className="text-lg" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Live Chat</span>
                <VscArrowRight className="text-xs text-richblack-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
              <span className="text-[10px] text-richblack-400 mt-0.5">Chat with us live</span>
              <span className="text-[10px] text-indigo-300 font-medium truncate mt-1">Available 9AM - 9PM</span>
            </div>
          </div>

          {/* Phone Support */}
          <div className="p-4 rounded-xl bg-[#141728] border border-white/5 hover:border-purple-500/30 transition-all flex items-start gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0">
              <VscCallIncoming className="text-lg" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Phone Support</span>
                <VscArrowRight className="text-xs text-richblack-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <span className="text-[10px] text-richblack-400 mt-0.5">Speak to our team</span>
              <span className="text-[10px] text-emerald-300 font-medium truncate mt-1">+91 12345 67890</span>
            </div>
          </div>

          {/* Community */}
          <div className="p-4 rounded-xl bg-[#141728] border border-white/5 hover:border-purple-500/30 transition-all flex items-start gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center shrink-0">
              <VscOrganization className="text-lg" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Community</span>
                <VscArrowRight className="text-xs text-richblack-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <span className="text-[10px] text-richblack-400 mt-0.5">Ask & get help</span>
              <span className="text-[10px] text-amber-300 font-medium truncate mt-1">Join Community ↗</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. MAIN HELP & SUPPORT GRID (FAQs/Tickets + Right-Side Articles/Hours) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: FAQs & TICKETS TABS */}
        <div className="lg:col-span-2 bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-4">Frequently Asked Questions</h2>

            {/* Sub-Tabs: FAQs vs My Tickets */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-2 mb-4">
              <button
                onClick={() => setActiveTab("faqs")}
                className={`text-xs font-bold transition-all relative pb-2 ${
                  activeTab === "faqs" ? "text-purple-400" : "text-richblack-400 hover:text-white"
                }`}
              >
                FAQs
                {activeTab === "faqs" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("tickets")}
                className={`text-xs font-bold transition-all relative pb-2 ${
                  activeTab === "tickets" ? "text-purple-400" : "text-richblack-400 hover:text-white"
                }`}
              >
                My Tickets ({tickets.length})
                {activeTab === "tickets" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
                )}
              </button>
            </div>

            {/* TAB CONTENT: FAQs */}
            {activeTab === "faqs" && (
              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-[#141728] border border-white/5 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs font-semibold text-richblack-200 hover:text-white"
                      >
                        <span>{faq.q}</span>
                        <VscChevronDown
                          className={`text-base transition-transform duration-200 text-purple-400 shrink-0 ${
                            openFaq === faq.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openFaq === faq.id && (
                        <div className="px-4 pb-4 text-xs text-richblack-300 border-t border-white/5 pt-3 bg-[#070913]/60 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-richblack-400">
                    No FAQs found matching "{searchQuery}".
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MY TICKETS */}
            {activeTab === "tickets" && (
              <div className="space-y-3">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-[#141728] border border-white/5 p-4 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white">{ticket.subject}</h3>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-richblack-300">{ticket.message}</p>
                      <span className="text-[10px] text-richblack-400 block">Submitted on {ticket.date}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-richblack-400 space-y-2">
                    <VscQuestion className="text-3xl mx-auto text-purple-400/50" />
                    <p className="text-xs font-bold text-white">No Support Tickets Found</p>
                    <p className="text-[11px] text-richblack-400">
                      You haven't submitted any support tickets yet. Click above to create one.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STILL NEED HELP BANNER */}
          <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-sm shrink-0">
                ❓
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Still need help?</span>
                <span className="text-[10px] text-richblack-300">Can't find the answer you're looking for? Contact our support team.</span>
              </div>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all shrink-0 self-end sm:self-auto shadow-[0_0_12px_rgba(168,85,247,0.3)]"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: POPULAR ARTICLES & SUPPORT HOURS */}
        <div className="space-y-6">
          
          {/* Popular Help Articles Card */}
          <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white">Popular Help Articles</h2>
              <button
                onClick={() => navigate("/dashboard/articles")}
                className="text-[11px] text-purple-400 font-semibold hover:text-purple-300 transition-colors cursor-pointer"
              >
                View All ↗
              </button>
            </div>

            <div className="space-y-3">
              {popularArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="p-3 rounded-xl bg-[#141728] border border-white/5 hover:border-purple-500/40 hover:bg-purple-900/10 transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <VscFileCode className="text-base" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {article.title}
                    </span>
                    <span className="text-[10px] text-richblack-400 truncate">
                      {article.desc}
                    </span>
                  </div>
                  <VscArrowRight className="text-xs text-richblack-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Support Hours Card */}
          <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">Support Hours</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center shrink-0">
                  <FiClock className="text-sm" />
                </div>
                <div>
                  <span className="text-richblack-400 text-[10px] block">Monday - Sunday</span>
                  <span className="font-bold text-white">9:00 AM - 9:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-900/30 text-indigo-400 flex items-center justify-center shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-richblack-400 text-[10px] block">Average Response Time</span>
                  <span className="font-bold text-white">Under 2 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <AiOutlineCheckCircle className="text-sm" />
                </div>
                <div>
                  <span className="text-richblack-400 text-[10px] block">Resolution Rate</span>
                  <span className="font-bold text-white">98% of tickets resolved</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* CREATE TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111f] border border-purple-500/30 max-w-md w-full rounded-2xl p-6 text-white space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-bold text-base text-white">Create Support Ticket</h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-richblack-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <AiOutlineCheckCircle className="text-4xl text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Ticket Submitted Successfully!</h3>
                <p className="text-xs text-richblack-300">Our support team will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-richblack-300 font-semibold">Subject / Issue Title</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Payment successful but course not assigned"
                    className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-richblack-300 font-semibold">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    placeholder="Provide details about your query or transaction ID..."
                    className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-3.5 py-2.5 text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 bg-[#141728] hover:bg-white/5 text-richblack-300 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  >
                    {submitting ? "Submitting..." : "Submit Ticket"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ARTICLE DETAILS MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111f] border border-purple-500/30 max-w-lg w-full rounded-2xl p-6 text-white space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-bold text-base text-white">{selectedArticle.title}</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-richblack-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-richblack-300">
              <p className="font-semibold text-purple-300">{selectedArticle.desc}</p>
              <p>
                Welcome to the official StudyTech guide for <strong>{selectedArticle.title}</strong>. This article covers step-by-step instructions on accessing your account, tracking your course progress, and resolving common payment or enrollment questions.
              </p>
              <div className="p-3 bg-[#141728] rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-white block">Key Tips:</span>
                <ul className="list-disc list-inside space-y-0.5 text-richblack-400">
                  <li>Ensure you are logged into your registered email account.</li>
                  <li>Check your Enrolled Courses tab on your dashboard.</li>
                  <li>Contact support if you need further assistance.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HelpSupport;
