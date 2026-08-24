import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiConnector } from '../../services/apiConnector';
import { contactusEndpoint } from '../../services/apis';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful }
  } = useForm();

  const submitContactForm = async (data) => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        data
      );

      if (res?.data?.success) {
        toast.success("Message sent successfully 🎉");
      } else {
        toast.error(res?.data?.message || "Failed to send message ❌");
      }
      setLoading(false);
    } catch (error) {
      console.log("ERROR MESSAGE - ", error);
      const errMsg = error.response?.data?.message || error.message || "Something went wrong ❌";
      toast.error(errMsg);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        subject: "",
        message: "",
      });
    }
  }, [reset, isSubmitSuccessful]);

  return (
    <form
      className="flex flex-col gap-5 text-left font-sans"
      onSubmit={handleSubmit(submitContactForm)}
    >
      {/* First + Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="firstname" className="text-xs text-richblack-300 mb-1.5 font-medium">
            First Name
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-richblack-400 text-sm">
              <FaUser />
            </span>
            <input
              type="text"
              id="firstname"
              placeholder="Enter first name"
              className="w-full rounded-xl bg-[#0b0e1b] border border-white/10 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-richblack-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              {...register("firstname", { required: true })}
            />
          </div>
          {errors.firstname && (
            <span className="text-[11px] text-purple-400 mt-1">
              Please enter your first name
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="lastname" className="text-xs text-richblack-300 mb-1.5 font-medium">
            Last Name
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-richblack-400 text-sm">
              <FaUser />
            </span>
            <input
              type="text"
              id="lastname"
              placeholder="Enter last name"
              className="w-full rounded-xl bg-[#0b0e1b] border border-white/10 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-richblack-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              {...register("lastname")}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label htmlFor="email" className="text-xs text-richblack-300 mb-1.5 font-medium">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-3.5 text-richblack-400 text-sm">
            <FaEnvelope />
          </span>
          <input
            type="email"
            id="email"
            placeholder="Enter your email address"
            className="w-full rounded-xl bg-[#0b0e1b] border border-white/10 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-richblack-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            {...register("email", { required: true })}
          />
        </div>
        {errors.email && (
          <span className="text-[11px] text-purple-400 mt-1">
            Please enter your email address
          </span>
        )}
      </div>

      {/* Subject */}
      <div className="flex flex-col">
        <label htmlFor="subject" className="text-xs text-richblack-300 mb-1.5 font-medium">
          Subject
        </label>
        <select
          id="subject"
          className="w-full rounded-xl bg-[#0b0e1b] border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-richblack-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          {...register("subject")}
        >
          <option value="General Query" className="bg-[#0b0e1b] text-white">Select a subject</option>
          <option value="General Query" className="bg-[#0b0e1b] text-white">General Query</option>
          <option value="Courses & Enrollments" className="bg-[#0b0e1b] text-white">Courses & Enrollments</option>
          <option value="Technical Support" className="bg-[#0b0e1b] text-white">Technical Support</option>
          <option value="Feedback" className="bg-[#0b0e1b] text-white">Feedback</option>
        </select>
      </div>

      {/* Message */}
      <div className="flex flex-col">
        <label htmlFor="message" className="text-xs text-richblack-300 mb-1.5 font-medium">
          Message
        </label>
        <textarea
          id="message"
          rows="4"
          placeholder="Type your message here..."
          className="w-full rounded-xl bg-[#0b0e1b] border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-richblack-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
          {...register("message", { required: true })}
        />
        {errors.message && (
          <span className="text-[11px] text-purple-400 mt-1">
            Please enter your message
          </span>
        )}
      </div>

      {/* Submit Button with Purple-Blue Gradient */}
      <button
        disabled={loading}
        type="submit"
        className={`mt-2 w-full rounded-xl bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#3b82f6] py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all duration-300 hover:opacity-95 hover:shadow-[0_6px_25px_rgba(139,92,246,0.6)] flex items-center justify-center gap-2 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FaPaperPlane className="text-xs" />
        <span>{loading ? "Sending Message..." : "Send Message"}</span>
      </button>
    </form>
  );
};

export default ContactUsForm;