import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser() {
    console.log('Fetching users with email testuser_new@example.com...');
    const { data: users, error } = await supabase.from('users').select('*').eq('email', 'testuser_new@example.com');
    if (!users || users.length === 0) return;

    const myUser = users[0];
    const { data: members, error: memError } = await supabase.from('room_members').select('*, chat_rooms(*)').eq('user_id', myUser.id);

    console.log('Room memberships for this user:');
    console.log(JSON.stringify(members, null, 2));
}

checkUser();
