import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { updateDisplayPicture, updateProfile, changePassword, deleteProfile } from "../../../../services/operations/SettingsAPI";
import { apiConnector } from "../../../../services/apiConnector";
import { notificationEndpoints } from "../../../../services/apis";
import toast from "react-hot-toast";

import {
  VscPerson,
  VscLock,
  VscSettingsGear,
  VscBell,
  VscCreditCard,
  VscAccount,
  VscTrash,
  VscEye,
  VscEyeClosed,
  VscLocation
} from "react-icons/vsc";
import { FiUpload } from "react-icons/fi";

const LOCATIONIQ_KEY = "pk.21e378c598051d070ba51bb36833ddbb";
const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"];

export default function Settings() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  // 1. Profile Picture State
  const [loadingPic, setLoadingPic] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(null);
  const fileInputRef = useRef(null);

  // 2. Profile Information State
  const [addressInput, setAddressInput] = useState(user?.additionalDetails?.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [locating, setLocating] = useState(false);
  const [coordinates, setCoordinates] = useState(
    user?.additionalDetails?.latitude && user?.additionalDetails?.longitude
      ? { lat: user.additionalDetails.latitude, lon: user.additionalDetails.longitude }
      : null
  );

  // 3. Password State
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // 4. Preferences Toggles State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [courseReminders, setCourseReminders] = useState(true);

  // 5. Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form Hooks
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  // Profile Pic Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setPreviewSource(reader.result);
    }
  };

  const handleFileUpload = () => {
    if (!imageFile) return;
    setLoadingPic(true);
    const formData = new FormData();
    formData.append("displayPicture", imageFile);
    dispatch(updateDisplayPicture(token, formData)).then(() => setLoadingPic(false));
  };

  // Location Autocomplete & Geolocation Handlers
  const handleAddressChange = async (val) => {
    setAddressInput(val);
    if (val.trim().length > 2) {
      try {
        const res = await fetch(
          `https://api.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(val)}&limit=5&format=json`
        );
        const data = await res.json();
        if (Array.isArray(data)) setSuggestions(data);
      } catch (err) {
        console.error("LocationIQ error", err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoordinates({ lat, lon });
        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();
          if (data?.display_name) setAddressInput(data.display_name);
        } catch (err) {
          console.error("Reverse geocoding error", err);
        }
        setLocating(false);
      },
      (err) => {
        toast.error("Could not detect location.");
        setLocating(false);
      }
    );
  };

  const submitProfileForm = async (data) => {
    const payload = {
      ...data,
      address: addressInput,
      latitude: coordinates?.lat,
      longitude: coordinates?.lon,
    };
    dispatch(updateProfile(token, payload));
  };

  const submitPasswordForm = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error("New Passwords do not match!");
      return;
    }
    dispatch(changePassword(token, data)).then(() => resetPasswordForm());
  };

  const handleDeleteUserAccount = () => {
    dispatch(deleteProfile(token, navigate));
  };

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto pb-10">
      
      {/* 1. HEADER TITLE */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-richblack-300 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* 2. NAVIGATION TABS (Matching screenshot capsule style) */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "profile", label: "Profile", icon: VscPerson },
          { id: "security", label: "Security", icon: VscLock },
          { id: "preferences", label: "Preferences", icon: VscSettingsGear },
          { id: "notifications", label: "Notifications", icon: VscBell },
          { id: "billing", label: "Billing", icon: VscCreditCard },
          { id: "account", label: "Account", icon: VscAccount },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 text-xs font-bold transition-all relative pb-2 whitespace-nowrap ${
                activeTab === tab.id ? "text-purple-400" : "text-richblack-400 hover:text-white"
              }`}
            >
              <Icon className="text-sm" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. PROFILE PICTURE CARD */}
      <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.08)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/40 bg-purple-900/30 shrink-0">
            <img
              src={previewSource || user?.image}
              alt={user?.firstName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{user?.firstName} {user?.lastName}</h2>
            <p className="text-xs text-richblack-300">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
              {user?.accountType} Student
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
          />
          {imageFile && (
            <button
              onClick={() => {
                setImageFile(null);
                setPreviewSource(null);
              }}
              className="px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-500/20 text-purple-300 text-xs font-semibold hover:bg-purple-600 hover:text-white transition-all"
            >
              Remove
            </button>
          )}
          <button
            onClick={() => {
              if (imageFile) {
                handleFileUpload();
              } else {
                fileInputRef.current.click();
              }
            }}
            disabled={loadingPic}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2"
          >
            <FiUpload className="text-sm" />
            <span>{loadingPic ? "Uploading..." : imageFile ? "Upload New" : "Select Image"}</span>
          </button>
        </div>
      </div>

      {/* 4. PROFILE INFORMATION FORM */}
      {(activeTab === "profile" || activeTab === "account") && (
        <form onSubmit={handleSubmitProfile(submitProfileForm)} className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 space-y-6 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <VscPerson className="text-purple-400 text-lg" />
            <h2 className="text-base font-bold text-white">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs text-richblack-300 font-semibold">First Name</label>
              <input
                type="text"
                defaultValue={user?.firstName}
                {...registerProfile("firstName", { required: true })}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-richblack-300 font-semibold">Last Name</label>
              <input
                type="text"
                defaultValue={user?.lastName}
                {...registerProfile("lastName", { required: true })}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-richblack-300 font-semibold">Date of Birth</label>
              <input
                type="date"
                defaultValue={user?.additionalDetails?.dateOfBirth}
                {...registerProfile("dateOfBirth")}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-richblack-300 font-semibold">Gender</label>
              <select
                defaultValue={user?.additionalDetails?.gender || "Male"}
                {...registerProfile("gender")}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {genders.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-richblack-300 font-semibold">Contact Number</label>
              <input
                type="tel"
                placeholder="+91 12345 67890"
                defaultValue={user?.additionalDetails?.contactNumber}
                {...registerProfile("contactNumber")}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-richblack-300 font-semibold">About / Bio</label>
              <input
                type="text"
                placeholder="Passionate learner exploring new technologies."
                defaultValue={user?.additionalDetails?.about}
                {...registerProfile("about")}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Address & Geolocation field matching screenshot */}
          <div className="space-y-2 pt-2">
            <label className="text-xs text-richblack-300 font-semibold flex items-center gap-1">
              <VscLocation className="text-purple-400" />
              <span>Address (Auto-suggest powered by LocationIQ)</span>
            </label>

            <div className="relative flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Sector 63, Block A, Noida, Uttar Pradesh 201301, India"
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)] disabled:opacity-50"
              >
                <VscLocation />
                <span>{locating ? "Locating..." : "Update Location"}</span>
              </button>

              {/* Suggestions Popup */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-50 w-full mt-1 bg-[#141728] border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setAddressInput(item.display_name);
                        setCoordinates({ lat: item.lat, lon: item.lon });
                        setSuggestions([]);
                      }}
                      className="p-3 text-xs text-richblack-200 hover:bg-purple-600 hover:text-white cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                    >
                      📍 {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate("/dashboard/my-profile")}
              className="px-5 py-2.5 rounded-xl bg-[#141728] hover:bg-white/5 text-richblack-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* 5. CHANGE PASSWORD SECTION */}
      {(activeTab === "security" || activeTab === "profile") && (
        <form onSubmit={handleSubmitPassword(submitPasswordForm)} className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 space-y-6 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <VscLock className="text-purple-400 text-lg" />
            <div>
              <h2 className="text-base font-bold text-white">Change Password</h2>
              <p className="text-[11px] text-richblack-400">Update your password to keep your account secure.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1 relative">
              <label className="text-xs text-richblack-300 font-semibold">Current Password</label>
              <input
                type={showOldPass ? "text" : "password"}
                placeholder="Enter current password"
                {...registerPassword("oldPassword", { required: true })}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-3 top-8 text-richblack-400 hover:text-white"
              >
                {showOldPass ? <VscEyeClosed /> : <VscEye />}
              </button>
            </div>

            <div className="space-y-1 relative">
              <label className="text-xs text-richblack-300 font-semibold">New Password</label>
              <input
                type={showNewPass ? "text" : "password"}
                placeholder="Enter new password"
                {...registerPassword("newPassword", { required: true })}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-8 text-richblack-400 hover:text-white"
              >
                {showNewPass ? <VscEyeClosed /> : <VscEye />}
              </button>
            </div>

            <div className="space-y-1 relative sm:col-span-2">
              <label className="text-xs text-richblack-300 font-semibold">Confirm New Password</label>
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm new password"
                {...registerPassword("confirmNewPassword", { required: true })}
                className="w-full bg-[#141728] border border-purple-500/20 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-richblack-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-8 text-richblack-400 hover:text-white"
              >
                {showConfirmPass ? <VscEyeClosed /> : <VscEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => resetPasswordForm()}
              className="px-5 py-2.5 rounded-xl bg-[#141728] hover:bg-white/5 text-richblack-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              Update Password
            </button>
          </div>
        </form>
      )}

      {/* 6. PREFERENCES SECTION */}
      {(activeTab === "preferences" || activeTab === "profile") && (
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 space-y-6 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <VscSettingsGear className="text-purple-400 text-lg" />
            <h2 className="text-base font-bold text-white">Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Email Notifications */}
            <div className="p-4 rounded-xl bg-[#141728] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Email Notifications</span>
                <span className="text-[10px] text-richblack-400">Receive updates about courses and offers</span>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  emailNotifs ? "bg-purple-600" : "bg-richblack-700"
                }`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  emailNotifs ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Marketing Emails */}
            <div className="p-4 rounded-xl bg-[#141728] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Marketing Emails</span>
                <span className="text-[10px] text-richblack-400">Receive emails about new features and promotions</span>
              </div>
              <button
                type="button"
                onClick={() => setMarketingEmails(!marketingEmails)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  marketingEmails ? "bg-purple-600" : "bg-richblack-700"
                }`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  marketingEmails ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="p-4 rounded-xl bg-[#141728] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Dark Mode</span>
                <span className="text-[10px] text-richblack-400">Enable dark mode across the platform</span>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  darkMode ? "bg-purple-600" : "bg-richblack-700"
                }`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Course Progress Reminders */}
            <div className="p-4 rounded-xl bg-[#141728] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Course Progress Reminders</span>
                <span className="text-[10px] text-richblack-400">Get reminded to continue your learning</span>
              </div>
              <button
                type="button"
                onClick={() => setCourseReminders(!courseReminders)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  courseReminders ? "bg-purple-600" : "bg-richblack-700"
                }`}
              >
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  courseReminders ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. BILLING & PLANS SECTION */}
      {activeTab === "billing" && (
        <div className="bg-[#0e111f] border border-purple-500/20 rounded-2xl p-6 space-y-6 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <VscCreditCard className="text-purple-400 text-lg" />
            <h2 className="text-base font-bold text-white">Billing & Plan</h2>
          </div>

          <div className="p-5 rounded-xl bg-purple-900/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-purple-300 block uppercase tracking-wider">Current Membership</span>
              <h3 className="text-lg font-extrabold text-white mt-1">CodeLearn Lifetime Access</h3>
              <p className="text-xs text-richblack-300">Unlimited course streaming and updates included.</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/buy-courses")}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      )}

      {/* 8. DELETE ACCOUNT DANGER ZONE */}
      <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/30 text-red-400 flex items-center justify-center text-lg shrink-0">
            <VscTrash />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-400">Delete Account</h3>
            <p className="text-xs text-richblack-300 mt-0.5">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 rounded-xl bg-red-900/30 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
        >
          Delete My Account
        </button>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111f] border border-red-500/40 max-w-md w-full rounded-2xl p-6 text-white space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <h2 className="font-bold text-base text-white">Confirm Account Deletion</h2>
            </div>

            <p className="text-xs text-richblack-300 leading-relaxed">
              Are you sure you want to permanently delete your CodeLearn account? All your enrolled courses, certificates, and learning progress will be permanently wiped.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-[#141728] hover:bg-white/5 text-richblack-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUserAccount}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}