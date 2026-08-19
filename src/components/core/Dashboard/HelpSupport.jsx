import React, { useState } from "react";
import { VscQuestion, VscChevronDown, VscAdd } from "react-icons/vsc";
import { AiOutlineCheckCircle } from "react-icons/ai";

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState("faqs");
  const [openFaq, setOpenFaq] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const faqs = [
    {
      id: 1,
      q: "I purchased a course but it's not showing on my dashboard / shows 'Course not found'. What do I do?",
      a: "Please refresh your browser or log out and log back in. If your order status is confirmed, your course should immediately appear under your Enrolled Courses section."
    },
    {
      id: 2,
      q: "My payment was successful but the course isn't assigned. Help?",
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

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    const newTicket = {
      id: Date.now(),
      subject: ticketSubject,
      message: ticketMsg,
      status: "Open",
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
  };

  return (
    <div className="text-white space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5 flex items-center gap-2">
            Help & Support
          </h1>
          <p className="text-xs text-richblack-300 mt-1">
            Find answers to your questions and get the help you need to make the most of your StudyTech experience.
          </p>
        </div>

        <button
          onClick={() => setShowTicketModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
        >
          <VscAdd className="text-base" /> Create a New Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#252C3A] text-xs font-semibold gap-4">
        <button
          onClick={() => setActiveTab("faqs")}
          className={`pb-3 px-2 border-b-2 transition-colors ${
            activeTab === "faqs"
              ? "border-indigo-500 text-white font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-3 px-2 border-b-2 transition-colors ${
            activeTab === "tickets"
              ? "border-indigo-500 text-white font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          My Tickets ({tickets.length})
        </button>
      </div>

      {/* FAQs Section */}
      {activeTab === "faqs" && (
        <div className="space-y-3">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">If you can't find an answer in our FAQs, feel free to create a new support ticket.</p>
          </div>

          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-[#12161F] border border-[#252C3A] rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full text-left p-4 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white"
              >
                <span>{faq.q}</span>
                <VscChevronDown
                  className={`text-base transition-transform duration-200 text-slate-400 ${
                    openFaq === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === faq.id && (
                <div className="px-4 pb-4 text-xs text-slate-400 border-t border-[#1C2230] pt-3 bg-[#0E121A] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tickets Section */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Support Tickets</h2>
            <p className="text-xs text-slate-400">Track your submitted issues and support requests.</p>
          </div>

          {tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-[#12161F] border border-[#252C3A] p-4 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{ticket.subject}</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{ticket.message}</p>
                  <span className="text-[10px] text-slate-500 block">Submitted on {ticket.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <VscQuestion className="text-4xl mx-auto text-slate-600" />
              <p className="text-sm font-bold text-white">No Support Tickets Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Have a question or issue? Click the button above to open a ticket with our support team.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#252C3A] max-w-md w-full rounded-2xl p-6 text-white space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#252C3A] pb-3">
              <h2 className="font-bold text-base text-white">Create Support Ticket</h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <AiOutlineCheckCircle className="text-4xl text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Ticket Submitted Successfully!</h3>
                <p className="text-xs text-slate-400">Our support team will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Subject / Issue Title</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Payment successful but course not assigned"
                    className="w-full bg-[#1A202C] border border-[#2D3748] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    placeholder="Provide details about your query or transaction ID..."
                    className="w-full bg-[#1A202C] border border-[#2D3748] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 bg-[#1C2230] hover:bg-[#252C3A] text-slate-300 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
