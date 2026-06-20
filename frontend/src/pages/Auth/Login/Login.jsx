import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Context login
      login(data.user);
      
      // Save JWT token for API requests
      localStorage.setItem('token', data.token);
      
      // Redirect based on user type
      if (data.user.user_type === 'seller') {
        navigate('/seller-dashboard/products');
      } else if (data.user.user_type === 'buyer') {
        navigate('/agri-marketplace');
      } else {
        navigate('/');
      }
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
            <h1 className="font-display text-3xl font-bold text-heading mb-3">Welcome Back</h1>
            <p className="text-body opacity-80">Log in to continue to your dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-heading mb-2">Email or Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your email or number"
                  className="input-field pl-11"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-heading">Password</label>
                <Link to="#" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 group mt-6 disabled:opacity-70"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />}
            </button>
          </form>


          <p className="text-center mt-8 text-sm text-body opacity-80">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
