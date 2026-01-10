# SIFT Architecture

## Overview
SIFT is a "Context Engine" that converts ephemeral social media streams into structured knowledge blocks.

## Tech Stack

### Mobile App (Frontend)
- **Framework**: React Native (Expo)
- **Routing**: Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **Language**: TypeScript
- **Iconography**: Lucide React Native
- **Markdown Rendering**: react-native-markdown-display

### API (Backend)
- **Framework**: Next.js App Router (API Routes)
- **Hosting**: Vercel (Intended)
- **Language**: TypeScript

### Services
- **Scraping**: Apify (clockworks/tiktok-scraper)
- **AI Synthesis**: OpenAI GPT-4o
- **Database**: Supabase (PostgreSQL)

## Data Flow

1. **Input**: User shares a URL via iOS Share Sheet to the SIFT app.
2. **Processing**:
   - App behaves as a share target (Accepts content intent).
   - App sends `{ url, platform }` to `/api/sift` endpoint.
   - API triggers Apify Actor to scrape video/transcript.
   - API sends raw data to OpenAI with `PROMPTS.md` system prompt.
   - OpenAI returns structured Markdown.
3. **Storage**:
   - Structured data is saved to Supabase `pages` table.
4. **Display**:
   - App observes Supabase subscription (or polls) for new content.
   - Renders content as a "Page" card in the workspace.

## Database Schema

### `pages`
| Column | Type | Notes |
| data | | |
| `id` | `uuid` | PK, Default: `gen_random_uuid()` |
| `created_at` | `timestamptz` | Default: `now()` |
| `url` | `text` | Source URL |
| `platform` | `text` | 'tiktok' \| 'instagram' |
| `title` | `text` | Generated title |
| `summary` | `text` | "The Gist" |
| `content` | `text` | Full markdown body |
| `tags` | `text[]` | Extracted tags |
| `metadata` | `jsonb` | `{ mood, context, format }` |
