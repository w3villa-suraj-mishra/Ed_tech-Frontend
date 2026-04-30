import axios from "axios";

export const axiosInstance = axios.create({});

// Response interceptor to handle 401 Unauthorized errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log("Session expired or user deleted. Redirecting to login...");
            localStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method,url,bodyData ,headers,params)=>{
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data : bodyData?bodyData:null,
        headers:headers?headers:null,
        params:params?params:null
    
    });
  
    
}