import React from 'react'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { addToCart } from "../../../services/slices/cartSlice";

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Could not copy link"));
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  return (
    <div className="group relative flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] shadow-xl hover:shadow-2xl transition-all duration-300">

      {/* INNER CARD */}
      <div className="flex flex-col gap-4 rounded-3xl bg-richblack-800 p-4 backdrop-blur-xl">

        {/* IMAGE */}
        <div className="overflow-hidden rounded-2xl">
          <img
            src={ThumbnailImage}
            alt={course?.courseName}
            className="max-h-[300px] min-h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="px-4">

          {/* PRICE */}
          <div className="pb-4 flex items-baseline gap-3">
            {course?.pricing?.isOfferActive || (course?.originalPrice && Number(course?.originalPrice) > Number(CurrentPrice)) ? (
              <>
                <span className="text-xl text-richblack-400 line-through">
                  ₹ {course?.pricing?.originalPrice || course?.originalPrice}
                </span>
                <span className="text-3xl font-bold text-yellow-50">
                  ₹ {course?.pricing?.finalPrice || CurrentPrice}
                </span>
                {course?.pricing?.discountPercentage > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full">
                    {course?.pricing?.discountPercentage}% OFF
                  </span>
                )}
              </>
            ) : (
              <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                ₹ {CurrentPrice}
              </span>
            )}
          </div>

          {/* PLANS SELECTION */}
          <div className="flex flex-col gap-4">
            {user && (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR || String(course?.instructorId || course?.instructor?._id || course?.instructor?.id) === String(user?._id || user?.id)) ? (
              <button
                className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                onClick={() => navigate(`/dashboard/edit-course/${courseId || course?.id}`)}
              >
                Edit Course
              </button>
            ) : user && course?.studentsEnrolled?.includes(user?._id || user?.id) ? (
              <button
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3 font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
                onClick={() => {
                  const firstSection = course?.courseContent?.[0];
                  const firstLecture = firstSection?.subSection?.[0];
                  if (firstSection && firstLecture) {
                    navigate(`/view-course/${courseId || course?._id || course?.id}/section/${firstSection._id}/sub-section/${firstLecture._id}`);
                  } else {
                    navigate(`/view-course/${courseId || course?._id || course?.id}`);
                  }
                }}
              >
                <BsFillCaretRightFill /> Start / Continue Learning
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-richblack-300 uppercase tracking-wider">Select Access Plan</p>
                
                {/* FREE PLAN */}
                <div className="p-3 rounded-xl border border-richblack-700 bg-richblack-900/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">FREE</span>
                    <span className="text-xs text-richblack-300">First 2 videos only</span>
                  </div>
                  <button
                    onClick={() => handleBuyCourse('free')}
                    className="px-3 py-1.5 rounded-lg bg-richblack-700 hover:bg-richblack-600 text-white font-medium text-xs transition"
                  >
                    Continue Free
                  </button>
                </div>

                {/* SILVER PLAN */}
                <div className="p-3 rounded-xl border border-blue-500/40 bg-blue-950/20 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-300 text-sm">SILVER</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">1 Year</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">30% OFF</span>
                    </div>
                    <span className="text-xs text-richblack-300 block">Full course access</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400">
                        ₹{Math.round((course?.pricing?.finalPrice || CurrentPrice) * 0.7)}
                      </span>
                      <span className="text-[11px] text-richblack-400 line-through">
                        ₹{course?.pricing?.finalPrice || CurrentPrice}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyCourse('silver')}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition"
                  >
                    Buy Silver
                  </button>
                </div>

                {/* GOLD PLAN */}
                <div className="p-3 rounded-xl border border-yellow-500/40 bg-yellow-950/20 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-yellow-400 text-sm">GOLD</span>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Lifetime</span>
                    </div>
                    <span className="text-xs text-richblack-300 block">Unlimited access</span>
                    <span className="text-xs font-bold text-yellow-400">₹{course?.pricing?.finalPrice || CurrentPrice} (100%)</span>
                  </div>
                  <button
                    onClick={() => handleBuyCourse('gold')}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-semibold text-xs shadow-md transition"
                  >
                    Buy Gold
                  </button>
                </div>

                {/* ADD TO CART */}
                <button
                  onClick={handleAddToCart}
                  className="w-full mt-2 rounded-xl border border-yellow-400/30 bg-transparent py-2.5 font-medium text-yellow-300 text-xs transition-all hover:bg-yellow-400/10"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>

          {/* GUARANTEE */}
          <p className="pt-6 pb-3 text-center text-sm text-richblack-300">
            30-Day Money-Back Guarantee
          </p>

          {/* INCLUDES */}
          <div>
            <p className="my-2 text-lg font-semibold text-white">
              This Course Includes:
            </p>

            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-200">
              {(Array.isArray(course?.instructions) 
                ? course.instructions 
                : typeof course?.instructions === 'string' 
                  ? course.instructions.split(',').filter(i => i.trim())
                  : []
              ).map((item, i) => {
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 transition-all duration-200 hover:translate-x-1"
                  >
                    <BsFillCaretRightFill className="mt-1 text-yellow-400" />
                    <span>{item}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SHARE */}
          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-300 transition-all duration-300 hover:text-yellow-400 hover:scale-105"
              onClick={handleShare}
            >
              <FaShareSquare size={16} /> Share
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CourseDetailsCard