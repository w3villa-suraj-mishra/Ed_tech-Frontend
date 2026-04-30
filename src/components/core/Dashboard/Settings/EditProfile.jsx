import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../Common/iconbtn"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitProfileForm = async (data) => {
    try {
      dispatch(updateProfile(token, data))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitProfileForm)}>
      
      {/* Card */}
      <div className="my-10 rounded-2xl border border-richblack-700 bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 px-10 shadow-xl transition-all duration-300 hover:shadow-2xl">

        <h2 className="text-2xl font-bold text-richblack-5 mb-6">
          ✨ Profile Information
        </h2>

        {/* First + Last */}
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">First Name</label>
            <input
              type="text"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("firstName", { required: true })}
              defaultValue={user?.firstName}
            />
            {errors.firstName && (
              <span className="text-xs text-pink-400">
                Please enter your first name.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Last Name</label>
            <input
              type="text"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("lastName", { required: true })}
              defaultValue={user?.lastName}
            />
            {errors.lastName && (
              <span className="text-xs text-pink-400">
                Please enter your last name.
              </span>
            )}
          </div>
        </div>

        {/* DOB + Gender */}
        <div className="flex flex-col gap-6 lg:flex-row mt-6">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Date of Birth</label>
            <input
              type="date"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              {...register("dateOfBirth")}
              defaultValue={user?.additionalDetails?.dateOfBirth}
            />
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Gender</label>
            <select
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              {...register("gender", { required: true })}
              defaultValue={user?.additionalDetails?.gender}
            >
              {genders.map((ele, i) => (
                <option key={i} value={ele}>
                  {ele}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact + About */}
        <div className="flex flex-col gap-6 lg:flex-row mt-6">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">Contact Number</label>
            <input
              type="tel"
              placeholder="Enter Contact Number"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("contactNumber")}
              defaultValue={user?.additionalDetails?.contactNumber}
            />
          </div>

          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label className="text-sm text-richblack-300">About</label>
            <input
              type="text"
              placeholder="Enter Bio Details"
              className="rounded-lg border border-richblack-600 bg-richblack-800 px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              {...register("about")}
              defaultValue={user?.additionalDetails?.about}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/dashboard/my-profile")}
          className="rounded-lg bg-richblack-700 px-6 py-2 font-semibold text-white hover:bg-richblack-600 transition-all duration-200"
        >
          Cancel
        </button>

        <div className="transform hover:scale-105 transition-all duration-200">
          <IconBtn type="submit" text="💾 Save Changes" />
        </div>
      </div>
    </form>
  )
}