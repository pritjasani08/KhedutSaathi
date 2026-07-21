require('dotenv').config();
const fs = require('fs');
const { getDbClient } = require('./config/db');
const db = getDbClient(true);

// Supabase POSTGREST does not natively expose a generic exec_sql unless it's created.
// Wait, in previous steps I saw `exec_sql` wasn't always available. The user had to run it manually or we did it another way.
// Let's use `psql` if it exists, or just tell the user to apply them.
// Wait, KhedutSaathi backend doesn't have a direct postgres connection string in `.env`, just SUPABASE_URL.
// I will try to run them via the `supabase` CLI if the user has it, or just use node-postgres if the URI is there.
// Let me check if `exec_sql` exists by trying to call it.
async function apply(file) {
    const sql = fs.readFileSync(file, 'utf8');
    const stmts = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const s of stmts) {
        if (s.startsWith('--')) continue; // skip pure comment blocks
        const { error } = await db.rpc('exec_sql', { query: s });
        if (error) {
            console.error(`Error in ${file} for query ${s.substring(0,50)}: ${error.message}`);
        }
    }
    console.log(`Applied ${file}`);
}

async function run() {
    await apply('supabase_automation_processed_events.sql');
    await apply('supabase_automation_failed_events.sql');
    await apply('supabase_automation_replay_audits.sql');
}
run().catch(console.error);
