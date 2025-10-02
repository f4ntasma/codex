import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { securityConfig } from "@/lib/config";

// Post -> Iniciar sesión
export async function POST(request: Request) {
    const { email, password } = await request.json();

    const { data, error } = await supabaseAdmin
        .auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
}