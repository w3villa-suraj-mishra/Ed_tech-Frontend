import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Iconbtn from '../../Common/iconbtn';
import { RiEditBoxLine } from "react-icons/ri";
import { formattedDate } from "../../../utils/dateFormatter";

const MyProfile = () => {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const handleDownloadProfile = () => {
    const profileData = {
      fullName: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
      email: user?.email,
      accountType: user?.account_type || "Student",
      contactNumber: user?.additionalDetails?.contactNumber || "N/A",
      gender: user?.additionalDetails?.gender || "N/A",
      dateOfBirth: user?.additionalDetails?.dateOfBirth || "N/A",
      about: user?.additionalDetails?.about || "N/A",
      address: user?.additionalDetails?.address || "N/A",
      coordinates: {
        latitude: user?.additionalDetails?.latitude || null,
        longitude: user?.additionalDetails?.longitude || null
      },
      exportedAt: new Date().toLocaleString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${user?.first_name || "user"}_profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">My Profile</h1>
          <p className="text-xs text-richblack-300 mt-1">
            Manage your personal details, address location, and export your profile.
          </p>
        </div>

        <button
          onClick={handleDownloadProfile}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
        >
          📥 Download Profile
        </button>
      </div>

      {/* Main Profile & Bio Header Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl border border-[#252C3A] bg-[#12161F] p-6 gap-6 shadow-xl">
        <div className="flex items-center gap-x-5">
          <img
            src={user?.image}
            alt={`profile-${user?.first_name}`}
            referrerPolicy="no-referrer"
            className="aspect-square w-[72px] rounded-full object-cover ring-2 ring-indigo-500/80"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              {user?.first_name + " " + user?.last_name}
            </h2>
            <p className="text-xs text-indigo-400 font-medium">{user?.email}</p>
            <span className="inline-block text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full mt-1">
              Role: {user?.account_type || "Student"}
            </span>
          </div>
        </div>

        <Iconbtn
          text="Edit Profile"
          onclick={() => navigate("/dashboard/settings")}
        >
          <RiEditBoxLine />
        </Iconbtn>
      </div>

      {/* About Section */}
      <div className="rounded-2xl border border-[#252C3A] bg-[#12161F] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">About Bio</h3>
          <Iconbtn
            text="Edit"
            onclick={() => navigate("/dashboard/settings")}
          >
            <RiEditBoxLine />
          </Iconbtn>
        </div>

        <p className={`text-xs leading-relaxed ${user?.additionalDetails?.about ? "text-slate-300" : "text-slate-500 italic"}`}>
          {user?.additionalDetails?.about ?? "No bio added yet. Click edit to add your bio."}
        </p>
      </div>

      {/* Address & Location Map */}
      <div className="rounded-2xl border border-[#252C3A] bg-[#12161F] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#252C3A] pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            📍 Address & Map Location (LocationIQ)
          </h3>
          <Iconbtn text="Edit" onclick={() => navigate("/dashboard/settings")}>
            <RiEditBoxLine />
          </Iconbtn>
        </div>

        <div className="text-xs text-slate-300">
          <p className="font-semibold text-slate-400 mb-1">Registered Address:</p>
          <p className="text-sm font-medium text-white">
            {user?.additionalDetails?.address || "No address saved yet. Update in settings."}
          </p>
        </div>

        {user?.additionalDetails?.latitude && user?.additionalDetails?.longitude ? (
          <div className="mt-3 rounded-xl overflow-hidden border border-[#252C3A] h-56 shadow-inner">
            <iframe
              title="User Map Location"
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://maps.google.com/maps?q=${user.additionalDetails.latitude},${user.additionalDetails.longitude}&z=15&output=embed`}
            />
          </div>
        ) : (
          <div className="p-4 bg-[#1A202C] rounded-xl border border-dashed border-[#252C3A] text-center text-xs text-slate-500">
            Map location not set. Add an address in profile settings to display map.
          </div>
        )}
      </div>

      {/* Personal Details Grid */}
      <div className="rounded-2xl border border-[#252C3A] bg-[#12161F] p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#252C3A] pb-3">
          <h3 className="text-base font-bold text-white">Personal Details</h3>
          <Iconbtn
            text="Edit"
            onclick={() => navigate("/dashboard/settings")}
          >
            <RiEditBoxLine />
          </Iconbtn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 mb-1">First Name</p>
              <p className="font-semibold text-white text-sm">{user?.first_name}</p>
            </div>

            <div>
              <p className="text-slate-400 mb-1">Email Address</p>
              <p className="font-semibold text-white text-sm">{user?.email}</p>
            </div>

            <div>
              <p className="text-slate-400 mb-1">Gender</p>
              <p className="font-semibold text-white text-sm">
                {user?.additionalDetails?.gender ?? "Not specified"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-slate-400 mb-1">Last Name</p>
              <p className="font-semibold text-white text-sm">{user?.last_name}</p>
            </div>

            <div>
              <p className="text-slate-400 mb-1">Phone Number</p>
              <p className="font-semibold text-white text-sm">
                {user?.additionalDetails?.contactNumber ?? "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-slate-400 mb-1">Date Of Birth</p>
              <p className="font-semibold text-white text-sm">
                {formattedDate(user?.additionalDetails?.dateOfBirth) ?? "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;