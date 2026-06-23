const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.getSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('ai_chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
            
        if (error) throw error;
        res.json({ sessions: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id, title, messages } = req.body;
        
        if (id) {
            // Update existing session
            const { data, error } = await supabase
                .from('ai_chat_sessions')
                .update({ title, messages, updated_at: new Date() })
                .eq('id', id)
                .eq('user_id', userId)
                .select();
            if (error) throw error;
            res.json({ session: data[0] });
        } else {
            // Insert new session without limits
            const { data, error } = await supabase
                .from('ai_chat_sessions')
                .insert({ user_id: userId, title, messages })
                .select();
                
            if (error) throw error;
            res.json({ session: data[0] });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { error } = await supabase
            .from('ai_chat_sessions')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
            
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
