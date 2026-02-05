import { supabaseAdmin } from '../config/supabase.js';

/**
 * Middleware to validate room membership
 * Ensures user is a member of the room before allowing access
 */
export const validateRoomMembership = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        // Check if user is a member of the room
        const { data: membership, error } = await supabaseAdmin
            .from('room_members')
            .select('*')
            .eq('room_id', roomId)
            .eq('user_id', userId)
            .single();

        if (error || !membership) {
            return res.status(403).json({
                error: 'Access denied. You are not a member of this room.'
            });
        }

        // Attach membership info to request
        req.membership = membership;
        next();
    } catch (error) {
        console.error('Room validation error:', error);
        return res.status(500).json({
            error: 'Internal server error during room validation.'
        });
    }
};

/**
 * Validate room membership for Socket.io events
 */
export const validateSocketRoomMembership = async (socket, roomId) => {
    try {
        const userId = socket.user.id;

        const { data: membership, error } = await supabaseAdmin
            .from('room_members')
            .select('*')
            .eq('room_id', roomId)
            .eq('user_id', userId)
            .single();

        if (error || !membership) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Socket room validation error:', error);
        return false;
    }
};
