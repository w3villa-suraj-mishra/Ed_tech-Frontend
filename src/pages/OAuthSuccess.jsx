import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../services/slices/authSlice";
import { setUser } from "../services/slices/profileSlice";
import { apiConnector } from "../services/apiConnector";
import { profileEndpoints } from "../services/apis";
import toast from "react-hot-toast";

function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const role = params.get("role");

      if (token) {
        localStorage.setItem("token", token);
        dispatch(setToken(token));

        try {
          const response = await apiConnector("GET", profileEndpoints.GET_USER_DETAILS_API, null, {
            Authorization: `Bearer ${token}`,
          });

          if (response?.data?.data) {
            const rawUser = response.data.data;
            const account_type = rawUser.accountType || rawUser.account_type || role || "Student";
            const first_name = rawUser.firstName || rawUser.first_name || "";
            const last_name = rawUser.lastName || rawUser.last_name || "";
            const userImage = rawUser.image
              ? rawUser.image
              : `https://api.dicebear.com/9.x/initials/svg?seed=${first_name}${last_name}`;

            const fullUser = { 
              ...rawUser, 
              account_type, 
              accountType: account_type,
              first_name, 
              last_name,
              image: userImage 
            };
            
            localStorage.setItem("user", JSON.stringify(fullUser));
            dispatch(setUser(fullUser));

            toast.success("Logged in successfully!");

            if (account_type === "Instructor") {
              navigate("/dashboard/instructor", { replace: true });
            } else {
              navigate("/dashboard/my-profile", { replace: true });
            }
            return;
          }
        } catch (error) {
          console.log("Error fetching OAuth user details", error);
        }

        // Fallback if profile fetch is delayed
        navigate("/dashboard/global", { replace: true });
      } else {
        const params = new URLSearchParams(window.location.search);
        const errMsg = params.get("error") || "Authentication failed. Please try again.";
        toast.error(errMsg);
        navigate("/login", { replace: true });
      }
    };

    handleOAuth();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-richblack-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-sm font-semibold text-slate-300">Completing Social Login...</h1>
      </div>
    </div>
  );
}

export default OAuthSuccess;