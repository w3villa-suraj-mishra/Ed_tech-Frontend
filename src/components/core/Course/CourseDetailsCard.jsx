import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { addToCart } from "../../../services/slices/cartSlice";
import { courseEndpoints } from "../../../services/apis";
import { apiConnector } from "../../../services/apiConnector";

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Read code query param if passed from Claim Now announcement
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCouponInput(codeParam.toUpperCase());
    }
  }, [location.search]);

  const handleApplyCoupon = async (overrideCode = null, overridePlan = 'gold') => {
    const targetCode = (overrideCode || couponInput).trim();
    if (!targetCode) return;

    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : null;
      const res = await apiConnector(
        'POST',
        courseEndpoints.VALIDATE_OFFER_API,
        {
          code: targetCode,
          courseId: courseId || course?.id,
          plan: overridePlan
        },
        headers
      );

      if (res.data?.success && res.data?.data) {
        setAppliedCoupon(res.data.data);
        toast.success(`Coupon ${res.data.data.code} applied!`);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.data?.message || 'Invalid coupon code');
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || err.message || 'Coupon validation failed');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const enrollment = course?.userEnrollment || (user?.enrollments?.find(e => String(e.courseId || e.course?.id) === String(courseId || course?.id)));
  const isSilverExpired = enrollment?.plan === 'silver' && enrollment?.expiresAt && new Date(enrollment.expiresAt) <= new Date();
  const userPlan = isSilverExpired ? 'expired' : (enrollment?.plan || (course?.studentsEnrolled?.includes(user?._id || user?.id) ? 'gold' : null));
  const formattedExpiry = enrollment?.expiresAt ? new Date(enrollment.expiresAt).toLocaleDateString('en-GB') : null;

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
    if (userPlan && userPlan !== 'expired') {
      toast.error("You have already purchased this course.")
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
                {/* CURRENT PLAN BADGE HEADER */}
                <div className="flex items-center justify-between border-b border-richblack-700 pb-2">
                  <span className="text-xs font-bold text-richblack-300 uppercase tracking-wider">Select Access Plan</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    userPlan === 'gold' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    userPlan === 'silver' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    userPlan === 'expired' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-richblack-700 text-richblack-300'
                  }`}>
                    Current Plan: {userPlan ? userPlan.toUpperCase() : 'FREE'}
                  </span>
                </div>
                
                {/* FREE PLAN CARD */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  userPlan === 'free' ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-richblack-700 bg-richblack-900/60'
                }`}>
                  <div>
                    <span className="font-bold text-white text-sm block flex items-center gap-1.5">
                      FREE
                      {userPlan === 'free' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded">✓ CURRENT</span>}
                    </span>
                    <span className="text-xs text-richblack-300">First 2 videos only</span>
                  </div>
                  <button
                    onClick={() => handleBuyCourse('free')}
                    disabled={userPlan === 'gold' || userPlan === 'silver'}
                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                      userPlan === 'free' ? 'bg-emerald-600 text-white cursor-default' :
                      (userPlan === 'gold' || userPlan === 'silver') ? 'bg-richblack-800 text-richblack-500 cursor-not-allowed border border-richblack-700' :
                      'bg-richblack-700 hover:bg-richblack-600 text-white'
                    }`}
                  >
                    {userPlan === 'free' ? 'Continue Free' : (userPlan === 'gold' || userPlan === 'silver') ? 'Included' : 'Continue Free'}
                  </button>
                </div>

                {/* SILVER PLAN CARD */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  userPlan === 'silver' ? 'border-blue-500 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-blue-500/30 bg-blue-950/20'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-300 text-sm">SILVER</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">1 Year</span>
                      {userPlan !== 'silver' && userPlan !== 'gold' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">30% OFF</span>
                      )}
                    </div>
                    <span className="text-xs text-richblack-300 block">
                      {userPlan === 'silver' ? (
                        <span className="text-blue-300 font-medium">Valid Until: {formattedExpiry || '1 Year Access'}</span>
                      ) : (
                        'Full course access'
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400">
                        ₹{Math.round((course?.pricing?.finalPrice || CurrentPrice) * 0.7)}
                      </span>
                      <span className="text-[11px] text-richblack-400 line-through">
                        ₹{course?.pricing?.finalPrice || CurrentPrice}
                      </span>
                    </div>
                  </div>

                  {userPlan === 'silver' ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-blue-900/40 border border-blue-500/40 text-blue-300 font-bold text-xs cursor-default flex items-center gap-1"
                    >
                      ✓ Current Plan
                    </button>
                  ) : userPlan === 'gold' ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-richblack-800 border border-richblack-700 text-richblack-500 font-semibold text-xs cursor-not-allowed"
                    >
                      Included
                    </button>
                  ) : userPlan === 'expired' ? (
                    <button
                      onClick={() => handleBuyCourse('silver', appliedCoupon?.code)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition"
                    >
                      Renew Silver
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyCourse('silver', appliedCoupon?.code)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition"
                    >
                      Buy Silver
                    </button>
                  )}
                </div>

                {/* GOLD PLAN CARD */}
                <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  userPlan === 'gold' ? 'border-amber-500 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-yellow-500/40 bg-yellow-950/20'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-yellow-400 text-sm">GOLD</span>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Lifetime</span>
                    </div>
                    <span className="text-xs text-richblack-300 block">
                      {userPlan === 'gold' ? (
                        <span className="text-amber-300 font-medium">Lifetime Access</span>
                      ) : (
                        'Unlimited access'
                      )}
                    </span>
                    <span className="text-xs font-bold text-yellow-400">₹{course?.pricing?.finalPrice || CurrentPrice}</span>
                  </div>

                  {userPlan === 'gold' ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-500/50 text-amber-300 font-bold text-xs cursor-default flex items-center gap-1"
                    >
                      ✓ Current Plan
                    </button>
                  ) : userPlan === 'silver' ? (
                    <button
                      onClick={() => handleBuyCourse('gold', appliedCoupon?.code)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md transition animate-pulse"
                    >
                      Upgrade to Gold
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyCourse('gold', appliedCoupon?.code)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-semibold text-xs shadow-md transition"
                    >
                      Buy Gold
                    </button>
                  )}
                </div>

                {/* PROMO / COUPON CODE SECTION */}
                {userPlan !== 'gold' && (
                  <div className="pt-2 border-t border-richblack-700/60">
                    <label className="block text-[11px] font-bold text-richblack-300 mb-1.5 uppercase tracking-wider">
                      Have a Promo / Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. RAKSHA50"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (appliedCoupon) {
                            setAppliedCoupon(null);
                            setCouponError('');
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-richblack-900 border border-richblack-700 rounded-lg text-white text-xs uppercase tracking-wider focus:outline-none focus:border-yellow-400"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold text-xs rounded-lg transition"
                      >
                        {isValidatingCoupon ? '...' : appliedCoupon ? 'Re-Apply' : 'Apply'}
                      </button>
                    </div>

                    {couponError && (
                      <p className="mt-1 text-[11px] text-red-400 font-medium">
                        ❌ {couponError}
                      </p>
                    )}

                    {appliedCoupon && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>✓ {appliedCoupon.code} Applied</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponInput('');
                              setCouponError('');
                            }}
                            className="text-[10px] text-richblack-400 hover:text-white underline font-normal"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-richblack-300 text-[11px]">
                          <span>Original Price</span>
                          <span>₹{appliedCoupon.originalAmount}</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400 text-[11px] font-semibold">
                          <span>Discount Savings</span>
                          <span>-₹{appliedCoupon.discountAmount}</span>
                        </div>
                        <div className="flex items-center justify-between text-white font-extrabold border-t border-emerald-500/20 pt-1 mt-1">
                          <span>Payable Amount</span>
                          <span className="text-yellow-400 text-sm">₹{appliedCoupon.finalAmount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ADD TO CART (Only if not Gold) */}
                {userPlan !== 'gold' && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full mt-2 rounded-xl border border-yellow-400/30 bg-transparent py-2.5 font-medium text-yellow-300 text-xs transition-all hover:bg-yellow-400/10"
                  >
                    Add to Cart
                  </button>
                )}
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