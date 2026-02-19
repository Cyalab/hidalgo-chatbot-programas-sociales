import axios from 'axios';

// In Vite, we use import.meta.env for environment variables if needed.
// For now, hardcoding localhost is fine for local dev.
const API_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
});

export const verifyAdvisorKey = async (key: string): Promise<boolean> => {
    // Mock check - in improved version this would hit an endpoint
    // For now we accept a hardcoded key "HIDALGO2024"
    return key === "HIDALGO2024";
};

export const API_BASE_URL = API_URL;
