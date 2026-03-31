import axios from "axios";

const customFetch = axios.create({
    baseURL: "http://localhost:5000/api", // ✅ FIXED
    withCredentials: true, // ✅ IMPORTANT (for cookies / JWT)
});

export default customFetch;