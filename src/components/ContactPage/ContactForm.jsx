import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0e111f]/95 p-6 sm:p-10 shadow-[0_0_35px_rgba(168,85,247,0.2)] backdrop-blur-xl transition-all text-left">
      
      {/* Soft Corner Glow Effects */}
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-purple-600 opacity-25 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-600 opacity-20 blur-3xl pointer-events-none"></div>

      {/* Header & Subtitle */}
      <div className="relative z-10 flex flex-col gap-2 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Got an idea? <span className="text-[#a855f7]">Let's Build It Together</span>
        </h2>
        <p className="text-xs sm:text-sm text-richblack-300 font-normal">
          Tell us more about your query. We'll get back to you as soon as possible.
        </p>
      </div>

      {/* Form Container */}
      <div className="relative z-10">
        <ContactUsForm />
      </div>

    </div>
  );
};

export default ContactForm;