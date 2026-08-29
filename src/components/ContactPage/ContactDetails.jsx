import React from "react";
import { FaComments, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaArrowRight } from "react-icons/fa";

const waysToReach = [
  {
    icon: <FaComments />,
    title: "Chat with us",
    desc: "Our friendly team is here to help.",
    value: "support@codelearn.com",
    isLink: true,
  },
  {
    icon: <FaMapMarkerAlt />,
    title: "Visit our office",
    desc: "Come say hi at our office HQ.",
    value: "Sector 63, Block A, Noida, Uttar Pradesh 201301, India",
    isLink: false,
  },
  {
    icon: <FaPhoneAlt />,
    title: "Call us",
    desc: "Mon - Fri from 9am to 6pm",
    value: "+91 12345 67890",
    isLink: true,
  },
  {
    icon: <FaClock />,
    title: "Response Time",
    desc: "We usually reply within",
    value: "24 hours",
    isLink: false,
  },
];

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-4 text-left font-sans">
      <h3 className="text-xs font-bold text-richblack-300 uppercase tracking-widest mb-1">
        Other Ways to Reach Us
      </h3>

      <div className="grid grid-cols-1 gap-3.5">
        {waysToReach.map((item, index) => (
          <div
            key={index}
            className="bg-[#0e111f]/90 border border-white/10 hover:border-blue-500/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition-all duration-300 group shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-center text-blue-400 text-base shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-richblack-400 font-normal">
                  {item.desc}
                </p>
                <div className="text-xs font-semibold text-blue-300 mt-1 truncate max-w-[220px] sm:max-w-[260px]">
                  {item.value}
                </div>
              </div>
            </div>

            <span className="text-richblack-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all text-xs pt-1.5">
              <FaArrowRight />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactDetails;