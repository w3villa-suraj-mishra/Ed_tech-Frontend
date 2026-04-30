import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import Iconbtn from '../../Common/iconbtn';
import { RiEditBoxLine } from "react-icons/ri"
import { formattedDate } from "../../../utils/dateFormatter"

const MyProfile = () => {

  const {user} = useSelector((state)=>state.profile);
  const navigate = useNavigate()

  return (
    <>
      {/* Heading */}
      <h1 className="mb-10 text-3xl font-bold text-richblack-5">
        👤 My Profile
      </h1>

      {/* Profile Card */}
      <div className="flex items-center justify-between rounded-2xl border border-richblack-700 bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 px-10 shadow-xl hover:shadow-2xl transition-all duration-300">
        
        <div className="flex items-center gap-x-5">
          <img
            src={user?.image}
            alt={`profile-${user?.first_name}`}
            referrerPolicy="no-referrer"
            className="aspect-square w-[80px] rounded-full object-cover ring-2 ring-blue-500"
          />

          <div className="space-y-1">
            <p className="text-xl font-semibold text-richblack-5">
              {user?.first_name + " " + user?.last_name}
            </p>
            <p className="text-sm text-richblack-300">{user?.email}</p>
          </div>
        </div>

        <div className="hover:scale-105 transition-all">
          <Iconbtn
            text="Edit"
            onclick={() => navigate("/dashboard/settings")}
          >
            <RiEditBoxLine />
          </Iconbtn>
        </div>
      </div>

      {/* About Section */}
      <div className="my-10 rounded-2xl border border-richblack-700 bg-richblack-800 p-8 px-10 shadow-lg hover:shadow-xl transition-all duration-300">
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-semibold text-richblack-5">📝 About</p>

          <div className="hover:scale-105 transition-all">
            <Iconbtn
              text="Edit"
              onclick={() => navigate("/dashboard/settings")}
            >
              <RiEditBoxLine />
            </Iconbtn>
          </div>
        </div>

        <p
          className={`text-sm leading-relaxed ${
            user?.additionalDetails?.about
              ? "text-richblack-5"
              : "text-richblack-400 italic"
          }`}
        >
          {user?.additionalDetails?.about ?? "Write something about yourself..."}
        </p>
      </div>

      {/* Personal Details */}
      <div className="my-10 rounded-2xl border border-richblack-700 bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 px-10 shadow-xl hover:shadow-2xl transition-all duration-300">

        <div className="flex items-center justify-between mb-6">
          <p className="text-lg font-semibold text-richblack-5">
            📋 Personal Details
          </p>

          <div className="hover:scale-105 transition-all">
            <Iconbtn
              text="Edit"
              onclick={() => navigate("/dashboard/settings")}
            >
              <RiEditBoxLine />
            </Iconbtn>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left */}
          <div className="space-y-5">
            <div>
              <p className="text-xs text-richblack-400">First Name</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.first_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-richblack-400">Email</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-richblack-400">Gender</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.additionalDetails?.gender ?? "Add Gender"}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <div>
              <p className="text-xs text-richblack-400">Last Name</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.last_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-richblack-400">Phone Number</p>
              <p className="text-sm font-medium text-richblack-5">
                {user?.additionalDetails?.contactNumber ?? "Add Contact Number"}
              </p>
            </div>

            <div>
              <p className="text-xs text-richblack-400">Date Of Birth</p>
              <p className="text-sm font-medium text-richblack-5">
                {formattedDate(user?.additionalDetails?.dateOfBirth) ?? "Add Date Of Birth"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default MyProfile