import React, { useEffect, useState } from 'react'

const RequirementField = ({ name, label, register, errors, setValue, getValues }) => {
  const [requirement, setRequirement] = useState("")
  const [requirementList, setRequirementList] = useState([])

  useEffect(() => {
    const val = getValues(name)
    if (val) {
      if (Array.isArray(val)) setRequirementList(val)
      else if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val)
          setRequirementList(Array.isArray(parsed) ? parsed : [parsed])
        } catch {
          setRequirementList([val])
        }
      }
    }
    register(name, {
      required: true,
    })
  }, [])

  useEffect(() => {
    setValue(name, requirementList)
  }, [requirementList])

  const handleAddRequirement = () => {
    if (requirement) {
      setRequirementList([...requirementList, requirement])
      // setRequirement("")
    }
  }

  const handleRemoveRequirement = (index) => {
    const updatedRequirementList = [...requirementList]
    updatedRequirementList.splice(index, 1)
    setRequirementList(updatedRequirementList)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* LABEL */}
      <label className="text-sm font-medium text-richblack-100">
        {label} <sup className="text-blue-400">*</sup>
      </label>

      {/* INPUT + BUTTON */}
      <div className="flex gap-3">
        <input
          type='text'
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g. Basic JavaScript knowledge"
          className="flex-1 rounded-xl bg-richblack-900 px-4 py-3 text-white border border-richblack-700 focus:border-yellow-400 outline-none transition"
        />

        <button
          type='button'
          onClick={handleAddRequirement}
          className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 font-semibold text-black hover:scale-105 transition"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      {requirementList.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">

          {requirementList.map((requirement, index) => (
            <div
              key={index}
              className="group flex items-center justify-between rounded-xl bg-richblack-900 px-4 py-3 border border-richblack-700 hover:border-yellow-400 transition"
            >
              <span className="text-sm text-richblack-50">
                {requirement}
              </span>

              <button
                type='button'
                onClick={() => handleRemoveRequirement(index)}
                className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition hover:text-blue-300"
              >
                Remove
              </button>
            </div>
          ))}

        </div>
      )}

      {/* ERROR */}
      {errors[name] && (
        <span className="text-xs text-blue-400">
          {label} is required
        </span>
      )}

    </div>
  )
}

export default RequirementField