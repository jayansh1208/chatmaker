import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateRoomMembership } from '../middleware/validateRoom.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/rooms
 * Create a new chat room (private or group)
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, is_group, member_ids, avatar_url } = req.body;
        const userId = req.user.id;

        // Validate input
        if (is_group && !name) {
            return res.status(400).json({
                error: 'Group chat must have a name.'
            });
        }

        if (!member_ids || !Array.isArray(member_ids) || member_ids.length === 0) {
            return res.status(400).json({
                error: 'At least one member is required.'
            });
        }

        // For private chats, check if room already exists
        if (!is_group && member_ids.length === 1) {
            const otherUserId = member_ids[0];

            // Find existing private room between these two users
            const { data: existingRooms } = await supabaseAdmin
                .from('chat_rooms')
                .select(`
          *,
          room_members!inner(user_id)
        `)
                .eq('is_group', false);

            // Check if a private room exists with exactly these two users
            for (const room of existingRooms || []) {
                const { data: members } = await supabaseAdmin
                    .from('room_members')
                    .select('user_id')
                    .eq('room_id', room.id);

                const memberUserIds = members.map(m => m.user_id);
                if (
                    memberUserIds.length === 2 &&
                    memberUserIds.includes(userId) &&
                    memberUserIds.includes(otherUserId)
                ) {
                    return res.json({
                        message: 'Private chat already exists.',
                        room
                    });
                }
            }
        }

        // Create chat room
        const { data: room, error: roomError } = await supabaseAdmin
            .from('chat_rooms')
            .insert([
                {
                    name: name || null,
                    is_group: is_group || false,
                    created_by: userId,
                    avatar_url: avatar_url || null
                }
            ])
            .select()
            .single();

        if (roomError) {
            console.error('Error creating room:', roomError);
            return res.status(500).json({
                error: 'Failed to create chat room.'
            });
        }

        // Add creator as admin member
        const membersToAdd = [
            {
                room_id: room.id,
                user_id: userId,
                is_admin: true
            }
        ];

        // Add other members
        for (const memberId of member_ids) {
            if (memberId !== userId) {
                membersToAdd.push({
                    room_id: room.id,
                    user_id: memberId,
                    is_admin: false
                });
            }
        }

        const { error: membersError } = await supabaseAdmin
            .from('room_members')
            .insert(membersToAdd);

        if (membersError) {
            console.error('Error adding members:', membersError);
            // Rollback: delete the room
            await supabaseAdmin.from('chat_rooms').delete().eq('id', room.id);
            return res.status(500).json({
                error: 'Failed to add members to room.'
            });
        }

        res.status(201).json({
            message: 'Chat room created successfully.',
            room
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

/**
 * GET /api/rooms
 * Get all chat rooms for the current user
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all rooms where user is a member
        const { data: memberships, error: memberError } = await supabaseAdmin
            .from('room_members')
            .select('room_id')
            .eq('user_id', userId);

        if (memberError) {
            console.error('Error fetching memberships:', memberError);
            return res.status(500).json({
                error: 'Failed to fetch chat rooms.'
            });
        }

        const roomIds = memberships.map(m => m.room_id);

        if (roomIds.length === 0) {
            return res.json({ rooms: [] });
        }

        // Get room details with last message
        const { data: rooms, error: roomsError } = await supabaseAdmin
            .from('chat_rooms')
            .select(`
        *,
        room_members(
          user_id,
          users(id, username, avatar_url, is_online)
        )
      `)
            .in('id', roomIds)
            .order('updated_at', { ascending: false });

        if (roomsError) {
            console.error('Error fetching rooms:', roomsError);
            return res.status(500).json({
                error: 'Failed to fetch chat rooms.'
            });
        }

        // Get last message for each room
        const roomsWithMessages = await Promise.all(
            rooms.map(async (room) => {
                const { data: lastMessage } = await supabaseAdmin
                    .from('messages')
                    .select(`
            *,
            users(id, username, avatar_url)
          `)
                    .eq('room_id', room.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                return {
                    ...room,
                    last_message: lastMessage || null
                };
            })
        );

        res.json({ rooms: roomsWithMessages });
    } catch (error) {
        console.error('Fetch rooms error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

/**
 * GET /api/rooms/:roomId
 * Get specific room details
 */
router.get('/:roomId', authenticateToken, validateRoomMembership, async (req, res) => {
    try {
        const { roomId } = req.params;

        const { data: room, error } = await supabaseAdmin
            .from('chat_rooms')
            .select(`
        *,
        room_members(
          user_id,
          is_admin,
          users(id, username, avatar_url, is_online)
        )
      `)
            .eq('id', roomId)
            .single();

        if (error || !room) {
            return res.status(404).json({
                error: 'Room not found.'
            });
        }

        res.json({ room });
    } catch (error) {
        console.error('Fetch room error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

/**
 * GET /api/rooms/:roomId/messages
 * Get chat history for a room
 */
router.get('/:roomId/messages', authenticateToken, validateRoomMembership, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, before } = req.query;

        let query = supabaseAdmin
            .from('messages')
            .select(`
        *,
        users(id, username, avatar_url)
      `)
            .eq('room_id', roomId)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        // Pagination: get messages before a certain timestamp
        if (before) {
            query = query.lt('created_at', before);
        }

        const { data: messages, error } = await query;

        if (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).json({
                error: 'Failed to fetch messages.'
            });
        }

        // Reverse to show oldest first
        res.json({ messages: messages.reverse() });
    } catch (error) {
        console.error('Fetch messages error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

/**
 * POST /api/rooms/:roomId/members
 * Add members to a group chat
 */
router.post('/:roomId/members', authenticateToken, validateRoomMembership, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { user_ids } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({
                error: 'User IDs are required.'
            });
        }

        // Check if user is admin
        if (!req.membership.is_admin) {
            return res.status(403).json({
                error: 'Only admins can add members.'
            });
        }

        // Add members
        const membersToAdd = user_ids.map(userId => ({
            room_id: roomId,
            user_id: userId,
            is_admin: false
        }));

        const { error } = await supabaseAdmin
            .from('room_members')
            .insert(membersToAdd);

        if (error) {
            console.error('Error adding members:', error);
            return res.status(500).json({
                error: 'Failed to add members.'
            });
        }

        res.json({
            message: 'Members added successfully.'
        });
    } catch (error) {
        console.error('Add members error:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
});

export default router;
