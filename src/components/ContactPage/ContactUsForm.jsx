import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { apiConnector } from '../../services/apiConnector';
import { contactusEndpoint } from '../../services/apis';
import CountryCode from "../../data/countrycode.json"
import toast from 'react-hot-toast';

const ContactUsForm = () => {

  const [loading,setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState:{errors,isSubmitSuccessful}
  } = useForm();

  const submitContactForm = async(data)=>{
  try {
    setLoading(true)
    const res = await apiConnector(
      "POST",
      contactusEndpoint.CONTACT_US_API,
      data
    )
    console.log("Email Res - ", res)

    if(res?.data?.success){
      toast.success("Message sent successfully 🎉")
    } else {
      toast.error(res?.data?.message || "Failed to send message ❌")
    }

    setLoading(false)
  } catch (error) {
    console.log("ERROR MESSAGE - ", error)
    const errMsg = error.response?.data?.message || error.message || "Something went wrong ❌"
    toast.error(errMsg)
    setLoading(false)
  }
}

  useEffect(()=>{
    if(isSubmitSuccessful){
      reset({
        email:"",
        firstname:"",
        lastname:"",
        message:"",
        phoneNo:"",
      }) 
    } 
  },[ reset,isSubmitSuccessful]);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(submitContactForm)}
    >

      {/* First + Last Name */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <div className="flex flex-col">
          <label htmlFor="firstname" className="text-sm text-richblack-300 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstname"
            placeholder="Enter first name"
            className="w-full rounded-lg bg-richblack-800 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            {...register("firstname", { required: true })}
          />
          {errors.firstname && (
            <span className="text-xs text-blue-300 mt-1">
              Please enter your name
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="lastname" className="text-sm text-richblack-300 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastname"
            placeholder="Enter last name"
            className="w-full rounded-lg bg-richblack-800 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            {...register("lastname")}
          />
        </div>

      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label htmlFor="email" className="text-sm text-richblack-300 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter email address"
          className="w-full rounded-lg bg-richblack-800 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span className="text-xs text-blue-300 mt-1">
            Please enter your email
          </span>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col">
        <label className="text-sm text-richblack-300 mb-1">
          Phone Number
        </label>

        <div className="flex gap-3">

          {/* Country Code */}
          <select
            className="w-[90px] rounded-lg bg-richblack-800 border border-richblack-600 px-2 py-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("countrycode")}
          >
            {CountryCode.map((ele, i) => (
              <option key={i} value={ele.code}>
                {ele.code}
              </option>
            ))}
          </select>

          {/* Phone Input */}
          <input
            type="number"
            placeholder="12345 67890"
            className="flex-1 rounded-lg bg-richblack-800 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
           {...register("phoneNo", {
  required: "Phone number is required",
  pattern: {
    value: /^[0-9]{10}$/,
    message: "Enter a valid 10-digit phone number",
  },
})}
          />
        </div>

        {errors.phoneNo && (
          <span className="text-xs text-blue-300 mt-1">
            {errors.phoneNo.message}
          </span>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col">
        <label htmlFor="message" className="text-sm text-richblack-300 mb-1">
          Message
        </label>
        <textarea
          id="message"
          rows="6"
          placeholder="Enter your message here..."
          className="w-full rounded-lg bg-richblack-800 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
          {...register("message", { required: true })}
        />
        {errors.message && (
          <span className="text-xs text-blue-300 mt-1">
            Please enter your message
          </span>
        )}
      </div>

      {/* Button */}
      <button
        disabled={loading}
        type="submit"
        className={`mt-4 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-white font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Sending..." : "Send Message 🚀"}
      </button>

    </form>
  )
}

export default ContactUsForm;