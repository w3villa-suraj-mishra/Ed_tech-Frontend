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
          <div className="pb-4 text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ₹ {CurrentPrice}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col gap-4">
            {user && (user?.accountType === ACCOUNT_TYPE.INSTRUCTOR || String(course?.instructorId || course?.instructor?._id || course?.instructor?.id) === String(user?._id || user?.id)) ? (
              <button
                className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                onClick={() => navigate(`/dashboard/edit-course/${courseId || course?.id}`)}
              >
                Edit Course
              </button>
            ) : (
              <>
                {/* BUY BUTTON */}
                <button
                  className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  onClick={
                    user && course?.studentsEnrolled?.includes(user?._id || user?.id)
                      ? () => navigate("/dashboard/enrolled-courses")
                      : handleBuyCourse
                  }
                >
                  {user && course?.studentsEnrolled?.includes(user?._id || user?.id)
                    ? "Go To Course"
                    : "Buy Now"}
                </button>

                {/* ADD TO CART */}
                {(!user || !course?.studentsEnrolled?.includes(user?._id || user?.id)) && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full rounded-xl border border-yellow-400/30 bg-transparent py-3 font-medium text-yellow-300 transition-all duration-300 hover:bg-yellow-400/10 hover:scale-[1.02]"
                  >
                    Add to Cart
                  </button>
                )}
              </>
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