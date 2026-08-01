import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Common/Footer.jsx";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./components/core/Auth/Signup.jsx";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import ScrollToTop from "./components/Common/ScrollToTop.jsx";
import LoginForm from "./components/core/Auth/LoginForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Cart from "./components/core/Dashboard/Cart";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Settings from "./components/core/Dashboard/Settings/Index";
import AddCourse from "./components/core/Dashboard/AddCourse";
import MyCourses from "./components/core/Dashboard/MyCourses";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import LiveClass from "./pages/LiveClass.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import ViewCourse from "./pages/ViewCourse.jsx";
import VideoDetails from "./components/core/ViewCourse/videoDetails.jsx";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "./services/operations/profileAPI";
import { useNavigate } from "react-router-dom";


function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getUserDetails(token, navigate));
    }
  }, []);

  return (
    <div className="min-h-screen bg-richblack-900">
      <ScrollToTop />
      <Toaster position="top-right" />
      <Navbar />
      <div className="main-content bg-richblack-900" style={{ flex: 1 }}>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:categoryId" element={<Catalog />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/live-class/:courseId" element={<LiveClass />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="cart" element={<Cart />} />
            <Route path="enrolled-courses" element={<EnrolledCourses />} />
            <Route path="settings" element={<Settings />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="instructor" element={<InstructorDashboard />} />
          </Route>
          <Route path="/verify-otp" element={<VerifyOtp/>} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/view-course/:courseId" element={<ViewCourse />}>
            <Route
              path="section/:sectionId/sub-section/:subSectionId"
              element={<VideoDetails />}
            />
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;