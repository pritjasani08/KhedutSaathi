const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

// 1. Standard Anon Client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Service Role Client (trusted operations only)
let supabaseAdmin = null;
if (supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
    // Fail fast in production if missing
    if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: SUPABASE_SERVICE_ROLE_KEY is required in production.');
    } else {
        console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Trusted backend operations will fail.');
        supabaseAdmin = {
            from: () => ({
                select: () => { throw new Error('SUPABASE_SERVICE_ROLE_KEY missing'); },
                insert: () => { throw new Error('SUPABASE_SERVICE_ROLE_KEY missing'); },
                update: () => { throw new Error('SUPABASE_SERVICE_ROLE_KEY missing'); },
                delete: () => { throw new Error('SUPABASE_SERVICE_ROLE_KEY missing'); }
            })
        };
    }
}

/**
 * 🚨 DATABASE INFRASTRUCTURE 🚨
 * Centralized database client selection.
 * Services should use `getDbClient()` rather than importing specific clients directly.
 */
exports.getDbClient = (useAdmin = false) => {
    return useAdmin ? supabaseAdmin : supabase;
};

// Also export them individually for legacy controllers that haven't been refactored yet
exports.supabase = supabase;
exports.supabaseAdmin = supabaseAdmin;
