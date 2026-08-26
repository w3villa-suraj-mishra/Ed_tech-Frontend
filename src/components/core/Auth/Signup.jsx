import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { VscBook, VscCode, VscTrophy } from "react-icons/vsc"
import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../services/slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { apiConnector } from "../../../services/apiConnector"
import { endpoints, BASE_URL } from "../../../services/apis"

function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)
  const [agreedTerms, setAgreedTerms] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { firstName, lastName, email, password, confirmPassword } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()

    if (!agreedTerms) {
      toast.error("Please agree to the Terms of Service & Privacy Policy")
      return
    }

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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#070913] text-white font-inter py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* LEFT COLUMN: Signup Form */}
        <div className="lg:col-span-7 flex flex-col justify-center max-w-xl mx-auto lg:mx-0 w-full">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Create your account</span>
              <span className="text-purple-400 text-2xl">✨</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Join millions of learners and start your <span className="text-purple-400 font-semibold">coding</span> journey today.
            </p>
          </div>

          <form onSubmit={handleOnSubmit} className="space-y-5 w-full">
            
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  First Name <span className="text-purple-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleOnChange}
                  placeholder="Enter first name"
                  className="w-full rounded-xl bg-[#0b0e1b] border border-purple-500/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Last Name <span className="text-purple-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleOnChange}
                  placeholder="Enter last name"
                  className="w-full rounded-xl bg-[#0b0e1b] border border-purple-500/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Email Address <span className="text-purple-400">*</span>
              </label>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Enter email address"
                className="w-full rounded-xl bg-[#0b0e1b] border border-purple-500/20 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Create Password <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl bg-[#0b0e1b] border border-purple-500/20 px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Confirm Password <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleOnChange}
                  placeholder="Confirm password"
                  className="w-full rounded-xl bg-[#0b0e1b] border border-purple-500/20 px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0b0e1b] border-purple-500/40 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer select-none">
                I agree to the{" "}
                <Link to="/terms" className="text-purple-400 underline hover:text-purple-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-purple-400 underline hover:text-purple-300">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#070913] px-3 text-xs text-slate-400 uppercase font-semibold">
                OR
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Social Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const backendHost = process.env.REACT_APP_BASE_URL || 'https://ed-tech-backend-2kha.vercel.app';
                  window.location.href = `${backendHost}/auth/google_oauth2?mode=signup&role=${accountType}`;
                }}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors text-sm shadow-md"
              >
                <FcGoogle className="text-xl" />
                <span>Sign up with Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const backendHost = process.env.REACT_APP_BASE_URL || BASE_URL || 'https://ed-tech-backend-2kha.vercel.app';
                  window.location.href = `${backendHost}/auth/github?mode=signup&role=${accountType}`;
                }}
                className="w-full flex items-center justify-center gap-3 bg-[#161b22] border border-white/10 text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#21262d] transition-colors text-sm shadow-md"
              >
                <FaGithub className="text-xl" />
                <span>Sign up with GitHub</span>
              </button>
            </div>

            {/* Login Redirect Footer */}
            <p className="text-center text-xs text-slate-400 pt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-400 font-semibold hover:underline">
                Log in
              </Link>
            </p>

          </form>

        </div>

        {/* RIGHT COLUMN: Feature Preview Card */}
        <div className="lg:col-span-5 w-full max-w-lg mx-auto lg:mx-0">
          <div className="bg-[#0e111f] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col gap-6 relative overflow-hidden">
            
            {/* Top Image Banner */}
            <div className="relative rounded-2xl overflow-hidden h-52 bg-purple-950/40">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                alt="Students collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e111f] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xl shadow-lg">
                <VscCode />
              </div>
            </div>

            {/* Main Feature Content */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                Start learning. Start <span className="text-purple-400">building.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Unlock your potential with world-class courses and hands-on projects.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg shrink-0 mt-0.5">
                  <VscBook />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Learn from the best</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Access high-quality courses created by industry experts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg shrink-0 mt-0.5">
                  <VscCode />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Practice by building</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Build real-world projects and strengthen your coding skills.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg shrink-0 mt-0.5">
                  <VscTrophy />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Achieve your goals</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Earn certificates and advance your career in tech.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}

export default Signup



























