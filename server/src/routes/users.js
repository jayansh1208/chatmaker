import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/users/search
 * Search for users by username
 */
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                error: 'Search query must be at least 2 characters.'
            });
        }

        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, username, email, avatar_url, is_online')
            .ilike('username', `%${q.trim()}%`)
            .limit(20);

        if (error) {
            console.error('User search error:', error);
            return res.status(500).json({
                error: 'Failed to search users.'
            });
        }

        res.json({ users });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

/**
 * GET /api/users/:userId
 * Get user profile by ID
 */
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, username, email, avatar_url, is_online, last_seen')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        res.json({ user });
    } catch (error) {
        console.error('Fetch user error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

export default router;
