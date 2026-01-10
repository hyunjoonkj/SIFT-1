import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Accessing the database with service role key for admin tasks (saving scraped content)
const mockClient = {
    from: (table: string) => ({
        insert: (data: any) => ({
            select: () => ({
                single: async () => ({
                    data: { id: 'mock-id', ...data },
                    error: null
                })
            })
        })
    })
};

export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey)
    : mockClient as any;
