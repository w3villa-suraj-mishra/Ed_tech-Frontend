import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserEnrolledCourses } from "../services/operations/profileAPI";
import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import {
  FaGraduationCap,
  FaBolt,
  FaBookmark,
  FaCommentDots,
  FaStore,
} from "react-icons/fa6";

const ActiveCoursesPage = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      if (token) {
        const enrolled = await getUserEnrolledCourses(token);
        if (enrolled && Array.isArray(enrolled)) {
          setCourses(enrolled);
        } else {
          setCourses([]);
        }
      }
    } catch (err) {
      console.error("Error loading active courses:", err);
      setError("Unable to load active courses.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const filteredCourses = courses.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      c.courseName?.toLowerCase().includes(term) ||
      c.courseDescription?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Inter',sans-serif] text-slate-800">
      {/* NARROW ICON SIDEBAR (Matches Reference Screenshot) */}
      <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-5 shrink-0 select-none">
        {/* LOGO ICON */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md mb-8">
          W3
        </div>

        {/* NAVIGATION ICONS */}
        <nav className="flex flex-col gap-6 w-full items-center text-slate-400">
          <button
            onClick={() => navigate("/t/u/activeCourses")}
            title="Active Courses"
            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm transition-all"
          >
            <FaGraduationCap size={18} />
          </button>

          {/* <button
            onClick={() => navigate("/dashboard/buy-courses")}
            title="Explore / Buy Courses"
            className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <FaStore size={17} />
          </button>

          <button
            onClick={() => navigate("/dashboard/guided-path")}
            title="Guided Path"
            className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <FaBolt size={16} />
          </button> */}

          {/* <button
            onClick={() => navigate("/dashboard/articles")}
            title="Saved / Articles"
            className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <FaBookmark size={16} />
          </button>

          <button
            onClick={() => navigate("/dashboard/help")}
            title="Support"
            className="p-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <FaCommentDots size={16} />
          </button> */}
        </nav>

        {/* BOTTOM USER AVATAR */}
        <div className="mt-auto pt-6 border-t border-slate-100 w-full flex justify-center">
          <button
            onClick={() => navigate("/dashboard/my-profile")}
            className="text-pink-500 hover:scale-105 transition-transform"
            title="My Profile"
          >
            <FaUserCircle size={24} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-white p-8 md:p-10 max-w-7xl">
        {/* HEADER TITLE */}
        <div className="pb-4 border-b border-slate-200 mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Active Courses
          </h1>
        </div>

        {/* TABS (Active / Archived) */}
        <div className="flex items-center gap-8 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "active"
                ? "text-indigo-600 font-bold border-b-2 border-indigo-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setActiveTab("archived")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "archived"
                ? "text-indigo-600 font-bold border-b-2 border-indigo-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Archived
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-8 max-w-4xl">
          <input
            type="text"
            placeholder="Search for a chapter, course or package"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-4 pr-12 text-sm text-slate-800 bg-white border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
          />
          <button className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-slate-700 hover:text-indigo-600">
            <FiSearch size={18} />
          </button>
        </div>

        {/* CONTENT STATES */}
        {loading ? (
          /* SKELETON LOADING */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-200 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-2 bg-slate-200 rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="p-10 text-center border border-red-200 bg-red-50 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              onClick={fetchCourses}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : activeTab === "archived" ? (
          /* ARCHIVED TAB EMPTY STATE */
          <div className="p-12 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-500">
            <p className="text-sm font-medium">No archived courses found.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          /* EMPTY ACTIVE STATE */
          <div className="p-12 text-center border border-slate-200 rounded-xl bg-slate-50 space-y-4">
            <p className="text-base font-semibold text-slate-700">
              No Active Courses
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't enrolled in any courses yet. Explore our catalog to start learning today!
            </p>
            <button
              onClick={() => navigate("/dashboard/buy-courses")}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow hover:bg-indigo-700 transition-all"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          /* COURSE CARDS GRID (3-column on Desktop) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const courseId = course._id || course.id;
              const isPackage = course.isPackage || course.type === "package";
              const instructorName =
                course.instructorName ||
                (typeof course.instructor === "object"
                  ? `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.trim()
                  : course.instructor) ||
                "Instructor";

              const progress = course.progressPercentage || 0;

              // Access / Validity label
              let validLabel = "Valid Till: Lifetime";
              if (course.plan === "free") {
                validLabel = "Free Access (2 Videos)";
              } else if (course.plan === "silver") {
                if (course.expiresAt) {
                  const d = new Date(course.expiresAt);
                  validLabel = `Valid Till: ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                } else {
                  validLabel = "Valid Till: 1 Year";
                }
              }

              return (
                <div
                  key={courseId}
                  onClick={() => navigate(`/s/courses/${courseId}/take`)}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* THUMBNAIL & PACKAGE BADGE */}
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                      {isPackage && (
                        <span className="absolute top-2 left-2 z-10 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm tracking-wide">
                          PACKAGE
                        </span>
                      )}
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {course.courseName}
                      </h3>

                      <p className="text-xs font-medium text-slate-400">
                        {instructorName}
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS & VALIDITY */}
                  <div className="p-4 pt-0 space-y-2">
                    {/* PROGRESS BAR */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="font-bold text-indigo-600">
                        {progress}% completed
                      </span>
                      <span className="text-slate-400 font-medium">
                        {validLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActiveCoursesPage;
