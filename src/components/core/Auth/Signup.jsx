import { useState } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../services/slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import Tab from "../../Common/Tab"
import signupImg from "../../../assests/Images/signup.webp"
import frameImg from "../../../assests/Images/frame.png"
import axios from "axios"
import { useEffect } from "react";
import { apiConnector } from "../../../services/apiConnector";
import { endpoints, BASE_URL } from "../../../services/apis";

function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // student or instructor
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { firstName, lastName, email, password, confirmPassword } = formData

  // Handle input fields, when some value changes
  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const [loading, setLoading] = useState(false)

  // Handle Form Submission
  const handleOnSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match")
      return
    }

    setLoading(true)

    try {
      const cleanEmail = String(email || '').toLowerCase().trim()
      localStorage.setItem(
        "signupData",
        JSON.stringify({
          firstName,
          lastName,
          email: cleanEmail,
          password,
          confirmPassword,
          accountType,
        })
      )

      await apiConnector("POST", endpoints.SENDOTP_API, {
        email: cleanEmail,
        accountType: accountType,
        account_type: accountType
      })

      toast.success("OTP Sent Successfully")
      navigate("/verify-otp")

    } catch (error) {
      console.log(error)
      toast.error(
        error?.response?.data?.message || "Failed To Send OTP"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get("error")

    if (error === "already_registered") {
      toast.error("This email is already registered. Please log in.", {
        id: "already-registered"
      })

      window.history.replaceState({}, document.title, "/signup")
    }
  }, [])
  // data to pass to Tab component
  const tabData = [
    {
      id: 1,
      tabName: "Student",
      type: ACCOUNT_TYPE.STUDENT,
    },
    {
      id: 2,
      tabName: "Instructor",
      type: ACCOUNT_TYPE.INSTRUCTOR,
    },
  ]

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-richblack-900 px-4 md:px-0 relative overflow-hidden">
      {/* Expanded Neon Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[150px] opacity-[0.15] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-yellow-50 rounded-full blur-[180px] opacity-[0.08]"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500 rounded-full blur-[120px] opacity-[0.05]"></div>

      <div className="mx-auto flex w-11/12 max-w-[1160px] flex-col-reverse justify-between gap-y-12 py-8 md:flex-row md:gap-y-0 md:gap-x-12 relative z-10">

        {/* Left Column: Form */}
        <div className="mx-auto w-11/12 max-w-[450px] md:mx-0">
          <div className="flex flex-col gap-y-2 mb-8 text-left">
            <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
              Join the millions learning to code with StudyNotion for free
            </h1>
            <p className="text-[1.125rem] leading-[1.625rem] text-richblack-300">
              Build skills for today, tomorrow, and beyond.{" "}
              <span className="font-bold italic text-blue-100">Education to future-proof your career.</span>
            </p>
          </div>

          {/* Tab */}
          <Tab tabData={tabData} field={accountType} setField={setAccountType} />
          {/* Form */}
          <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4">
            <div className="flex flex-col md:flex-row gap-x-4 gap-y-4">
              <label className="flex-1">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                  First Name <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleOnChange}
                  placeholder="Enter first name"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 border-b-[1px] border-richblack-500 focus:outline-none focus:border-yellow-50 transition-all duration-200"
                />
              </label>
              <label className="flex-1">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                  Last Name <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleOnChange}
                  placeholder="Enter last name"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 border-b-[1px] border-richblack-500 focus:outline-none focus:border-yellow-50 transition-all duration-200"
                />
              </label>
            </div>
            <label className="w-full">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Email Address <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Enter email address"
                style={{
                  boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
                className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 border-b-[1px] border-richblack-500 focus:outline-none focus:border-yellow-50 transition-all duration-200"
              />
            </label>
            <div className="flex flex-col md:flex-row gap-x-4 gap-y-4">
              <label className="relative flex-1">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                  Create Password <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Enter Password"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5 border-b-[1px] border-richblack-500 focus:outline-none focus:border-yellow-50 transition-all duration-200"
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] z-[10] cursor-pointer"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                  ) : (
                    <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                  )}
                </span>
              </label>
              <label className="relative flex-1">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                  Confirm Password <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleOnChange}
                  placeholder="Confirm Password"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5 border-b-[1px] border-richblack-500 focus:outline-none focus:border-yellow-50 transition-all duration-200"
                />
                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] z-[10] cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                  ) : (
                    <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                  )}
                </span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-richblack-900 border-t-transparent rounded-full animate-spin"></div>
                  Sending Verification Code...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="flex w-full items-center my-2 gap-x-2">
              <div className="h-[1px] w-full bg-richblack-700"></div>
              <p className="text-richblack-700 font-medium leading-[1.375rem]">OR</p>
              <div className="h-[1px] w-full bg-richblack-700"></div>
            </div>

            <button
              type="button"
              onClick={() => {
                const backendHost = process.env.REACT_APP_BASE_URL || 'https://ed-tech-backend-2kha.vercel.app';
                window.location.href = `${backendHost}/auth/google_oauth2?mode=signup&role=${accountType}`;
              }}
              className="flex w-full justify-center items-center gap-x-2 rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 hover:scale-95 transition-all duration-200"
            >
              <FcGoogle className="text-2xl" />
              Sign up with Google
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = `${BASE_URL}/github-start?mode=signup&role=${accountType}`
              }}
              className="flex w-full justify-center items-center gap-x-2 rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 hover:scale-95 transition-all duration-200"
            >
              <FaGithub className="text-2xl" />
              Sign up with GitHub
            </button>
          </form>
        </div>

        {/* Right Column: Image */}
        <div className="relative mx-auto w-11/12 max-w-[450px] md:mx-0">
          <img
            src={frameImg}
            alt="Pattern"
            width={558}
            height={504}
            loading="lazy"
          />
          <img
            src={signupImg}
            alt="Students"
            width={558}
            height={504}
            loading="lazy"
            className="absolute -top-4 right-4 z-10"
          />
        </div>

      </div>
    </div>
  )
}

export default Signup



























