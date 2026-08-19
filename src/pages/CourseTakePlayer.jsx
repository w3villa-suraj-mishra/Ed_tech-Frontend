import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";
import {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
  updateCompletedLectures,
} from "../services/slices/viewCourseSlice";
import { markLectureAsComplete } from "../services/operations/courseDetailsAPI";
import {
  FiArrowLeft,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiPlayCircle,
  FiLock,
  FiAward,
  FiExternalLink,
} from "react-icons/fi";
import { FaComments } from "react-icons/fa6";

const { COURSE_DETAILS_API } = courseEndpoints;

const CourseTakePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);

  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state) => state.viewCourse);

  // Fetch course details
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const res = await apiConnector(
          "GET",
          `${COURSE_DETAILS_API}?courseId=${courseId}`,
          null,
          { Authorization: `Bearer ${token}` }
        );

        if (res?.data?.success) {
          const courseData = res.data.data;
          dispatch(setEntireCourseData(courseData));
          dispatch(setCourseSectionData(courseData.courseContent || []));

          const totalLectures = (courseData.courseContent || []).reduce(
            (acc, sec) => acc + (sec.subSection?.length || 0),
            0
          );
          dispatch(setTotalNoOfLectures(totalLectures));
          dispatch(
            setCompletedLectures((courseData.completedVideos || []).map(String))
          );

          // Default active section and current lecture
          if (courseData.courseContent && courseData.courseContent.length > 0) {
            const firstSec = courseData.courseContent[0];
            setActiveSectionId(firstSec._id);
            if (firstSec.subSection && firstSec.subSection.length > 0) {
              setCurrentLecture(firstSec.subSection[0]);
              setCurrentSectionIndex(0);
              setCurrentLectureIndex(0);
            }
          }
        }
      } catch (err) {
        console.error("Error loading take course data:", err);
      }
      setLoading(false);
    };

    if (courseId) fetchCourseData();
  }, [courseId, token, dispatch]);

  const selectLecture = (secIndex, lecIndex, sectionId, lecture) => {
    setCurrentSectionIndex(secIndex);
    setCurrentLectureIndex(lecIndex);
    setActiveSectionId(sectionId);
    setCurrentLecture(lecture);
  };

  const isCompleted = (lecId) => completedLectures.includes(String(lecId));

  // Access rules: Free users can only view first 2 videos
  const userPlan = courseEntireData?.userPlan || "gold";
  const getLectureGlobalIndex = (sIdx, lIdx) => {
    let count = 0;
    for (let i = 0; i < sIdx; i++) {
      count += courseSectionData[i]?.subSection?.length || 0;
    }
    return count + lIdx;
  };

  const isLectureLocked = (sIdx, lIdx) => {
    if (userPlan === "free") {
      const gIndex = getLectureGlobalIndex(sIdx, lIdx);
      return gIndex >= 2;
    }
    return false;
  };

  // Complete and Continue handler
  const handleCompleteAndContinue = async () => {
    if (!currentLecture) return;

    if (!isCompleted(currentLecture._id)) {
      try {
        const res = await markLectureAsComplete(
          { courseId, subSectionId: currentLecture._id },
          token
        );
        if (res) {
          dispatch(updateCompletedLectures(String(currentLecture._id)));
        }
      } catch (err) {
        console.error("Failed to mark completed:", err);
      }
    }

    // Navigate to next lecture
    const currentSubSections =
      courseSectionData[currentSectionIndex]?.subSection || [];
    if (currentLectureIndex < currentSubSections.length - 1) {
      const nextLec = currentSubSections[currentLectureIndex + 1];
      selectLecture(
        currentSectionIndex,
        currentLectureIndex + 1,
        activeSectionId,
        nextLec
      );
    } else if (currentSectionIndex < courseSectionData.length - 1) {
      const nextSec = courseSectionData[currentSectionIndex + 1];
      setActiveSectionId(nextSec._id);
      if (nextSec.subSection && nextSec.subSection.length > 0) {
        selectLecture(
          currentSectionIndex + 1,
          0,
          nextSec._id,
          nextSec.subSection[0]
        );
      }
    }
  };

  // Previous lecture handler
  const handlePrevious = () => {
    if (currentLectureIndex > 0) {
      const prevLec =
        courseSectionData[currentSectionIndex].subSection[currentLectureIndex - 1];
      selectLecture(
        currentSectionIndex,
        currentLectureIndex - 1,
        activeSectionId,
        prevLec
      );
    } else if (currentSectionIndex > 0) {
      const prevSec = courseSectionData[currentSectionIndex - 1];
      const prevSubSections = prevSec.subSection || [];
      setActiveSectionId(prevSec._id);
      if (prevSubSections.length > 0) {
        selectLecture(
          currentSectionIndex - 1,
          prevSubSections.length - 1,
          prevSec._id,
          prevSubSections[prevSubSections.length - 1]
        );
      }
    }
  };

  const isFirstLecture = currentSectionIndex === 0 && currentLectureIndex === 0;

  const progressPercentage =
    totalNoOfLectures > 0
      ? Math.round((completedLectures.length / totalNoOfLectures) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentLocked = isLectureLocked(currentSectionIndex, currentLectureIndex);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-['Inter',sans-serif]">
      {/* TOP HEADER */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/t/u/activeCourses")}
            className="p-2 rounded-lg hover:bg-slate-100 text-indigo-700 transition"
            title="Back to Active Courses"
          >
            <FiArrowLeft size={20} />
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 text-indigo-700 transition"
            title="Toggle Curriculum Sidebar"
          >
            <FiMenu size={20} />
          </button>

          <h1 className="font-bold text-base text-slate-900 line-clamp-1 max-w-md">
            {courseEntireData?.courseName || "Course Player"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition">
            <FaComments size={14} />
            <span>Discuss (24)</span>
          </button>

          <button
            onClick={handlePrevious}
            disabled={isFirstLecture}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isFirstLecture
                ? "text-slate-300 cursor-not-allowed"
                : "text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <FiChevronLeft size={16} /> Previous
          </button>

          <button
            onClick={handleCompleteAndContinue}
            className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Complete and Continue <FiChevronRight size={16} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT CURRICULUM SIDEBAR */}
        {sidebarOpen && (
          <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 select-none overflow-y-auto">
            {/* PROGRESS SECTION */}
            <div className="p-5 border-b border-slate-200 space-y-2">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-700">
                {progressPercentage}% completed{" "}
                <span className="font-normal text-slate-400">in 79h 19m</span>
              </p>
            </div>

            {/* DISCUSSIONS LINK */}
            <div className="px-5 py-3 border-b border-slate-200">
              <button className="flex items-center justify-between w-full text-xs font-bold text-indigo-700 hover:underline">
                <span className="flex items-center gap-2">
                  <FaComments size={15} /> Course Discussions
                </span>
                <FiExternalLink size={14} />
              </button>
            </div>

            {/* CURRICULUM SECTIONS */}
            <div className="flex-1 overflow-y-auto">
              {courseSectionData.map((section, sIdx) => {
                const isOpen = activeSectionId === section._id;
                return (
                  <div key={section._id} className="border-b border-slate-100">
                    <button
                      onClick={() =>
                        setActiveSectionId(isOpen ? "" : section._id)
                      }
                      className="w-full px-5 py-3 text-left font-bold text-xs text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="line-clamp-1">{section.sectionName}</span>
                      <span className="text-slate-400 font-normal text-[10px]">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="bg-slate-50/50 py-1">
                        {section.subSection?.map((lecture, lIdx) => {
                          const active =
                            currentSectionIndex === sIdx &&
                            currentLectureIndex === lIdx;
                          const completed = isCompleted(lecture._id);
                          const locked = isLectureLocked(sIdx, lIdx);

                          return (
                            <button
                              key={lecture._id}
                              disabled={locked}
                              onClick={() =>
                                selectLecture(sIdx, lIdx, section._id, lecture)
                              }
                              className={`w-full text-left px-7 py-2.5 flex items-center justify-between text-xs transition ${
                                active
                                  ? "bg-white font-bold text-indigo-600 border-l-4 border-indigo-600 shadow-sm"
                                  : "text-slate-600 hover:bg-slate-100"
                              } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-center gap-2.5 line-clamp-1 pr-2">
                                {locked ? (
                                  <FiLock className="text-amber-500 shrink-0" size={14} />
                                ) : completed ? (
                                  <FiCheckCircle className="text-emerald-500 shrink-0" size={14} />
                                ) : (
                                  <FiPlayCircle className="text-indigo-400 shrink-0" size={14} />
                                )}
                                <span className="line-clamp-1">
                                  {lecture.title}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CERTIFICATE LINK */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                disabled={progressPercentage < 100}
                className={`w-full flex items-center gap-2 text-xs font-bold p-2.5 rounded-lg border transition ${
                  progressPercentage >= 100
                    ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <FiAward size={16} /> Certificate
              </button>
            </div>
          </aside>
        )}

        {/* MAIN PLAYER AREA */}
        <main className="flex-1 bg-slate-900 flex flex-col justify-between overflow-y-auto">
          {currentLocked ? (
            /* LOCKED STATE */
            <div className="flex-1 flex flex-col items-center justify-center text-white p-8 space-y-4">
              <FiLock size={48} className="text-amber-400" />
              <h2 className="text-lg font-bold">This lesson is locked</h2>
              <p className="text-xs text-slate-300 max-w-md text-center">
                Your Free plan allows access to the first 2 lessons. Upgrade to Silver or Gold to unlock the full course curriculum.
              </p>
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-lg shadow transition"
              >
                Upgrade Plan
              </button>
            </div>
          ) : currentLecture?.videoUrl ? (
            /* VIDEO PLAYER */
            <div className="flex-1 flex items-center justify-center bg-black">
              <video
                key={currentLecture._id}
                src={currentLecture.videoUrl}
                controls
                autoPlay
                className="w-full max-h-[calc(100vh-10rem)] object-contain"
                onEnded={handleCompleteAndContinue}
              />
            </div>
          ) : (
            /* NO VIDEO / PLACEHOLDER */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-2">
              <FiPlayCircle size={48} />
              <p className="text-sm font-semibold">Select a lecture to start learning</p>
            </div>
          )}

          {/* LESSON DETAILS BELOW PLAYER */}
          <div className="p-6 bg-white border-t border-slate-200 space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              {currentLecture?.title || "Lesson Overview"}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
              {currentLecture?.description ||
                courseEntireData?.courseDescription ||
                "No additional lesson description available."}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseTakePlayer;
