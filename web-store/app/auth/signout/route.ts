import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const url = new URL(request.url);

    // Sign out the user
    await supabase.auth.signOut();

    // Clear any potential cache and redirect to login
    return NextResponse.redirect(`${url.origin}/auth/login`, {
        status: 301,
    });
}
