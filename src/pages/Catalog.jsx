import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllCourses, fetchCourseCategories } from "../services/operations/courseDetailsAPI";
import { getUserEnrolledCourses } from "../services/operations/profileAPI";
import { addToCart } from "../services/slices/cartSlice";
import {
  VscSearch,
  VscListFilter,
  VscChevronLeft,
  VscChevronRight,
  VscBook,
  VscClock,
  VscStarFull,
  VscArrowRight,
  VscChevronDown
} from "react-icons/vsc";

const Catalog = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categoryId: pathCategoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategoryParam = searchParams.get("category") || "";

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(pathCategoryId || queryCategoryParam || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const querySearch = searchParams.get("search");
    if (querySearch !== null) {
      setSearchQuery(querySearch);
    }
  }, [searchParams]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  // 1. Fetch courses & categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesData, categoriesData] = await Promise.all([
          getAllCourses(),
          fetchCourseCategories(),
        ]);

        if (coursesData && Array.isArray(coursesData)) {
          setCourses(coursesData);
        }

        if (categoriesData && Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        // If user logged in, fetch enrolled courses
        if (token) {
          const enrolled = await getUserEnrolledCourses(token);
          if (enrolled && Array.isArray(enrolled)) {
            const eIds = new Set(enrolled.map((c) => String(c._id || c.id)));
            setEnrolledCourseIds(eIds);
          }
        }
      } catch (error) {
        console.error("Error fetching catalog data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Sync category param
  useEffect(() => {
    const activeCategory = pathCategoryId || queryCategoryParam || "all";
    setSelectedCategory(activeCategory);
    setCurrentPage(1);
  }, [pathCategoryId, queryCategoryParam]);

  // Handle Category selection
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    if (catId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
  };

  // 2. Filter & Sort Logic
  const filteredCourses = courses.filter((course) => {
    // Search query filter
    const matchesSearch =
      course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter
    if (!selectedCategory || selectedCategory === "all") return true;

    const courseCatId = course.categoryId || course.category?._id || course.category?.id;
    const courseCatName = course.category?.name || "";
    const courseCatSlug = courseCatName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    return (
      String(courseCatId) === String(selectedCategory) ||
      courseCatSlug === String(selectedCategory).toLowerCase() ||
      courseCatName.toLowerCase() === String(selectedCategory).toLowerCase()
    );
  });

  // Sort Courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating") return (b.averageRating || 4.5) - (a.averageRating || 4.5);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Pagination Math
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage) || 1;
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Dynamic Button Action Handler based on User state
  const renderAccessButton = (course) => {
    const courseId = String(course._id || course.id);
    const isEnrolled = enrolledCourseIds.has(courseId);
    const isFree = Number(course.price) === 0;

    if (isEnrolled) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/view-course/${courseId}/section/${course.courseContent?.[0]?._id || "1"}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id || "1"}`);
          }}
          className="w-full py-3 bg-[#EFF6FF] border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all hover:bg-blue-600 hover:border-blue-600 hover:text-white flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Continue Learning</span>
          <VscArrowRight />
        </button>
      );
    }

    if (isFree) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!token) {
              navigate("/login");
            } else {
              navigate(`/courses/${courseId}`);
            }
          }}
          className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all hover:bg-emerald-600 hover:border-emerald-600 hover:text-white flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Start Learning</span>
          <VscArrowRight />
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!token) {
            navigate("/login");
          } else {
            dispatch(addToCart(course));
            navigate("/dashboard/cart");
          }
        }}
        className="w-full py-3 bg-white text-[#4F8FF7] border border-blue-200 rounded-xl text-xs font-bold transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm flex items-center justify-center gap-1.5"
      >
        <span>Enroll Now</span>
        <VscArrowRight />
      </button>
    );
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans flex flex-col justify-between">
      
      <div className="max-w-[1260px] mx-auto py-12 px-4 sm:px-6 w-full space-y-10">
        
        {/* 1. PAGE HEADER */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Explore Our <span className="text-[#4F8FF7]">Course Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
            Discover thousands of courses designed to help you advance your career in tech.
          </p>
        </div>

        {/* 2. SEARCH & CATEGORY SELECTOR DROPDOWN */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
          <div className="relative w-full sm:flex-1 group">
            <VscSearch className="absolute left-4 top-3.5 text-gray-400 text-sm group-focus-within:text-[#3B82F6] transition-colors" />
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>

          <div className="relative w-full sm:w-56" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm text-gray-800 outline-none cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm font-medium"
            >
              <span className="truncate pr-2">
                {selectedCategory === "all" ? "All Categories" : categories.find(c => String(c._id || c.id) === String(selectedCategory))?.name || "All Categories"}
              </span>
              <VscChevronDown className={`text-gray-400 text-lg transition-transform duration-200 shrink-0 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-premium-light border border-gray-200 text-gray-700 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                  <div 
                    onClick={() => { handleCategorySelect("all"); setIsCategoryDropdownOpen(false); }}
                    className={`px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors ${selectedCategory === "all" ? "bg-[#DBEAFE] text-[#3B82F6] font-bold" : "hover:bg-[#EFF6FF] hover:text-[#3B82F6] text-gray-600"}`}
                  >
                    All Categories
                  </div>
                  {categories.map((cat) => {
                    const catId = cat._id || cat.id;
                    const isSelected = String(selectedCategory) === String(catId);
                    return (
                      <div
                        key={catId}
                        onClick={() => { handleCategorySelect(catId); setIsCategoryDropdownOpen(false); }}
                        className={`px-4 py-2.5 text-sm cursor-pointer rounded-xl transition-colors ${isSelected ? "bg-[#DBEAFE] text-[#3B82F6] font-bold" : "hover:bg-[#EFF6FF] hover:text-[#3B82F6] text-gray-600"}`}
                      >
                        {cat.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>



        {/* 4. COURSE GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4 animate-pulse">
                <div className="h-44 w-full bg-gray-200 rounded-2xl" />
                <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 rounded-md w-full" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : currentCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {currentCourses.map((course) => {
              const courseId = course._id || course.id;
              const origPrice = Number(course?.pricing?.originalPrice || course?.originalPrice || course?.price || 0);
              const currentPrice = Number(course?.pricing?.finalPrice || course?.price || 0);
              const discountPct = origPrice > currentPrice ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : 0;
              const rating = course.averageRating || 4.5;
              const categoryName = course.category?.name || "Development";
              const totalSections = course.courseContent?.length || course.sections?.length || 2;

              return (
                <div
                  key={courseId}
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="bg-white border border-gray-100 hover:border-blue-200 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Course Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase bg-white/90 backdrop-blur-md text-gray-800 border border-white/50 px-2.5 py-1 rounded-lg shadow-sm">
                        {categoryName}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1 group-hover:text-[#3B82F6] transition-colors">
                        {course.courseName}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {course.courseDescription}
                      </p>

                      {/* Course Metadata */}
                      <div className="flex items-center gap-4 text-[11px] font-medium text-gray-500 pt-1">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <VscBook className="text-[#3B82F6]" />
                          <span>{totalSections} Sections</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <span className="text-orange-500">🔥</span> 
                          <span>{course.studentsEnroled?.length || 8569} Enrolled</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Access Button */}
                  <div className="p-5 pt-0 space-y-4">
                    {/* Pricing */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <VscStarFull className="text-amber-400 text-sm" />
                        <span className="text-gray-900 font-bold text-sm">{rating}</span>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        {discountPct > 0 && (
                          <span className="text-xs font-semibold text-gray-400 line-through">₹{origPrice.toLocaleString()}</span>
                        )}
                        <span className="text-xl font-black text-gray-900">
                          ₹{currentPrice.toLocaleString()}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-[10px] font-extrabold bg-[#DBEAFE] text-blue-700 px-1.5 py-0.5 rounded-md">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {renderAccessButton(course)}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">No Courses Found</h3>
            <p className="text-sm text-gray-500">
              We couldn't find any courses matching your current search or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchParams({});
                setSearchQuery("");
              }}
              className="px-6 py-2.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md inline-block"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* 5. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-[#EFF6FF] flex items-center justify-center text-gray-500 hover:text-[#3B82F6] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
            >
              <VscChevronLeft className="text-lg" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    isActive
                      ? "bg-blue-600 text-white shadow-blue-500/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:text-[#3B82F6] hover:border-blue-300 hover:bg-[#EFF6FF]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-[#EFF6FF] flex items-center justify-center text-gray-500 hover:text-[#3B82F6] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
            >
              <VscChevronRight className="text-lg" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default Catalog;
