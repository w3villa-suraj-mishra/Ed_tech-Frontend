import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function OAuthSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const token = params.get("token")
    const role = params.get("role")

    console.log("TOKEN:", token)
    console.log("ROLE:", role)

    if (token) {
      localStorage.setItem("token", token)
      localStorage.setItem("role", role || "Student")

      if (role === "Instructor") {
        window.location.href = "/dashboard/instructor"
      } else {
        window.location.href = "/dashboard/my-profile"
      }

    } else {
      window.location.href = "/login"
    }

  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-richblack-900">
      <h1>Logging you in...</h1>
    </div>
  )
}

export default OAuthSuccess