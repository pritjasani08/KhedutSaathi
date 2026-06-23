import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setSuccess('OTP sent successfully to your email');
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          newPassword: passwords.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
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
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="KhedutSaathi Logo" className="w-24 h-24 sm:w-28 sm:h-28 object-contain relative z-10 pointer-events-none" />
            </div>
            <h1 className="font-display text-3xl font-bold text-heading mb-2 relative z-20">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-body opacity-80">
              {step === 1 
                ? 'Enter your registered email to receive an OTP.' 
                : `We sent a 6-digit OTP to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-600 dark:text-green-400 text-sm text-center">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 group mt-6 disabled:opacity-70"
              >
                <KeyRound className="w-5 h-5" />
                {loading ? 'Sending OTP...' : 'Send OTP'}
                {!loading && <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
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

              <div>
                <label className="block text-sm font-semibold text-heading mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter new password"
                    className="input-field pl-11 pr-11"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
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
                    placeholder="Confirm new password"
                    className="input-field pl-11 pr-11"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 group mt-6 disabled:opacity-70"
              >
                <KeyRound className="w-5 h-5" />
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setStep(1); setSuccess(''); setError(''); }}
                  className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                  Change Email / Back
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-8 text-sm text-body opacity-80">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
