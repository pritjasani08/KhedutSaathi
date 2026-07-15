const axios = require('axios');
const supabase = require('./config/supabaseClient');

async function fixUser() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'workforcharge007@gmail.com',
            password: '1234'
        });
        const user = res.data.user;
        console.log("LOGGED IN USER:", user);

        // Fetch their profile ID
        const { data: profile } = await supabase.from('farmer_profiles').select('id').eq('user_id', user.id).single();
        let profileId = profile?.id;
        
        if (!profileId) {
            console.log("No profile, using user.id");
            profileId = user.id; // Sometimes id and user_id are the same or farmer_profiles is missing
        }
        
        console.log("PROFILE ID:", profileId);
        
        const notif = {
            id: require('crypto').randomUUID(),
            user_id: profileId,
            type: 'WEATHER',
            title: 'Critical Weather Alert',
            message: 'A massive storm is approaching. This is a proactive AI alert generated specifically for you!',
            priority: 'CRITICAL',
            source: 'AI',
            generated_by: 'SYSTEM',
            notification_signature: 'manual_test_alert_' + Date.now()
        };
        
        const { error } = await supabase.from('notifications').insert(notif);
        if (error) {
            console.error("INSERT ERROR:", error);
        } else {
            console.log("Notification inserted successfully for workforcharge007!");
        }
    } catch(err) {
        console.error("ERROR:", err.response ? err.response.data : err.message);
    }
}
fixUser();
