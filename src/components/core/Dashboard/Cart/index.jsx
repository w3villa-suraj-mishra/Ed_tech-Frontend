import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFromCart, resetCart, addToCart } from "../../../../services/slices/cartSlice";
import { getAllCourses } from "../../../../services/operations/courseDetailsAPI";
import { buyCourse } from "../../../../services/operations/studentFeaturesAPI";
import {
  VscTrash,
  VscLock,
  VscCheck,
  VscDeviceMobile,
  VscVerified,
  VscHeart,
  VscArrowRight,
  VscStarFull,
  VscBook
} from "react-icons/vsc";

export default function Cart() {
  const { cart, totalItems } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Fetch recommended courses dynamically from database
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const allCourses = await getAllCourses();
        if (allCourses && Array.isArray(allCourses)) {
          // Filter out courses that are already in the user's cart
          const cartIds = new Set(cart.map((c) => c._id || c.id));
          const filtered = allCourses.filter((c) => !cartIds.has(c._id || c.id));
          setRecommendedCourses(filtered.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching recommended courses", err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [cart]);

  // Dynamic Price Calculations
  const subtotal = cart.reduce((acc, course) => {
    const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
    return acc + origPrice;
  }, 0);

  const finalTotal = cart.reduce((acc, course) => {
    const price = Number(course?.pricing?.finalPrice || course?.price || 0);
    return acc + price;
  }, 0);

  const totalDiscount = subtotal > finalTotal ? subtotal - finalTotal : 0;
  const discountPercentage = subtotal > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const courseIds = cart.map((c) => c._id || c.id);
    buyCourse(token, courseIds, user, navigate, dispatch);
  };

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto pb-10">
      
      {/* 1. CART HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Cart</h1>
          <p className="text-xs text-richblack-300 mt-1">
            Review your selected courses before checkout.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={() => dispatch(resetCart())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/30 border border-purple-500/20 text-purple-300 text-xs font-semibold hover:bg-purple-600 hover:text-white transition-all self-start sm:self-auto"
          >
            <VscTrash /> Clear Cart
          </button>
        )}
      </div>

      {cart.length > 0 && (
        <div className="text-xs font-bold text-purple-400">
          {totalItems} Course{totalItems > 1 ? "s" : ""} in Cart
        </div>
      )}

      {/* 2. CART MAIN CONTENT & ORDER SUMMARY */}
      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Cart Items, Secure Checkout, Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CART ITEMS LIST */}
            <div className="space-y-4">
              {cart.map((course) => {
                const courseId = course._id || course.id;
                const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
                const currentPrice = Number(course?.pricing?.finalPrice || course?.price || 0);
                const itemDiscountPct = origPrice > currentPrice ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : 0;
                const rating = course.averageRating || 4.5;
                const totalLessons = course.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || course.totalLessons || 45;

                return (
                  <div
                    key={courseId}
                    className="bg-[#0e111f] border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.08)] flex flex-col sm:flex-row items-start justify-between gap-4 relative group"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative aspect-video w-full sm:w-44 rounded-xl overflow-hidden bg-purple-900/30 border border-purple-500/20 shrink-0">
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details Column */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
                          BESTSELLER
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white truncate max-w-full">
                        {course.courseName}
                      </h3>

                      <p className="text-xs text-richblack-300 line-clamp-2 leading-relaxed">
                        {course.courseDescription}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-richblack-400 flex-wrap pt-1">
                        <span className="flex items-center gap-1">
                          📊 <span>{course.instructions?.[0] || "Beginner"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ <span>{course?.totalDuration || "32 Hours"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          📚 <span>{totalLessons} Lessons</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs pt-1">
                        <span className="text-amber-400">★</span>
                        <span className="text-white font-bold">{rating}</span>
                        <span className="text-richblack-400 text-[11px]">({course.ratingAndReviews?.length || 230} Reviews)</span>
                      </div>
                    </div>

                    {/* Price & Remove Right Column */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 shrink-0">
                      <button
                        onClick={() => dispatch(removeFromCart(courseId))}
                        className="text-richblack-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all text-sm"
                        title="Remove Course"
                      >
                        ✕
                      </button>

                      <div className="text-right space-y-0.5">
                        <div className="text-lg font-extrabold text-white">
                          ₹{currentPrice.toLocaleString()}
                        </div>
                        {itemDiscountPct > 0 && (
                          <div className="flex items-center gap-1.5 justify-end text-[11px]">
                            <span className="text-richblack-400 line-through">₹{origPrice.toLocaleString()}</span>
                            <span className="bg-purple-900/40 text-purple-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {itemDiscountPct}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* SECURE CHECKOUT BADGE */}
            <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(168,85,247,0.06)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center text-lg shrink-0">
                  <VscLock />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Secure Checkout</h4>
                  <p className="text-[11px] text-richblack-400">Your payment information is safe with us.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-purple-900/30 border border-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  🔒 SSL Secured
                </span>
                <span className="bg-emerald-900/30 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  ✓ 100% Safe
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 space-y-6 shadow-[0_0_25px_rgba(168,85,247,0.1)] sticky top-6">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">Order Summary</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between text-richblack-300">
                <span>Subtotal</span>
                <span className="text-white font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>- ₹{totalDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Total</span>
                  <span className="text-[10px] text-richblack-400">Inclusive of all taxes</span>
                </div>
                <span className="text-2xl font-extrabold text-white">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Buy Now Action */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Buy Now</span>
              <VscLock className="text-base" />
            </button>

            {/* <div className="text-center">
              <span className="text-[11px] text-emerald-400 font-medium inline-flex items-center gap-1">
                🛡️ 30-Day Money-Back Guarantee
              </span>
            </div> */}

            {/* Payment Options Icons */}
            {/* <div className="border-t border-white/10 pt-4 space-y-3">
              <span className="text-[10px] text-richblack-400 font-bold block uppercase tracking-wider">We Accept</span>
              <div className="flex items-center gap-2 flex-wrap">
                {["VISA", "Mastercard", "UPI", "Paytm", "Razorpay"].map((pm) => (
                  <span key={pm} className="bg-[#141728] border border-white/10 px-2.5 py-1 rounded text-[10px] font-bold text-white">
                    {pm}
                  </span>
                ))}
              </div>
            </div> */}

            {/* Guarantees List */}
            {/* <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-richblack-300"> */}
              {/* <div className="flex items-center gap-2.5">
                <span className="text-purple-400">♾️</span>
                <span>Lifetime Access</span>
              </div>
              <div className="flex items-center gap-2.5">
                <VscDeviceMobile className="text-purple-400 text-sm" />
                <span>Access on Mobile & TV</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-purple-400">📜</span>
                <span>Certificate of Completion</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-purple-400">🎧</span>
                <span>24/7 Support</span> */}
              {/* </div> */}
            {/* </div> */}

          </div>

        </div>
      ) : (
        /* EMPTY CART STATE */
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-12 text-center text-richblack-300 space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
          <VscBook className="text-5xl mx-auto text-purple-400/40" />
          <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
          <p className="text-xs text-richblack-400 max-w-sm mx-auto">
            Looks like you haven't added any courses to your cart yet. Explore our top courses and start learning today.
          </p>
          <button
            onClick={() => navigate("/dashboard/buy-courses")}
            className="px-6 py-3 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] inline-flex items-center gap-2 mt-2"
          >
            <span>Explore Courses</span>
            <VscArrowRight />
          </button>
        </div>
      )}

      {/* 3. RECOMMENDED COURSES SECTION ("You might also like") */}
      {recommendedCourses.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-white">You might also like</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedCourses.map((course) => {
              const courseId = course._id || course.id;
              const price = Number(course?.pricing?.finalPrice || course?.price || 0);
              const rating = course.averageRating || 4.6;

              return (
                <div
                  key={courseId}
                  className="bg-[#0e111f] border border-purple-500/20 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.06)] flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-purple-900/30">
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => dispatch(addToCart(course))}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:text-purple-400 backdrop-blur-sm transition-colors"
                        title="Add to Cart"
                      >
                        <VscHeart />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-richblack-400 line-clamp-2 leading-relaxed">
                        {course.courseDescription}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-amber-400">★</span>
                      <span className="text-white font-bold">{rating}</span>
                      <span className="text-richblack-400 text-[10px]">({course.ratingAndReviews?.length || 980})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-white">₹{price.toLocaleString()}</span>
                      <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold hover:bg-purple-600 hover:text-white transition-all"
                      >
                        View
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}