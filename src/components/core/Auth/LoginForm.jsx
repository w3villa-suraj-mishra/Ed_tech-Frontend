import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { Link, useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import loginImg from "../../../assests/Images/login.webp"
import frameImg from "../../../assests/Images/frame.png"
import axios from "axios"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { useDispatch } from "react-redux"
import { setToken } from "../../../services/slices/authSlice"
import { setUser } from "../../../services/slices/profileSlice"

import { ACCOUNT_TYPE } from "../../../utils/constants"
import Tab from "../../Common/Tab"
import { BASE_URL, endpoints } from "../../../services/apis"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(endpoints.LOGIN_API, {
        email,
        password,
        accountType: accountType,
        account_type: accountType
      })

      const userObj = response.data.user;
      const account_type = userObj.accountType || userObj.account_type || "Student";
      const first_name = userObj.firstName || userObj.first_name || "";
      const last_name = userObj.lastName || userObj.last_name || "";

      const userImage = userObj?.image
        ? userObj.image
        : `https://api.dicebear.com/9.x/initials/svg?seed=${first_name}${last_name}`;

      const userData = { 
        ...userObj, 
        account_type, 
        accountType: account_type,
        first_name, 
        last_name,
        image: userImage 
      };

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      dispatch(setToken(response.data.token));
      dispatch(setUser(userData));

      toast.success("Login Successful");

      if (account_type === "Instructor") {
        navigate("/dashboard/instructor");
      } else {
        navigate("/dashboard/my-profile");
      }

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Invalid email or password")
    }
  }

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

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const error = params.get("error")

  if (error === "not_registered") {
    toast.error("No account found. Please sign up first.", {
      id: "not-registered"
    })
  } else if (error === "no_email") {
    toast.error("Could not retrieve email from GitHub. Please make your email public in GitHub settings.", {
      id: "no-email"
    })
  } else if (error === "auth_failed") {
    toast.error("Authentication failed. Please try again.", {
      id: "auth-failed"
    })
  }

  if (error) {
    // Clear any stale auth data that might cause auto-login
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("role")
    window.history.replaceState({}, document.title, "/login")
  }
}, [])
  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-richblack-900 px-4 md:px-0 relative overflow-hidden">
      {/* Expanded Neon Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[150px] opacity-[0.15] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-yellow-50 rounded-full blur-[180px] opacity-[0.08]"></div>
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-500 rounded-full blur-[120px] opacity-[0.05]"></div>

      <div className="mx-auto flex w-11/12 max-w-[1160px] flex-col-reverse justify-between gap-y-12 py-12 md:flex-row md:gap-y-0 md:gap-x-12 relative z-10">

        {/* Left Column: Form */}
        <div className="mx-auto w-11/12 max-w-[450px] md:mx-0">
          <div className="flex flex-col gap-y-2 mb-8 text-left">
            <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
              Welcome Back
            </h1>
            <p className="text-[1.125rem] leading-[1.625rem] text-richblack-300">
              Build skills for today, tomorrow, and beyond.{" "}
              <span className="font-bold italic text-blue-100">Education to future-proof your career.</span>
            </p>
          </div>

          {/* Tab */}
          <Tab tabData={tabData} field={accountType} setField={setAccountType} />

          <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4">
            <label className="w-full">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Email Address <sup className="text-blue-200">*</sup>
              </p>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Enter email address"
                className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 border-b-[1px] border-richblack-500 focus:outline-none focus:border-yellow-50 transition-all duration-200"
              />
            </label>

            <label className="relative">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Password <sup className="text-blue-200">*</sup>
              </p>
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter Password"
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
              <Link to="/forgot-password">
                <p className="mt-1 ml-auto max-w-max text-xs text-blue-100 hover:underline transition-all">
                  Forgot Password
                </p>
              </Link>
            </label>

            <button
              type="submit"
              className="mt-6 rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 hover:scale-95 transition-all duration-200"
            >
              Sign In
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
                window.location.href = `${backendHost}/auth/google_oauth2?mode=login&role=${accountType}`;
              }}
              className="flex w-full justify-center items-center gap-x-2 rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 hover:scale-95 transition-all duration-200"
            >
              <FcGoogle className="text-2xl" />
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={() => {
                const backendHost = process.env.REACT_APP_BASE_URL || BASE_URL || 'https://ed-tech-backend-2kha.vercel.app';
                window.location.href = `${backendHost}/auth/github?mode=login&role=${accountType}`;
              }}
              className="flex w-full justify-center items-center gap-x-2 rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900 hover:scale-95 transition-all duration-200"
            >
              <FaGithub className="text-2xl" />
              Continue with GitHub
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
            src={loginImg}
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

export default LoginForm