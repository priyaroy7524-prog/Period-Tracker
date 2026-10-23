import axios from 'axios';

// Node.js backend ka base URL
const API_BASE_URL = 'http://localhost:5000/api';

// 1. Saari purani history fetch karne ke liye
export const fetchCycles = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cycles`);
        return response.data;
    } catch (error) {
        console.error("Error fetching cycle history:", error);
        return [];
    }
};

// 2. Naya cycle log save karne ke liye
export const saveCycleLog = async (logData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/cycles`, logData);
        return response.data;
    } catch (error) {
        console.error("Error saving cycle log:", error);
        throw error;
    }
};