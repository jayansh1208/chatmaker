const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
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
