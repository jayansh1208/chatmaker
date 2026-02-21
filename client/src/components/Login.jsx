import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                if (!username || username.trim().length < 3) {
                    setError('Username must be at least 3 characters');
                    setLoading(false);
                    return;
                }

                const { error } = await signUp(email, password, username);
                if (error) {
                    // Provide user-friendly error messages for signup
                    if (error.message?.includes('already registered')) {
                        setError('This email is already registered. Please sign in instead.');
                    } else if (error.message?.includes('Password')) {
                        setError('Password must be at least 6 characters long.');
                    } else {
                        setError('Unable to create account. Please try again.');
                    }
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    // Provide user-friendly error messages for login
                    if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid')) {
                        setError('Email or password is incorrect. Please try again or sign up for a new account.');
                    } else if (error.message?.includes('Email not confirmed')) {
                        setError('Please check your email and confirm your account first.');
                    } else {
                        setError('Unable to sign in. Please check your credentials and try again.');
                    }
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-mesh-light dark:bg-mesh-dark relative overflow-hidden px-4">

            {/* Animated background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-400/30 dark:bg-primary-600/20 rounded-full blur-[120px] animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[45%] h-[45%] bg-violet-400/30 dark:bg-violet-600/20 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-md w-full z-10">
                {/* Logo/Title */}
                <div className="text-center mb-10 animate-fade-in relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md rounded-2xl shadow-xl shadow-primary-500/10 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-violet-600 dark:from-primary-400 dark:to-violet-400 tracking-tight mb-3">ChatMakere</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time messaging made simple</p>
                </div>

                {/* Auth Form */}
                {/* Auth Form */}
                <div className="glass-card p-10 animate-slide-up">
                    <h2 className="text-2xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 animate-pop-in text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignUp && (
                            <div className="animate-fade-in">
                                <label htmlFor="username" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-dark-900/50 border border-white/40 dark:border-dark-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 dark:text-white transition-all shadow-sm placeholder-slate-400"
                                    placeholder="johndoe"
                                    required={isSignUp}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white/50 dark:bg-dark-900/50 border border-white/40 dark:border-dark-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 dark:text-white transition-all shadow-sm placeholder-slate-400"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white/50 dark:bg-dark-900/50 border border-white/40 dark:border-dark-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 dark:text-white transition-all shadow-sm placeholder-slate-400"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 text-base font-bold mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                isSignUp ? 'Sign Up' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-semibold transition-colors focus:outline-none"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>

                        {!isSignUp && (
                            <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-800/50 py-2 px-3 rounded-lg inline-block">
                                💡 First time here? Create an account by clicking "Sign Up" above
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500/70 dark:text-slate-500 text-sm mt-10 font-medium">
                    Built with React, Socket.io & Supabase
                </p>
            </div>
        </div>
    );
}
