import dotenv from 'dotenv';
import { supabaseAdmin as supabase } from './src/config/supabase.js';

dotenv.config();

async function seed() {
    console.log('Starting to seed dummy data...');

    const uniqueId = Date.now();
    const fakeUserDefs = [
        { email: `alice_${uniqueId}@example.com`, password: 'password123', username: `Alice_${uniqueId} (Recruiter)`, avatar_url: 'https://i.pravatar.cc/150?u=alice' },
        { email: `bob_${uniqueId}@example.com`, password: 'password123', username: `Bob_${uniqueId} (Lead Dev)`, avatar_url: 'https://i.pravatar.cc/150?u=bob' },
        { email: `charlie_${uniqueId}@example.com`, password: 'password123', username: `Charlie_${uniqueId} (Designer)`, avatar_url: 'https://i.pravatar.cc/150?u=charlie' }
    ];

    const fakeUsers = [];

    for (const def of fakeUserDefs) {
        let userId = null;

        // 1. Create in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: def.email,
            password: def.password,
            email_confirm: true
        });

        if (authError) {
            console.log(`User ${def.email} warning:`, authError.message);
            const { data: existing } = await supabase.from('users').select('id').eq('email', def.email).single();
            if (existing) userId = existing.id;
        } else {
            userId = authData.user.id;
        }

        if (userId) {
            // 2. Ensure public.users record exists explicitly
            const { error: upsertError } = await supabase.from('users').upsert({
                id: userId,
                email: def.email,
                username: def.username,
                avatar_url: def.avatar_url,
                is_online: true
            }, { onConflict: 'id' });

            if (upsertError) {
                console.error(`Failed to force insert public.users record for ${def.username}`, upsertError);
                return;
            }

            // Small delay to ensure DB constraints are settled
            await new Promise(r => setTimeout(r, 500));

            const { data: verifyUser } = await supabase.from('users').select('id').eq('id', userId).single();
            if (!verifyUser) {
                console.error(`ERROR: User ${userId} could not be verified in public.users despite upsert.`);
                return;
            }

            fakeUsers.push({ id: userId, ...def });
            console.log(`Ready fake user: ${def.username}`);
        }
    }

    if (fakeUsers.length < 3) {
        console.error('Failed to prepare all 3 fake users.');
        return;
    }

    // Get the actual user (the one logged in) to link them to the chats
    const { data: realUsers } = await supabase.from('users').select('*').eq('email', 'testuser_new@example.com').limit(1);

    if (!realUsers || realUsers.length === 0) {
        console.log('No real user found to link chats to. Please log in once as testuser_new@example.com first if you haven\'t.');
        return;
    }
    const myUser = realUsers[0];
    console.log(`Linking chats to real user: ${myUser.username} (${myUser.id})`);

    // 2. Create Rooms
    const { data: rooms, error: roomsError } = await supabase.from('chat_rooms').insert([
        { is_group: true, name: 'Project Alpha Launch 🚀', created_by: myUser.id }, // Group chat
        { is_group: false, created_by: fakeUsers[0].id } // 1-on-1 with Alice
    ]).select();

    if (roomsError) {
        console.error('Error creating chat_rooms:', roomsError);
        return;
    }
    const groupRoom = rooms.find(r => r.is_group);
    const directRoom = rooms.find(r => !r.is_group);
    console.log('Created chat_rooms.');

    // 3. Add Members
    console.log('Adding members to rooms...');
    const members = [
        // Group members
        { room_id: groupRoom.id, user_id: myUser.id },
        { room_id: groupRoom.id, user_id: fakeUsers[1].id }, // Bob
        { room_id: groupRoom.id, user_id: fakeUsers[2].id }, // Charlie
        // Direct members
        { room_id: directRoom.id, user_id: myUser.id },
        { room_id: directRoom.id, user_id: fakeUsers[0].id } // Alice
    ];

    const { error: membersError } = await supabase.from('room_members').insert(members);
    if (membersError) {
        console.error('Error adding members details:', JSON.stringify(membersError, null, 2));

        // Debugging verification
        console.log("\nVerifying user IDs exist in public.users:");
        const userChecks = [myUser.id, ...fakeUsers.map(u => u.id)];
        for (const uid of userChecks) {
            const { data } = await supabase.from('users').select('id, username').eq('id', uid).single();
            console.log(`  User ${uid}: ${data ? 'FOUND (' + data.username + ')' : 'MISSING'}`);
        }
        return;
    }
    console.log('Successfully added members.');

    // 4. Insert Messages
    console.log('Inserting messages...');
    const now = new Date();
    const ago = (minutes) => new Date(now.getTime() - minutes * 60000).toISOString();

    const messages = [
        // Group Chat Messages
        { room_id: groupRoom.id, sender_id: fakeUsers[1].id, message_text: "Hey team, the new chat interface is looking incredibly polished! The 3-column layout is perfect.", created_at: ago(120) },
        { room_id: groupRoom.id, sender_id: fakeUsers[2].id, message_text: "Thanks Bob! I'm really glad we moved to this cleaner design. The glassmorphism was cool, but this Chatvia style is much more professional.", created_at: ago(115) },
        { room_id: groupRoom.id, sender_id: myUser.id, message_text: "I completely agree. Integrating the emoji picker and the file attachment layout really balances out the bottom input area.", created_at: ago(110) },
        { room_id: groupRoom.id, sender_id: fakeUsers[1].id, message_text: "Are we ready for the final production deployment?", created_at: ago(10) },

        // Direct Chat Messages (Recruiter)
        { room_id: directRoom.id, sender_id: fakeUsers[0].id, message_text: "Hi there! I came across your portfolio and I must say, your work on this Real-Time Chat application is very impressive.", created_at: ago(1440) }, // 1 day ago
        { room_id: directRoom.id, sender_id: fakeUsers[0].id, message_text: "The tech stack you used (React, Node.js, Supabase, Socket.io) aligns perfectly with a Senior Frontend Developer role we have open. Are you currently open to new opportunities?", created_at: ago(1439) },
        { room_id: directRoom.id, sender_id: myUser.id, message_text: "Hi Alice! Thank you for reaching out. Yes, I am actively looking for new roles and I'd love to chat more about this opportunity.", created_at: ago(60) },
        { room_id: directRoom.id, sender_id: fakeUsers[0].id, message_text: "Fantastic! Are you available for a quick call tomorrow at 10 AM PST?", created_at: ago(5) },
    ];

    const { error: messagesError } = await supabase.from('messages').insert(messages);
    if (messagesError) {
        console.error('Error inserting messages:', messagesError);
        return;
    }

    console.log('Seeding complete! Your resume-ready chats have been generated.');
}

seed().catch(console.error);
