import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3250/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// Response interceptor to handle standard API errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "An unexpected network error occurred";
        console.log("ERROR MESSAGE: ", errorMessage);
        return Promise.reject(new Error(errorMessage));
    },
);
