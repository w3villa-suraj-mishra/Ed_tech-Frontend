import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { setPaymentLoading } from "../../services/slices/courseSlice";
import { resetCart } from "../../services/slices/cartSlice";

const { COURSE_PAYMENT_API, COURSE_VERIFY_API } = studentEndpoints;

export async function buyCourse(token, courses, userDetails, navigate, dispatch, plan = 'gold', couponCode = null) {
    const toastId = toast.loading("Processing...");
    try {
        const orderResponse = await apiConnector(
            "POST",
            COURSE_PAYMENT_API,
            { courses, plan, couponCode },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!orderResponse?.data?.success) {
            throw new Error(orderResponse?.data?.message || "Checkout creation failed");
        }

        if (orderResponse?.data?.isFree) {
            toast.success("Free Access Activated! Enjoy your learning.");
            if (typeof dispatch === 'function') {
                dispatch(resetCart());
            }
            if (navigate) navigate("/dashboard/courses");
            toast.dismiss(toastId);
            return;
        }

        const { url } = orderResponse.data.data;
        if (url) {
            toast.success("Redirecting to Gateway...");
            window.location.href = url;
        } else {
            throw new Error("No Checkout URL returned");
        }
    } catch (error) {
        console.log("PAYMENT ERROR.....", error);
        const errorMsg = error.response?.data?.message || error.message || "Could not process plan checkout";
        toast.error(errorMsg);
    }
    toast.dismiss(toastId);
}

// verify payment after Stripe redirect back
export async function verifyPayment(sessionId, courses, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    if (typeof dispatch === 'function') {
        dispatch(setPaymentLoading(true));
    }
    try {
        const response = await apiConnector(
            "POST",
            COURSE_VERIFY_API,
            { sessionId, courses },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Payment Successful! You are enrolled in the course.");
        if (typeof dispatch === 'function') {
            dispatch(resetCart());
        }
        
        // Remove session_id from URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify payment");
    }
    toast.dismiss(toastId);
    if (typeof dispatch === 'function') {
        dispatch(setPaymentLoading(false));
    }
}