import axios from "axios";

export const axiosInstance = axios.create({});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Do not redirect to login for unauthenticated public requests or oauth profile checks
        const isPublicRoute = error.config?.url?.includes('/reach/contact') || 
                              error.config?.url?.includes('/login') ||
                              error.config?.skipAuthRedirect;
        if (error.response && error.response.status === 401 && !isPublicRoute) {
            console.log("Session expired or user deleted. Redirecting to login...");
            localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, headers, params, extraConfig = {}) => {
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
        ...extraConfig
    });
}