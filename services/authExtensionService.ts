import { supabase } from '@/lib/supabase';

// ============================================================
// AUTH EXTENSION SERVICE
// ============================================================
// Additional authentication features:
// - Email verification
// - Password reset
// - Email update
// - Account deletion

type AuthResult = {
    success: boolean;
    message: string;
    error?: string;
};

export const authExtensionService = {
    // ============================================================
    // RESEND VERIFICATION EMAIL
    // ============================================================
    async resendVerificationEmail(email: string): Promise<AuthResult> {
        try {
            // User existence verification skipped as it requires admin privileges

            // Resend verification email using Supabase Auth
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                return {
                    success: false,
                    message: error.message,
                    error: error.name
                };
            }

            return {
                success: true,
                message: 'Verification email sent successfully. Please check your inbox.'
            };

        } catch (error: any) {
            console.error('Resend verification error:', error);
            return {
                success: false,
                message: 'Failed to send verification email',
                error: error.message
            };
        }
    },

    // ============================================================
    // REQUEST PASSWORD RESET
    // ============================================================
    async requestPasswordReset(email: string): Promise<AuthResult> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'almastore://auth/reset-password', // Deep link for mobile app
            });

            if (error) {
                return {
                    success: false,
                    message: error.message,
                    error: error.name
                };
            }

            return {
                success: true,
                message: 'Password reset link sent to your email.'
            };

        } catch (error: any) {
            console.error('Password reset request error:', error);
            return {
                success: false,
                message: 'Failed to send password reset email',
                error: error.message
            };
        }
    },

    // ============================================================
    // UPDATE PASSWORD
    // ============================================================
    async updatePassword(newPassword: string): Promise<AuthResult> {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return {
                    success: false,
                    message: error.message,
                    error: error.name
                };
            }

            return {
                success: true,
                message: 'Password updated successfully.'
            };

        } catch (error: any) {
            console.error('Update password error:', error);
            return {
                success: false,
                message: 'Failed to update password',
                error: error.message
            };
        }
    },

    // ============================================================
    // UPDATE EMAIL
    // ============================================================
    async updateEmail(newEmail: string): Promise<AuthResult> {
        try {
            const { error } = await supabase.auth.updateUser({
                email: newEmail
            });

            if (error) {
                return {
                    success: false,
                    message: error.message,
                    error: error.name
                };
            }

            return {
                success: true,
                message: 'Email updated. Please verify your new email address.'
            };

        } catch (error: any) {
            console.error('Update email error:', error);
            return {
                success: false,
                message: 'Failed to update email',
                error: error.message
            };
        }
    },

    // ============================================================
    // CHECK EMAIL VERIFICATION STATUS
    // ============================================================
    async checkEmailVerification(): Promise<{ verified: boolean; email: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return { verified: false, email: null };
            }

            return {
                verified: user.email_confirmed_at !== null,
                email: user.email || null
            };

        } catch (error) {
            console.error('Check verification error:', error);
            return { verified: false, email: null };
        }
    },

    // ============================================================
    // DELETE ACCOUNT
    // ============================================================
    async deleteAccount(userId: string): Promise<AuthResult> {
        try {
            // Delete user data from profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('user_id', userId);

            if (profileError) {
                console.warn('Profile deletion warning:', profileError);
            }

            // Delete user account using admin API
            const { error } = await supabase.auth.admin.deleteUser(userId);

            if (error) {
                return {
                    success: false,
                    message: error.message,
                    error: error.name
                };
            }

            return {
                success: true,
                message: 'Account deleted successfully.'
            };

        } catch (error: any) {
            console.error('Delete account error:', error);
            return {
                success: false,
                message: 'Failed to delete account',
                error: error.message
            };
        }
    },

    // ============================================================
    // GET CURRENT SESSION
    // ============================================================
    async getCurrentSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            return {
                session,
                user: session?.user || null,
                isAuthenticated: !!session
            };

        } catch (error) {
            console.error('Get session error:', error);
            return {
                session: null,
                user: null,
                isAuthenticated: false
            };
        }
    },

    // ============================================================
    // REFRESH SESSION
    // ============================================================
    async refreshSession() {
        try {
            const { data: { session }, error } = await supabase.auth.refreshSession();

            if (error) throw error;

            return {
                session,
                user: session?.user || null,
                isAuthenticated: !!session
            };

        } catch (error) {
            console.error('Refresh session error:', error);
            return {
                session: null,
                user: null,
                isAuthenticated: false
            };
        }
    }
};
