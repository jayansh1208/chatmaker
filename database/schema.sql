-- ============================================
-- Real-Time Chat Application Database Schema
-- PostgreSQL (Supabase)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Note: Supabase Auth handles authentication
-- This table extends the auth.users table with profile info
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_online ON users(is_online);

-- ============================================
-- CHAT ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    is_group BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX idx_chat_rooms_is_group ON chat_rooms(is_group);

-- ============================================
-- ROOM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT false,
    UNIQUE(room_id, user_id)
);

-- Indexes for faster lookups
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
CREATE INDEX idx_room_members_composite ON room_members(room_id, user_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);

-- ============================================
-- TYPING INDICATORS TABLE (for real-time typing status)
-- ============================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Index for faster lookups
CREATE INDEX idx_typing_room_id ON typing_indicators(room_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chat_rooms table
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Chat rooms policies
CREATE POLICY "Users can view rooms they are members of" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_members
            WHERE room_members.room_id = chat_rooms.id
            AND room_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chat rooms" ON chat_rooms
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Room members policies
CREATE POLICY "Users can view room members of their rooms" ON room_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_members rm
            WHERE rm.room_id = room_members.room_id
            AND rm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join rooms" ON room_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their rooms" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_members
            WHERE room_members.room_id = messages.room_id
            AND room_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their rooms" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM room_members
            WHERE room_members.room_id = messages.room_id
            AND room_members.user_id = auth.uid()
        )
    );

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators in their rooms" ON typing_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_members
            WHERE room_members.room_id = typing_indicators.room_id
            AND room_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own typing status" ON typing_indicators
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for getting room details with last message
CREATE OR REPLACE VIEW room_details AS
SELECT 
    cr.id,
    cr.name,
    cr.is_group,
    cr.avatar_url,
    cr.created_at,
    cr.updated_at,
    (
        SELECT json_build_object(
            'id', m.id,
            'message_text', m.message_text,
            'created_at', m.created_at,
            'sender', json_build_object(
                'id', u.id,
                'username', u.username
            )
        )
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.room_id = cr.id
        ORDER BY m.created_at DESC
        LIMIT 1
    ) as last_message,
    (
        SELECT COUNT(*)::int
        FROM room_members
        WHERE room_members.room_id = cr.id
    ) as member_count
FROM chat_rooms cr;

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================

-- Note: In production, users are created via Supabase Auth
-- This is just for reference/testing

-- INSERT INTO users (id, username, email) VALUES
-- (uuid_generate_v4(), 'john_doe', 'john@example.com'),
-- (uuid_generate_v4(), 'jane_smith', 'jane@example.com');
