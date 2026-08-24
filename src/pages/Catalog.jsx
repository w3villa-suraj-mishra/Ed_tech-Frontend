import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAllCourses, fetchCourseCategories } from '../services/operations/courseDetailsAPI';

const Catalog = () => {
  const navigate = useNavigate();
  const { categoryId: pathCategoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategoryParam = searchParams.get('category') || '';

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(pathCategoryId || queryCategoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, categoriesData] = await Promise.all([
          getAllCourses(),
          fetchCourseCategories()
        ]);
        
        if (coursesData && coursesData.length > 0) {
          setCourses(coursesData);
        }
        
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.log("Error fetching catalog data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const activeCategory = pathCategoryId || queryCategoryParam || 'all';
    setSelectedCategory(activeCategory);
  }, [pathCategoryId, queryCategoryParam]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (val === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: val });
    }
  };

  // Filter courses strictly by category and search query
  const filteredCourses = courses.filter((course) => {
    // Search query filter
    const matchesSearch = course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter
    if (!selectedCategory || selectedCategory === 'all') return true;

    const courseCatId = course.categoryId || course.category?._id || course.category?.id;
    const courseCatName = course.category?.name || '';
    const courseCatSlug = courseCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    return (
      String(courseCatId) === String(selectedCategory) ||
      courseCatSlug === String(selectedCategory).toLowerCase() ||
      courseCatName.toLowerCase() === String(selectedCategory).toLowerCase()
    );
  });

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-8 font-['Inter'] min-h-[80vh] bg-richblack-900 text-richblack-5">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-richblack-5 mb-4">Explore Our Course Catalog</h1>
        <p className="text-richblack-300 text-lg mb-8">Discover thousands of courses designed to help you advance your career in tech.</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-[600px] mx-auto">
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-6 py-4 rounded-full bg-richblack-800 border border-richblack-700 text-richblack-5 text-base shadow-sm outline-none transition-all focus:border-yellow-50 focus:ring-4 focus:ring-yellow-50/10"
          />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-6 py-4 rounded-full border border-richblack-700 text-richblack-5 text-base bg-richblack-800 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => {
              const catId = cat._id || cat.id;
              return (
                <option key={catId} value={catId}>
                  {cat.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-richblack-800 rounded-2xl overflow-hidden shadow-sm border border-richblack-700 flex flex-col">
              <div className="h-52 w-full bg-richblack-700 animate-pulse"></div>
              <div className="p-6">
                <div className="w-20 h-6 bg-richblack-700 rounded-full mb-4 animate-pulse"></div>
                <div className="h-6 bg-richblack-700 rounded-md mb-2 w-full animate-pulse"></div>
                <div className="h-6 bg-richblack-700 rounded-md w-3/5 mb-8 animate-pulse"></div>
                <div className="flex justify-between pt-4 border-t border-richblack-700">
                  <div className="h-4 bg-richblack-700 rounded-md w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-richblack-700 rounded-md w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map(course => (
            <div
              key={course._id || course.id}
              onClick={() => navigate(`/courses/${course._id || course.id}`)}
              className="bg-richblack-800 rounded-2xl overflow-hidden shadow-sm border border-richblack-700 transition-all hover:-translate-y-2 hover:shadow-xl flex flex-col cursor-pointer"
            >
              <div className="h-52 bg-gradient-to-br from-richblack-700 to-richblack-900 relative flex justify-end items-start p-4">
                {course.thumbnail && (
                   <img src={course.thumbnail} alt={course.courseName} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                )}
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider relative z-10">
                  {course.tag ? (typeof course.tag === 'string' && course.tag.startsWith('[') ? JSON.parse(course.tag)[0] : course.tag) : "New"}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-richblack-5 mb-6 leading-tight">{course.courseName}</h3>
                <div className="flex justify-between text-richblack-300 text-sm font-medium mb-6 pt-4 border-t border-richblack-700">
                  <span>⏱ {course.sections?.length || course.courseContent?.length || 0} Sections</span>
                  <span>💰 ₹{course.price}</span>
                  <span>👥 Active</span>
                </div>
                <button className="mt-auto w-full py-4 bg-transparent text-yellow-50 border-2 border-yellow-50 rounded-lg text-base font-bold transition-all hover:bg-yellow-50 hover:text-richblack-900">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-16 text-center max-w-xl mx-auto my-8 space-y-4">
          <div className="text-4xl">📚</div>
          <h3 className="text-2xl font-bold text-white">No Courses Available</h3>
          <p className="text-richblack-300 text-sm">
            There are currently no published courses under this category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchParams({});
              setSearchQuery('');
            }}
            className="mt-4 px-6 py-2.5 bg-yellow-50 text-richblack-900 font-bold rounded-xl hover:bg-yellow-100 transition-all text-xs"
          >
            Clear Filters & View All
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
