import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-richblack-700 bg-gradient-to-br from-richblack-800 via-richblack-900 to-richblack-800 p-8 lg:p-14 shadow-2xl backdrop-blur-md transition-all duration-300 hover:shadow-blue-500/10 hover:scale-[1.01]">

      {/* Glow Effect */}
      <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-5">

        <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-purple-300 leading-tight">
          Got an Idea? Let’s Build It Together 
        </h1>

        <p className="text-richblack-300 text-base lg:text-lg max-w-xl">
          Tell us more about your vision. We’ll help you turn it into something amazing.
        </p>

        {/* Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-richblack-600 to-transparent"></div>

        {/* Form */}
        <div className="mt-5 transition-all duration-300">
          <ContactUsForm />
        </div>

      </div>
    </div>
  );
};

export default ContactForm;