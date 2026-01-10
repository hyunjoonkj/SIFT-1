
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ApifyClient } from 'apify-client';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

// Initialize clients safely
const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

// Avoid crashing if key is missing
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const SYSTEM_PROMPT = `
**Role:** You are "Sift," an observant and insightful digital librarian.
**Goal:** Distill social media content into a clear, engaging, and well-structured "Page" for the user's personal knowledge base.
**Tone:** Conversational, intelligent, and warm. Avoid robotic "business" language. Write like a smart friend summarizing something interesting they found.

**Analysis Protocol:**
1.  **Digest:** Understand the core message, the mood, and the context (including memes/slang).
2.  **Clarify:** specific jargon or slang should be explained naturally within the text, not just translated.
3.  **Synthesize:** Weave the "Metadata" (mood, format) into the narrative itself rather than isolating it in a table.

**Output Format (Strict Markdown):**

# [A Short, Engaging Title]

> **💡 The Gist**
> [A 1-2 sentence hook that captures the essence and value of the content. Make it punchy.]

---

### 🧠 The Breakdown
[A fluid, paragraph-based explanation of the content. Start by setting the scene or context. Then, explain the key points or the narrative arc. If there are specific actionable steps or distinct points, you can use bullet points, but don't force them if a paragraph flows better. Mention the creator's tone or the "vibe" here naturally.]

### 💭 Context & Nuance
[Optional section. Use this if the content relies heavily on a specific trend, meme, or cultural moment that needs unpacking. If not needed, fold this into "The Breakdown".]

### 📎 Tags
\`#Topic\` \`#Vibe\` \`#Creator\`
`;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, platform } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`[SIFT] Processing URL: ${url} (${platform})`);

        // 1. Scrape Content
        let scrapedData = {};

        if (process.env.APIFY_API_TOKEN) {
            console.log('[SIFT] Apify Token present. Starting scrape...');

            // STRICT INPUTS: Save bandwidth/cost by disabling rich media
            // Note: clockworks/tiktok-scraper uses 'postURLs' for direct video links
            const input = {
                "postURLs": [url],
                "shouldDownloadVideos": false,    // <--- CRITICAL: Saves bandwidth
                "shouldDownloadCovers": false,    // <--- CRITICAL: Saves bandwidth
                "shouldDownloadSlideshowImages": false,
                "proxyConfiguration": {
                    "useApifyProxy": true
                }
            };

            // Using clockworks/tiktok-scraper which matches these inputs
            const run = await apifyClient.actor('clockworks/tiktok-scraper').call(input);
            const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
            scrapedData = items[0] || {};
        } else {
            console.log('[SIFT] No Apify Token. Using mock data.');
            scrapedData = {
                caption: "This is a test caption about productivity hacks.",
                transcript: "Speaker 1: Here are three ways to save time."
            };
        }

        // DEBUG LOGGING
        try {
            fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `[${new Date().toISOString()}] Scraped Data: ${JSON.stringify(scrapedData, null, 2)}\n`);
        } catch (e) { }

        // 2. Synthesize with OpenAI
        let content = "";
        let title = "Untitled Page";
        let summary = "No summary generated.";
        let tags: string[] = [];

        if (openai) {
            console.log('[SIFT] OpenAI Key present. Generating summary...');
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: JSON.stringify(scrapedData) }
                ],
            });

            content = completion.choices[0].message.content || "";

            // DEBUG LOGGING
            try {
                fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `[${new Date().toISOString()}] OpenAI Content: ${content}\n`);
            } catch (e) { }

            const titleMatch = content.match(/^#\s+(.+)$/m);
            if (titleMatch) title = titleMatch[1];

            const summaryMatch = content.match(/>\s*\*\*(?:💡\s*)?The Gist\*\*\s*>\s*(.+)/);
            if (summaryMatch) summary = summaryMatch[1];

            const tagsMatch = content.match(/`#([^`]+)`/g);
            if (tagsMatch) {
                tags = tagsMatch.map(t => t.replace(/[`#]/g, ''));
            }

        } else {
            console.log('[SIFT] No OpenAI Key. Using mock content.');
            content = "# Test Page\n\n> **💡 The Gist**\n> This is a mock summary.\n\n### Key Takeaways\n* Point 1";
            title = "Test Page";
            summary = "This is a mock summary.";
            tags = ["Test", "Mock"];
        }


        // 3. Save to Supabase
        console.log('[SIFT] Saving to Supabase...');
        const { data, error } = await supabaseAdmin
            .from('pages')
            .insert({
                url,
                platform: platform || 'unknown',
                title,
                summary,
                content,
                tags,
                metadata: {
                    source: 'sift-api',
                    scraped_at: new Date().toISOString()
                }
            })
            .select()
            .single();

        if (error) {
            console.error('[SIFT] Supabase Error:', error);
            // Don't fail the request if Supabase fails in dev/mock, just warn?
            // Actually, if using mock client, error is null.
            // If real client and fails, we should return error.
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, page: data });

    } catch (error: unknown) {
        console.error('[SIFT] Internal Error:', error);
        try {
            const logPath = path.join(process.cwd(), 'error.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${error instanceof Error ? error.stack : String(error)}\n`);
        } catch (e) {
            console.error('Failed to write log:', e);
        }
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
