const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

/**
 * API service for making HTTP requests
 */
class ApiService {
    constructor() {
        this.baseUrl = API_URL;
        this.token = null;
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;

        // Prepare headers with the Tunnel Bypass included
        const headers = {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true',  // <--- This allows Vercel to bypass the password screen
            ...options.headers,
        };

        // Add Authorization token if it exists
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend server is not responding correctly. Please check if the server is running.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                throw new Error('Cannot connect to backend server. Please check your internet connection and verify the backend is running.');
            }
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Auth endpoints
    async createProfile(username, avatar_url) {
        return this.post('/api/auth/signup', { username, avatar_url });
    }

    async getProfile() {
        return this.get('/api/auth/profile');
    }

    async updateProfile(username, avatar_url) {
        return this.put('/api/auth/profile', { username, avatar_url });
    }

    // Room endpoints
    async createRoom(name, is_group, member_ids, avatar_url) {
        return this.post('/api/rooms', { name, is_group, member_ids, avatar_url });
    }

    async getRooms() {
        return this.get('/api/rooms');
    }

    async getRoom(roomId) {
        return this.get(`/api/rooms/${roomId}`);
    }

    async getRoomMessages(roomId, limit = 50, before = null) {
        const params = new URLSearchParams({ limit });
        if (before) params.append('before', before);
        return this.get(`/api/rooms/${roomId}/messages?${params}`);
    }

    async addRoomMembers(roomId, user_ids) {
        return this.post(`/api/rooms/${roomId}/members`, { user_ids });
    }

    // User endpoints
    async searchUsers(query) {
        return this.get(`/api/users/search?q=${encodeURIComponent(query)}`);
    }

    async getUser(userId) {
        return this.get(`/api/users/${userId}`);
    }
}

// Export singleton instance
export const apiService = new ApiService();