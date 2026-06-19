import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Users, Save, X, Edit2 } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    userType: 'farmer'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        mobile: user.mobile || '',
        userType: user.user_type || 'farmer'
      });
    }
  }, [user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
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

  if (!user) return null; // Or a loading spinner

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-3xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 sm:p-10"
        >
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-subtle">
            <div>
              <h1 className="font-display text-3xl font-bold text-heading">My Profile</h1>
              <p className="text-body opacity-80 mt-1">Manage your account details and preferences.</p>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2"
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

          <div className="flex flex-col md:flex-row gap-8">
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
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-heading mb-2">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          required
                          className="input-field pl-11"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-heading mb-2">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          required
                          className="input-field pl-11"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        disabled
                        className="input-field pl-11 opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                        value={user.email}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Email address cannot be changed.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        required
                        className="input-field pl-11"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-heading mb-2">User Type</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <select
                        required
                        className="input-field pl-11 appearance-none"
                        value={formData.userType}
                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                      >
                        <option value="farmer">Farmer</option>
                        <option value="buyer">Buyer</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        setSuccess('');
                        setFormData({
                          firstName: user.first_name,
                          lastName: user.last_name,
                          mobile: user.mobile,
                          userType: user.user_type
                        });
                      }}
                      disabled={loading}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-surface/50 dark:bg-slate-800/30 rounded-2xl p-6 border border-subtle">
                    <div className="flex flex-col space-y-5">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Full Name</p>
                        <p className="text-heading font-semibold text-lg">{user.first_name} {user.last_name}</p>
                      </div>
                      <div className="h-px bg-subtle w-full"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Email Address</p>
                        <p className="text-heading font-semibold text-lg break-all">{user.email}</p>
                      </div>
                      <div className="h-px bg-subtle w-full"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Mobile Number</p>
                        <p className="text-heading font-semibold text-lg">{user.mobile}</p>
                      </div>
                      <div className="h-px bg-subtle w-full"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Role</p>
                        <p className="text-heading font-semibold text-lg capitalize">{user.user_type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
