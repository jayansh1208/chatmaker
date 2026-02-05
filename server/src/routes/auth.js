import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create a new user profile after Supabase Auth signup
 */
router.post('/signup', authenticateToken, async (req, res) => {
    try {
        const { username, avatar_url } = req.body;
        const userId = req.user.id;
        const email = req.user.email;

        // Validate username
        if (!username || username.trim().length < 3) {
            return res.status(400).json({
                error: 'Username must be at least 3 characters long.'
            });
        }

        // Check if username already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({
                error: 'Username already taken.'
            });
        }

        // Create user profile
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    id: userId,
                    username: username.trim(),
                    email,
                    avatar_url: avatar_url || null,
                    is_online: true
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating user profile:', error);
            return res.status(500).json({
                error: 'Failed to create user profile.'
            });
        }

        res.status(201).json({
            message: 'User profile created successfully.',
            user
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: 'Internal server error during signup.'
        });
    }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({
                error: 'User profile not found.'
            });
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, avatar_url } = req.body;

        const updates = {};
        if (username) updates.username = username.trim();
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Profile update error:', error);
            return res.status(500).json({
                error: 'Failed to update profile.'
            });
        }

        res.json({
            message: 'Profile updated successfully.',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

export default router;
