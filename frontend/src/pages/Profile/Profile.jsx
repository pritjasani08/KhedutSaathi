import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Users, Save, X, Edit2, MapPin, Languages, Sprout, Droplets, Trees } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    userType: 'farmer',
    
    // Farmer Profile Fields
    state: '',
    district: '',
    village: '',
    preferred_language: 'English',
    age: '',
    gender: '',
    farmer_category: '',
    farm_size: '',
    soil_type: '',
    primary_crop: '',
    secondary_crop: '',
    irrigation_type: ''
  });

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/api/profile`;
      console.log('[Frontend] Requesting URL:', url);
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('[Frontend] Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        setCompletionPercentage(data.completionPercentage || 0);
        const profile = data.profile || {};
        
        setFormData({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          mobile: user.mobile || '',
          userType: user.user_type || 'farmer',
          
          state: profile.state || '',
          district: profile.district || '',
          village: profile.village || '',
          preferred_language: profile.preferred_language || 'English',
          age: profile.age || '',
          gender: profile.gender || '',
          farmer_category: profile.farmer_category || '',
          farm_size: profile.farm_size || '',
          soil_type: profile.soil_type || '',
          primary_crop: profile.primary_crop || '',
          secondary_crop: profile.secondary_crop || '',
          irrigation_type: profile.irrigation_type || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchProfileData();
    }
  }, [user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const authRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobile: formData.mobile,
          userType: formData.userType
        }),
      });

      if (!authRes.ok) {
        const data = await authRes.json();
        throw new Error(data.message || 'Failed to update user details');
      }

      if (formData.userType === 'farmer') {
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            state: formData.state,
            district: formData.district,
            village: formData.village,
            preferred_language: formData.preferred_language,
            age: formData.age ? parseInt(formData.age, 10) : null,
            gender: formData.gender,
            farmer_category: formData.farmer_category,
            farm_size: formData.farm_size ? parseFloat(formData.farm_size) : null,
            soil_type: formData.soil_type,
            primary_crop: formData.primary_crop,
            secondary_crop: formData.secondary_crop,
            irrigation_type: formData.irrigation_type
          }),
        });

        if (!profileRes.ok) {
          const data = await profileRes.json();
          throw new Error(data.message || 'Failed to update farm details');
        }
        
        const profileData = await profileRes.json();
        setCompletionPercentage(profileData.completionPercentage || 0);
      }

      updateUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile: formData.mobile,
        user_type: formData.userType
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    fetchProfileData(); // Reset form to original data
  };

  if (!user) return null;

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 sm:p-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-subtle gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-heading">My Profile</h1>
              <p className="text-body opacity-80 mt-1">Manage your account details and farm preferences.</p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2 whitespace-nowrap"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 border-4 border-surface shadow-sm">
                <User className="w-16 h-16" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-heading">{user.first_name} {user.last_name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-light text-xs font-semibold rounded-full uppercase tracking-wider">
                  {user.user_type}
                </span>
                {user.user_type === 'farmer' && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Profile Completion</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-bold text-heading mb-4 pb-2 border-b border-subtle">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-heading mb-2">First Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                          <input type="text" required className="input-field pl-11" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-heading mb-2">Last Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                          <input type="text" required className="input-field pl-11" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-heading mb-2">Mobile Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-5 h-5" />
                          </div>
                          <input type="tel" required className="input-field pl-11" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-heading mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-5 h-5" />
                          </div>
                          <input type="email" disabled className="input-field pl-11 opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50" value={user.email} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-heading mb-2">Preferred Language</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Languages className="w-5 h-5" />
                          </div>
                          <select className="input-field pl-11 appearance-none" value={formData.preferred_language} onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}>
                            <option value="English">English</option>
                            <option value="Gujarati">Gujarati</option>
                            <option value="Hindi">Hindi</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-heading mb-2">Age</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <User className="w-5 h-5" />
                          </div>
                          <input type="number" min="18" max="100" className="input-field pl-11" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-heading mb-2">Gender</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <select className="input-field pl-11 appearance-none" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  {formData.userType === 'farmer' && (
                    <div>
                      <h3 className="text-lg font-bold text-heading mb-4 pb-2 border-b border-subtle">Location Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-heading mb-2">State</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <input type="text" className="input-field pl-11" placeholder="e.g. Gujarat" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-heading mb-2">District</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <input type="text" className="input-field pl-11" placeholder="e.g. Rajkot" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-heading mb-2">Village / Town</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <input type="text" className="input-field pl-11" placeholder="Your village name" value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Farm Information */}
                  {formData.userType === 'farmer' && (
                    <div>
                      <h3 className="text-lg font-bold text-heading mb-4 pb-2 border-b border-subtle">Farm Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-heading mb-2">Farmer Category</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <Users className="w-5 h-5" />
                            </div>
                            <select className="input-field pl-11 appearance-none" value={formData.farmer_category} onChange={(e) => setFormData({ ...formData, farmer_category: e.target.value })}>
                              <option value="">Select Category</option>
                              <option value="Small & Marginal">Small & Marginal (&lt; 2 Ha)</option>
                              <option value="Large">Large (&gt; 2 Ha)</option>
                              <option value="SC/ST">SC/ST</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-heading mb-2">Farm Size (Acres)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <Trees className="w-5 h-5" />
                            </div>
                            <input type="number" step="0.1" className="input-field pl-11" placeholder="e.g. 5.5" value={formData.farm_size} onChange={(e) => setFormData({ ...formData, farm_size: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-heading mb-2">Soil Type</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <Sprout className="w-5 h-5" />
                            </div>
                            <select className="input-field pl-11 appearance-none" value={formData.soil_type} onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}>
                              <option value="">Select Soil Type</option>
                              <option value="Black Soil">Black Soil</option>
                              <option value="Red Soil">Red Soil</option>
                              <option value="Alluvial Soil">Alluvial Soil</option>
                              <option value="Laterite Soil">Laterite Soil</option>
                              <option value="Sandy Soil">Sandy Soil</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-heading mb-2">Primary Crop</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <Sprout className="w-5 h-5" />
                            </div>
                            <input type="text" className="input-field pl-11" placeholder="e.g. Wheat" value={formData.primary_crop} onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-heading mb-2">Secondary Crop</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <Sprout className="w-5 h-5" />
                            </div>
                            <input type="text" className="input-field pl-11" placeholder="e.g. Cotton" value={formData.secondary_crop} onChange={(e) => setFormData({ ...formData, secondary_crop: e.target.value })} />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-heading mb-2">Irrigation Type</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                              <Droplets className="w-5 h-5" />
                            </div>
                            <select className="input-field pl-11 appearance-none" value={formData.irrigation_type} onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}>
                              <option value="">Select Irrigation Method</option>
                              <option value="Drip">Drip Irrigation</option>
                              <option value="Sprinkler">Sprinkler System</option>
                              <option value="Surface/Canal">Surface / Canal</option>
                              <option value="Rainfed">Rainfed (Dependent on Rain)</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 border-t border-subtle">
                    <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={cancelEdit} disabled={loading} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  {/* Personal Summary */}
                  <div>
                    <h3 className="text-lg font-bold text-heading mb-4 pb-2 border-b border-subtle">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface/50 dark:bg-slate-800/30 rounded-2xl p-6 border border-subtle">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><User className="w-4 h-4"/> Full Name</p>
                        <p className="text-heading font-semibold text-lg">{user.first_name} {user.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</p>
                        <p className="text-heading font-semibold text-lg break-all">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><Phone className="w-4 h-4"/> Mobile Number</p>
                        <p className="text-heading font-semibold text-lg">{user.mobile}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><Languages className="w-4 h-4"/> Preferred Language</p>
                        <p className="text-heading font-semibold text-lg">{formData.preferred_language}</p>
                      </div>
                    </div>
                  </div>

                  {/* Farm Summary */}
                  {user.user_type === 'farmer' && (
                    <div>
                      <h3 className="text-lg font-bold text-heading mb-4 pb-2 border-b border-subtle">Farm Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface/50 dark:bg-slate-800/30 rounded-2xl p-6 border border-subtle">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</p>
                          <p className="text-heading font-semibold text-lg">
                            {[formData.village, formData.district, formData.state].filter(Boolean).join(', ') || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><Trees className="w-4 h-4"/> Farm Size & Category</p>
                          <p className="text-heading font-semibold text-lg">
                            {[formData.farm_size ? `${formData.farm_size} Acres` : '', formData.farmer_category].filter(Boolean).join(' • ') || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><Sprout className="w-4 h-4"/> Crops</p>
                          <p className="text-heading font-semibold text-lg">
                            {[formData.primary_crop, formData.secondary_crop].filter(Boolean).join(', ') || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2"><Droplets className="w-4 h-4"/> Irrigation & Soil</p>
                          <p className="text-heading font-semibold text-lg">
                            {[formData.irrigation_type, formData.soil_type].filter(Boolean).join(' • ') || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
