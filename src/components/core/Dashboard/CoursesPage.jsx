import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import { getAllCourses } from "../../../services/operations/courseDetailsAPI";
import { addToCart } from "../../../services/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { FiClock, FiSearch } from "react-icons/fi";

const CoursesPage = ({ defaultTab = "your-courses" }) => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get("session_id");
        if (sessionId && token && !verifying) {
          setVerifying(true);
          // Remove session_id from URL right away so re-renders don't re-trigger
          window.history.replaceState({}, document.title, window.location.pathname);
          const { verifyPayment } = await import("../../../services/operations/studentFeaturesAPI");
          await verifyPayment(sessionId, [], token, navigate, dispatch);
          setActiveTab("your-courses");
          const freshEnrolled = await getUserEnrolledCourses(token);
          if (freshEnrolled && Array.isArray(freshEnrolled)) {
            const normalized = freshEnrolled.map(item => (item && item.course) ? { ...item.course, ...item } : item);
            setEnrolledCourses(normalized);
          }
        }

        if (token) {
          const enrolled = await getUserEnrolledCourses(token);
          if (enrolled && Array.isArray(enrolled)) {
            const normalized = enrolled.map(item => (item && item.course) ? { ...item.course, ...item } : item);
            setEnrolledCourses(normalized);
          }
        }
        const courses = await getAllCourses();
        if (courses && Array.isArray(courses)) {
          setAllCourses(courses);
        }
      } catch (err) {
        console.log("Error fetching courses", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [token]);

  const filteredEnrolled = enrolledCourses.filter((course) =>
    course.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAll = allCourses.filter((course) =>
    course.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="text-white space-y-6 max-w-6xl mx-auto">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Courses</h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore our courses and find the perfect one for you.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#252C3A] pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("your-courses")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "your-courses"
                ? "bg-[#1E2533] text-white border border-[#2B3444] shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Continue Watching (Your Courses)
          </button>
          <button
            onClick={() => setActiveTab("buy-courses")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "buy-courses"
                ? "bg-[#1E2533] text-white border border-[#2B3444] shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Buy Courses
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-[#12161F] border border-[#252C3A] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading course catalog...</div>
      ) : activeTab === "your-courses" ? (
        /* YOUR COURSES TAB */
        <div>
          {filteredEnrolled.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEnrolled.map((course) => {
                const courseId = course._id || course.id;
                return (
                  <div
                    key={courseId}
                    onClick={() => navigate(`/s/courses/${courseId}/take`)}
                    className="bg-[#12161F] border border-[#252C3A] hover:border-indigo-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                        <img
                          src={course.thumbnail}
                          alt={course.courseName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-sm text-white line-clamp-1">{course.courseName}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.courseDescription}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-3">
                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <FiClock size={13} />
                          <span>{course?.totalDuration || "0.0 Hours"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded border border-slate-500 flex items-center justify-center text-[8px] font-bold">≡</span>
                          <span>{course?.sections?.length || course?.courseContent?.length || 0} Sections</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="w-full bg-[#1C2230] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${course.progressPercentage || 0}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {course.progressPercentage || 0}% Complete
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 font-medium">
                        {course.plan ? `${course.plan.toUpperCase()} Access` : 'Lifetime access'}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-amber-400">★</span>
                        <span className="text-slate-200 font-semibold">{course.averageRating || 0}</span>
                        <span className="text-slate-400 text-[11px] font-medium">({course.ratingCount || 0})</span>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/s/courses/${courseId}/take`);
                          }}
                          className="w-full py-2.5 rounded-xl bg-indigo-600 border border-indigo-500 text-xs font-semibold text-white hover:bg-indigo-700 transition-all text-center"
                        >
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <p className="text-sm font-bold text-white">No Enrolled Courses</p>
              <p className="text-xs text-slate-400">You have not enrolled in any courses yet.</p>
              <button
                onClick={() => setActiveTab("buy-courses")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md inline-block"
              >
                Browse Buy Courses
              </button>
            </div>
          )}
        </div>
      ) : (
        /* BUY COURSES TAB */
        <div>
          {filteredAll.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredAll.map((course) => {
                const courseId = course._id || course.id;
                const isEnrolled = enrolledCourses.some((c) => (c._id || c.id) === courseId);

                return (
                  <div
                    key={courseId}
                    className="bg-[#12161F] border border-[#252C3A] hover:border-yellow-400/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl group"
                  >
                    <div>
                      {/* THUMBNAIL */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                        <img
                          src={course.thumbnail}
                          alt={course.courseName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-yellow-400 transition-colors">
                          {course.courseName}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.courseDescription}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-3">
                      {/* META (DURATION & SECTIONS) */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <FiClock size={13} />
                          <span>{course?.totalDuration || "0.0 Hours"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded border border-slate-500 flex items-center justify-center text-[8px] font-bold">≡</span>
                          <span>{course?.sections?.length || course?.courseContent?.length || 0} Sections</span>
                        </div>
                      </div>

                      {/* RATING */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-yellow-400">★ ★ ★ ★ ★</span>
                        <span className="text-slate-400 text-[11px] font-medium">0 (0)</span>
                      </div>

                      {/* PRICE */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {course?.pricing?.isOfferActive || (course?.originalPrice && Number(course?.originalPrice) > Number(course?.price)) ? (
                          <>
                            <span className="text-xs text-richblack-400 font-semibold line-through">
                              ₹{course?.pricing?.originalPrice || course?.originalPrice}
                            </span>
                            <span className="text-xl font-extrabold text-white">
                              ₹{course?.pricing?.finalPrice || course?.price}
                            </span>
                            {course?.pricing?.discountPercentage > 0 && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                                {course?.pricing?.discountPercentage}% OFF
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xl font-extrabold text-white">₹{course?.price || 0}</span>
                        )}
                      </div>

                      {/* ACTION BUTTONS (PREVIEW & ADD TO CART / BUY NOW) */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          onClick={() => navigate(`/courses/${courseId}`)}
                          className="flex-1 py-2 rounded-xl bg-richblack-800 border border-richblack-700 text-xs font-semibold text-white hover:bg-richblack-700 hover:border-richblack-500 transition-all duration-200 text-center"
                        >
                          Preview
                        </button>

                        {isEnrolled ? (
                          <button
                            onClick={() => navigate(`/dashboard/enrolled-courses`)}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all duration-200 text-center shadow-md"
                          >
                            Enrolled
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (token) {
                                dispatch(addToCart(course));
                              } else {
                                navigate('/login');
                              }
                            }}
                            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all duration-200 text-center shadow-md active:scale-95"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#12161F] border border-[#252C3A] rounded-2xl p-12 text-center text-slate-400">
              <p className="text-sm font-bold text-white">No Courses Available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
