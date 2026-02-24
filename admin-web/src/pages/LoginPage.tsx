import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdminStore } from '../store/useAdminStore';
import type { AdminUser } from '../types';

export default function LoginPage() {
    const navigate = useNavigate();
    const setUser = useAdminStore(s => s.setUser);
    const setAuthLoading = useAdminStore(s => s.setAuthLoading);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;
            if (!data.session) throw new Error('No session');

            // Verify admin role
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url, role')
                .eq('user_id', data.session.user.id)
                .maybeSingle();

            if (!profile || profile.role !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Access denied. This portal is for administrators only.');
            }

            // ✅ Populate the store BEFORE navigating so ProtectedRoute skips re-verification
            const admin: AdminUser = {
                id: data.session.user.id,
                email: data.session.user.email!,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url ?? undefined,
                role: profile.role,
            };
            setUser(admin);
            setAuthLoading(false);
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err.message ?? 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
            </div>

            <div className="w-full max-w-sm relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-black text-2xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Alma Admin</h1>
                    <p className="text-muted-foreground text-sm mt-1">Sign in to manage your store</p>
                </div>

                {/* Form Card */}
                <div className="card border-border/50">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="flex items-start gap-2.5 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                                <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input pl-9"
                                    placeholder="admin@almastore.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input pl-9 pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Alma Shop Admin Portal · All rights reserved
                </p>
            </div>
        </div>
    );
}
