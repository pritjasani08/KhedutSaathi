const supabase = require('../config/supabaseClient');
const logger = require('../utils/logger');
const { resolveFarmerProfile, FarmerProfileNotFoundError } = require('../services/profileResolver');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let profileId;
        try {
            const resolution = await resolveFarmerProfile(userId);
            profileId = resolution.farmerProfileId;
        } catch (err) {
            if (err instanceof FarmerProfileNotFoundError) {
                return res.status(404).json({ status: 'error', message: 'Farmer profile not found' });
            }
            throw err;
        }
        
        // Fetch active notifications for user
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', profileId)
            .neq('status', 'DISMISSED')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return res.status(200).json({ status: 'success', data: data || [] });
    } catch (err) {
        logger.error(`Error fetching notifications: ${err.message}`);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const resolution = await resolveFarmerProfile(userId);
        const profileId = resolution.farmerProfileId;
        const notificationId = req.params.id;
        
        const { data, error } = await supabase
            .from('notifications')
            .update({ 
                is_read: true, 
                read_at: new Date().toISOString() 
            })
            .eq('id', notificationId)
            .eq('user_id', profileId)
            .select();
            
        if (error) throw error;
        
        return res.status(200).json({ status: 'success', data });
    } catch (err) {
        logger.error(`Error marking notification read: ${err.message}`);
        return res.status(500).json({ status: 'error', message: 'Failed to update notification' });
    }
};

exports.dismissNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const resolution = await resolveFarmerProfile(userId);
        const profileId = resolution.farmerProfileId;
        const notificationId = req.params.id;
        
        const { data, error } = await supabase
            .from('notifications')
            .update({ 
                status: 'DISMISSED',
                dismissed_at: new Date().toISOString() 
            })
            .eq('id', notificationId)
            .eq('user_id', profileId)
            .select();
            
        if (error) throw error;
        
        return res.status(200).json({ status: 'success', data });
    } catch (err) {
        logger.error(`Error dismissing notification: ${err.message}`);
        return res.status(500).json({ status: 'error', message: 'Failed to dismiss notification' });
    }
};