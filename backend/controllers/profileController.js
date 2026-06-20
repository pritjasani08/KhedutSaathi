const supabase = require('../config/supabaseClient');

const calculateCompletion = (profile) => {
  if (!profile) return 0;
  
  const fields = [
    'full_name', 'state', 'district', 'village', 'preferred_language',
    'farm_size', 'soil_type', 'primary_crop', 'secondary_crop', 'irrigation_type',
    'age', 'gender', 'farmer_category'
  ];
  
  let filled = 0;
  fields.forEach(field => {
    if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') {
      filled++;
    }
  });
  
  return Math.round((filled / fields.length) * 100);
};

const getProfile = async (req, res) => {
  console.log('[Backend] Route hit: GET /api/profile');
  try {
    const userId = req.user.id;
    
    const { data: profile, error } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ message: 'Failed to fetch profile' });
    }
    
    const completion = calculateCompletion(profile);
    
    res.status(200).json({ 
      profile: profile || {}, 
      completionPercentage: completion 
    });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

const upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    let result;
    
    if (existingProfile) {
      // Update
      const { data, error } = await supabase
        .from('farmer_profiles')
        .update({
          ...profileData,
          updated_at: new Date()
        })
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('farmer_profiles')
        .insert([{
          user_id: userId,
          ...profileData
        }])
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    }
    
    const completion = calculateCompletion(result);
    
    res.status(200).json({ 
      message: 'Profile saved successfully', 
      profile: result,
      completionPercentage: completion
    });
  } catch (error) {
    console.error('upsertProfile error:', error);
    res.status(500).json({ message: 'Server error saving profile' });
  }
};

module.exports = {
  getProfile,
  upsertProfile
};
