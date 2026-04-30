// Importing React hook for managing component state
import { useEffect, useState } from "react"
// Importing React icon component
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)

  const [chips, setChips] = useState([])

  useEffect(() => {
    if (editCourse) {
      setChips(course?.tag)
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
  }, [])

  useEffect(() => {
    setValue(name, chips)
  }, [chips])

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      const chipValue = event.target.value.trim()

      if (chipValue && !chips.includes(chipValue)) {
        const newChips = [...chips, chipValue]
        setChips(newChips)
        event.target.value = ""
      }
    }
  }

  const handleDeleteChip = (chipIndex) => {
    const newChips = chips.filter((_, index) => index !== chipIndex)
    setChips(newChips)
  }

  return (
    <div className="flex flex-col gap-2">

      {/* LABEL */}
      <label className="text-sm font-medium text-richblack-100">
        {label} <sup className="text-pink-400">*</sup>
      </label>

      {/* INPUT CONTAINER */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-richblack-700 bg-richblack-900 px-3 py-3 focus-within:border-yellow-400 transition-all duration-300">

        {/* CHIPS */}
        {chips.map((chip, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-medium text-black shadow-md transition-all duration-300 hover:scale-105"
          >
            {chip}
            <button
              type="button"
              onClick={() => handleDeleteChip(index)}
              className="rounded-full bg-black/20 p-1 hover:bg-black/40 transition"
            >
              <MdClose className="text-xs" />
            </button>
          </div>
        ))}

        {/* INPUT */}
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] bg-transparent text-white outline-none placeholder:text-richblack-400"
        />
      </div>

      {/* ERROR */}
      {errors[name] && (
        <span className="text-xs text-pink-400">
          {label} is required
        </span>
      )}
    </div>
  )
}