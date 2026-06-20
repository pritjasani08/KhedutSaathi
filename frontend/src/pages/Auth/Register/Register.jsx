import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight, Eye, EyeOff, Phone, Users, ShieldCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    mobile: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    userType: 'farmer' 
  });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      // Success
      alert('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16 flex items-center justify-center">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 sm:p-10"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-heading mb-3">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-body opacity-80">
              {step === 1 
                ? 'Join KhedutSaathi and empower your farming journey.' 
                : `We sent a 6-digit OTP to ${formData.email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
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
                    placeholder="First name"
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
                    placeholder="Last name"
                    className="input-field pl-11"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
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
                  placeholder="Enter your mobile number"
                  className="input-field pl-11"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-heading mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="input-field pl-11"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-heading mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a strong password"
                  className="input-field pl-11 pr-11"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-heading mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm your password"
                  className="input-field pl-11 pr-11"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                  className="input-field pl-11 appearance-none bg-white dark:bg-slate-800"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                >
                  <option value="farmer">Farmer</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 group mt-6 disabled:opacity-70"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? 'Sending OTP...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />}
            </button>
          </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-heading mb-2">Enter OTP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    maxLength={6}
                    className="input-field pl-11 text-center tracking-widest text-lg font-bold"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 group mt-6 disabled:opacity-70"
              >
                <ShieldCheck className="w-5 h-5" />
                {loading ? 'Verifying...' : 'Verify OTP & Register'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                  Change Email / Back
                </button>
              </div>
            </form>
          )}


          <p className="text-center mt-8 text-sm text-body opacity-80">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
