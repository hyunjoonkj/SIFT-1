const fs = require('fs');
const path = require('path');
const { ApifyClient } = require('apify-client');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Manually load .env.local
try {
    const envPath = path.resolve(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, ''); // strip quotes
            process.env[key.trim()] = val;
        }
    });
    console.log("Loaded .env.local");
} catch (e) {
    console.error("Failed to load .env.local", e);
}

async function testApify() {
    console.log("--- Testing Apify ---");
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
        console.error("MISSING APIFY_API_TOKEN");
        return;
    }
    console.log("Token starts with:", token.substring(0, 5));
    try {
        const client = new ApifyClient({ token });
        const user = await client.user().get();
        console.log("✅ Apify Success! User:", user.username);
    } catch (e) {
        console.error("❌ Apify Failed:", e.message);
        if (e.cause) console.error("Cause:", e.cause);
    }
}

async function testOpenAI() {
    console.log("\n--- Testing OpenAI ---");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("MISSING OPENAI_API_KEY");
        return;
    }
    console.log("Key starts with:", apiKey.substring(0, 5));
    try {
        const openai = new OpenAI({ apiKey });
        const models = await openai.models.list();
        console.log("✅ OpenAI Success! Models available:", models.data.length);
    } catch (e) {
        console.error("❌ OpenAI Failed:", e.message);
    }
}

async function testSupabase() {
    console.log("\n--- Testing Supabase ---");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL; // Note: lib/supabase.ts used this env var name
    // Actually, in .env.local I set "NEXT_PUBLIC_SUPABASE_URL"? No.
    // In .env.local I audited: "EXPO_PUBLIC_SUPABASE_URL" (mobile) vs ...
    // Let's check what I actually set.
    // I set "SUPABASE_SERVICE_ROLE_KEY" and "APIFY..."
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // In lib/supabase.ts (API), it reads:
    // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    // BUT I might have forgotten to set NEXT_PUBLIC_SUPABASE_URL in .env.local for the API!
    // I set EXPO_PUBLIC_SUPABASE_URL in mobile.
    // Let's check if NEXT_PUBLIC_SUPABASE_URL is in .env.local.

    if (!url) console.error("MISSING SUPABASE URL (NEXT_PUBLIC_SUPABASE_URL)");
    if (!serviceKey) console.error("MISSING SERVICE KEY");

    if (url && serviceKey) {
        try {
            const sb = createClient(url, serviceKey);
            const { data, error } = await sb.from('pages').select('count', { count: 'exact', head: true });
            if (error) console.error("❌ Supabase Failed:", error.message);
            else console.log("✅ Supabase Success! Connection valid.");
        } catch (e) {
            console.error("❌ Supabase Exception:", e.message);
        }
    }
}

async function run() {
    await testApify();
    await testOpenAI();
    await testSupabase();
}

run();
