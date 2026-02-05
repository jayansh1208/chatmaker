import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

/**
 * Middleware to verify JWT token from Supabase Auth
 * Attaches user information to req.user
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.'
            });
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({
                error: 'Invalid or expired token.'
            });
        }

        // Attach user to request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Internal server error during authentication.'
        });
    }
};

/**
 * Middleware to verify Socket.io connection token
 */
export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return next(new Error('Authentication error: Invalid token'));
        }

        // Attach user to socket
        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket auth error:', error);
        next(new Error('Authentication error'));
    }
};
