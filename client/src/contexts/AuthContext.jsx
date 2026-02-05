import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.access_token) {
                apiService.setToken(session.access_token);
                loadProfile();
                socketService.connect(session.access_token);
            }

            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.access_token) {
                apiService.setToken(session.access_token);
                loadProfile();
                socketService.connect(session.access_token);
            } else {
                apiService.clearToken();
                socketService.disconnect();
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await apiService.getProfile();
            setProfile(data.user);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const signUp = async (email, password, username) => {
        try {
            // Sign up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Create user profile
            if (data.session) {
                apiService.setToken(data.session.access_token);
                await apiService.createProfile(username);
                await loadProfile();
            }

            return { data, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error };
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        }
    };

    const signOut = async () => {
        try {
            socketService.disconnect();
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setProfile(null);
            apiService.clearToken();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const updateProfile = async (updates) => {
        try {
            const data = await apiService.updateProfile(updates.username, updates.avatar_url);
            setProfile(data.user);
            return { data, error: null };
        } catch (error) {
            console.error('Update profile error:', error);
            return { data: null, error };
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        loadProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
