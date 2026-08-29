import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { courseEndpoints } from '../services/apis';
import CourseAccordionBar from '../components/core/Course/CourseAccordionBar';
import CourseDetailsCard from '../components/core/Course/CourseDetailsCard';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import { BsPlayCircle, BsClock, BsBook } from 'react-icons/bs';
import { FiCheckCircle } from 'react-icons/fi';
import { HiOutlineTag } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { buyCourse } from '../services/operations/studentFeaturesAPI';

const { COURSE_DETAILS_API } = courseEndpoints;

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : null;
        const response = await apiConnector('GET', `${COURSE_DETAILS_API}?courseId=${courseId}`, null, headers);
        if (response?.data?.success) {
          setCourse(response.data.data);
        } else {
          toast.error('Could not fetch course details');
        }
      } catch (err) {
        toast.error('Error loading course');
      }
      setLoading(false);
    };
    if (courseId) fetchCourseDetails();
  }, [courseId, token]);

  const handleActive = (id) => {
    setIsActive(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleBuyCourse = (plan = 'gold') => {
    if (!token) {
      setConfirmationModal({
        text1: 'You are not logged in!',
        text2: 'Please login to purchase or access this course.',
        btn1Text: 'Login',
        btn2Text: 'Cancel',
        btn1Handler: () => navigate('/login'),
        btn2Handler: () => setConfirmationModal(null),
      });
      return;
    }
    buyCourse(token, [courseId], user, navigate, dispatch, plan);
  };

  const getTotalLectures = () => {
    return course?.courseContent?.reduce((acc, sec) => acc + (sec.subSection?.length || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-richblack-900">
        <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-richblack-900">
        <p className="text-richblack-300 text-lg">Course not found.</p>
      </div>
    );
  }

  const isEnrolled = course?.studentsEnrolled?.includes(user?._id);

  return (
    <div className="min-h-screen bg-richblack-900 font-['Inter']">

      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-br from-richblack-800 to-richblack-900 border-b border-richblack-700">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:pr-[400px]">

          <button
            onClick={() => navigate('/dashboard/courses')}
            className="flex items-center gap-2 text-xs text-richblack-300 hover:text-white transition mb-6"
          >
            ← Back to My Courses
          </button>

          {/* STATUS BADGE */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-5
            ${course.status === 'Published'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`
          }>
            <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'Published' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
            {course.status}
          </span>

          <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            {course.courseName}
          </h1>

          <p className="text-richblack-200 text-lg mb-6 max-w-2xl leading-relaxed">
            {course.courseDescription}
          </p>

          {/* META */}
          <div className="flex flex-wrap gap-6 text-sm text-richblack-300">
            <div className="flex items-center gap-2">
              <BsBook className="text-yellow-400" />
              <span>{getTotalLectures()} Lectures</span>
            </div>
            <div className="flex items-center gap-2">
              <BsClock className="text-yellow-400" />
              <span>{course.totalDuration || '0m'} Total Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <BsClock className="text-yellow-400" />
              <span>{course.courseContent?.length || 0} Sections</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineTag className="text-yellow-400" />
              <span>{course.category?.name || 'General'}</span>
            </div>
          </div>
        </div>

        {/* FLOATING COURSE CARD */}
        <div className="lg:absolute lg:right-8 lg:top-8 lg:w-[360px] px-6 lg:px-0 mt-8 lg:mt-0">
          <CourseDetailsCard
            course={course}
            setConfirmationModal={setConfirmationModal}
            handleBuyCourse={handleBuyCourse}
          />
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:pr-[400px] space-y-12">

        {/* WHAT YOU WILL LEARN */}
        {course.whatYouWillLearn && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">What You'll Learn</h2>
            <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] p-[1px] rounded-2xl">
              <div className="bg-richblack-800 rounded-2xl p-8">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.whatYouWillLearn.split('.').filter(s => s.trim()).map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-richblack-50 text-sm">
                      <FiCheckCircle className="mt-0.5 shrink-0 text-yellow-400" size={18} />
                      <span>{point.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* COURSE CONTENT */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Course Content</h2>
            <button
              onClick={() => setIsActive(isActive.length > 0 ? [] : course.courseContent.map(s => s._id))}
              className="text-sm text-yellow-400 hover:text-yellow-300 transition"
            >
              {isActive.length > 0 ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          <div className="space-y-3">
            {course.courseContent?.map((section) => (
              <CourseAccordionBar
                key={section._id}
                course={section}
                isActive={isActive}
                handleActive={handleActive}
                courseId={course._id}
              />
            ))}
          </div>
        </section>

        {/* REQUIREMENTS */}
        {course.instructions && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Requirements</h2>
            <ul className="space-y-2">
              {(Array.isArray(course.instructions) 
                ? course.instructions 
                : typeof course.instructions === 'string' 
                  ? course.instructions.split(',').filter(i => i.trim())
                  : []
              ).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-richblack-200 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* START LEARNING */}
        {isEnrolled && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                const firstSection = course.courseContent?.[0];
                const firstLecture = firstSection?.subSection?.[0];
                if (firstSection && firstLecture) {
                  navigate(`/view-course/${course._id}/section/${firstSection._id}/sub-section/${firstLecture._id}`);
                }
              }}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg hover:scale-105 transition-all shadow-[0_0_25px_rgba(251,191,36,0.3)]"
            >
              <BsPlayCircle size={22} />
              Continue Learning
            </button>
          </div>
        )}
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default CourseDetails;
