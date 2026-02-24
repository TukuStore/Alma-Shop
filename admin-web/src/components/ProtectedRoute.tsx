import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdminStore } from '../store/useAdminStore';
import type { AdminUser } from '../types';

async function resolveAdminUser(userId: string, email: string): Promise<AdminUser | null> {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('user_id', userId)
            .maybeSingle();

        if (!profile || profile.role !== 'admin') return null;
        return { id: userId, email, fullName: profile.full_name, avatarUrl: profile.avatar_url ?? undefined, role: profile.role } as AdminUser;
    } catch {
        return null;
    }
}

export default function ProtectedRoute() {
    const { user, isAuthLoading, setUser, setAuthLoading } = useAdminStore();

    useEffect(() => {
        let mounted = true;

        // If user is not yet loaded (e.g., first ever load without persist data), do the manual check.
        if (!user) {
            setAuthLoading(true);
            const timeout = setTimeout(() => {
                if (mounted) { setUser(null); setAuthLoading(false); }
            }, 8000);

            (async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!mounted) return;

                    if (!session) {
                        setUser(null);
                        return;
                    }

                    const admin = await resolveAdminUser(session.user.id, session.user.email ?? '');
                    if (!mounted) return;

                    if (admin) setUser(admin);
                    else {
                        supabase.auth.signOut().catch(() => { });
                        setUser(null);
                    }
                } catch {
                    if (mounted) setUser(null);
                } finally {
                    clearTimeout(timeout);
                    if (mounted) setAuthLoading(false);
                }
            })();
        }

        // Always attach listener to handle token expiry / sign-outs
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            if (event === 'SIGNED_OUT' || !session) {
                setUser(null);
                setAuthLoading(false);
            }
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}
