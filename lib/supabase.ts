import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
    require('react-native-url-polyfill/auto');
}

// Read environment variables with hardcoded fallbacks for production builds
// In EAS builds, .env files may not be bundled, so we provide fallback values
const FALLBACK_SUPABASE_URL = 'https://fhkzfwebhcyxhrnojwra.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoa3pmd2ViaGN5eGhybm9qd3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMjY2MzIsImV4cCI6MjA4NjcwMjYzMn0.u4UVwJ_umJHVq_bofs7A_az5GWUrhWVT7lpHhYu3rM';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Check if URL is valid
const isValidUrl = supabaseUrl && supabaseUrl.includes('.supabase.co');

const finalUrl = supabaseUrl;
const finalKey = supabaseAnonKey;

// Platform-aware storage: localStorage on web, AsyncStorage on native
const platformStorage =
    Platform.OS === 'web'
        ? {
            getItem: (key: string) => {
                if (typeof window !== 'undefined') {
                    return window.localStorage.getItem(key);
                }
                return null;
            },
            setItem: (key: string, value: string) => {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, value);
                }
            },
            removeItem: (key: string) => {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem(key);
                }
            },
        }
        : AsyncStorage;

// Export flag to check if Supabase is properly configured
export const isSupabaseConfigured = isValidUrl && !!supabaseAnonKey;

// Create client (will be in offline mode if not configured)
export const supabase = createClient(finalUrl, finalKey, {
    auth: {
        storage: platformStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
    },
    global: {
        headers: {
            'X-Client-Info': 'alma-store-app',
        },
    },
    db: {
        schema: 'public',
    },
});
