import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useNavigate, Link } from "react-router-dom"
import OtpInput from "react-otp-input"
import { BiArrowBack } from "react-icons/bi"
import { RxCountdownTimer } from "react-icons/rx"
import { apiConnector } from "../services/apiConnector"
import { endpoints } from "../services/apis"

function VerifyOtp() {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const signupData = JSON.parse(localStorage.getItem("signupData"))

  useEffect(() => {
    // Only allow access of this route when user has filled the signup form
    if (!signupData) {
      navigate("/signup")
    }
  }, [signupData, navigate])

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
    } = signupData

    try {
      // 1. Verify OTP
      await apiConnector("POST", endpoints.VERIFYOTP_API, {
        email,
        code: otp,
      })

      // 2. Signup
      await apiConnector("POST", endpoints.SIGNUP_API, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: confirmPassword,
        account_type: accountType,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      })

      localStorage.removeItem("signupData")
      toast.success("Account Created Successfully")
      navigate("/login")
    } catch (error) {
      console.log("VERIFY OTP / SIGNUP ERROR............", error)
      toast.error(error?.response?.data?.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await apiConnector("POST", endpoints.SENDOTP_API, {
        email: signupData.email,
        account_type: signupData.accountType,
      })
      toast.success("OTP Sent Successfully")
    } catch (error) {
      console.log("RESEND OTP ERROR............", error)
      toast.error("Could Not Send OTP")
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-richblack-900 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-200 rounded-full blur-[150px] opacity-[0.1]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-yellow-50 rounded-full blur-[150px] opacity-[0.05]"></div>

      {loading ? (
        <div className="flex flex-col items-center gap-4">
            <div className="spinner"></div>
            <p className="text-richblack-25 text-lg animate-pulse">Creating your account...</p>
        </div>
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8 relative z-10">
          <h1 className="text-richblack-5 font-semibold text-[1.875rem] leading-[2.375rem]">
            Verify Email
          </h1>
          <p className="text-[1.125rem] leading-[1.625rem] my-4 text-richblack-100">
            A verification code has been sent to you. Enter the code below
          </p>
          <form onSubmit={handleVerifyAndSignup}>
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderInput={(props) => (
                <input
                  {...props}
                  placeholder="-"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-[48px] lg:w-[60px] border-0 bg-richblack-800 rounded-[0.5rem] text-richblack-5 aspect-square text-center focus:border-0 focus:outline-2 focus:outline-yellow-50"
                />
              )}
              containerStyle={{
                justifyContent: "space-between",
                gap: "0 6px",
              }}
            />
            <button
              type="submit"
              className="w-full bg-yellow-50 py-[12px] px-[12px] rounded-[8px] mt-6 font-medium text-richblack-900 hover:scale-95 transition-all duration-200"
            >
              Verify Email
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between">
            <Link to="/signup">
              <p className="text-richblack-5 flex items-center gap-x-2 hover:text-yellow-50 transition-all duration-200">
                <BiArrowBack /> Back To Signup
              </p>
            </Link>
            <button
              className="flex items-center text-blue-100 gap-x-2 hover:text-blue-200 transition-all duration-200"
              onClick={handleResendOtp}
            >
              <RxCountdownTimer />
              Resend it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyOtp