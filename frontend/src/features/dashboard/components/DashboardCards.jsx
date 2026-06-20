import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, MapPin, Trees, Sprout, Activity, ShieldCheck, CloudRain, Droplets, Wind, LineChart, ArrowUpRight, ArrowDownRight, ArrowRight, CheckCircle, Tag, IndianRupee, MessageSquare, Zap, Leaf } from 'lucide-react';
import { useWeather, useMarket, useSchemes } from '../hooks/useDashboardQueries';
import { WeatherSkeleton, MarketSkeleton, FarmSummarySkeleton, ProfileCompletionSkeleton } from '../skeletons/Skeletons';
import { ErrorBoundary } from './ErrorBoundary';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export const WelcomeHeader = ({ user }) => (
  <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="mb-8">
    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
      </div>
      <h1 className="font-display text-3xl font-bold text-heading">Welcome back, {user?.first_name || 'Farmer'}!</h1>
    </motion.div>
    <motion.p variants={fadeUp} className="text-slate-500">
      {user?.user_type === 'farmer' ? "Here is your farm overview and recent activities." : "Overview of your marketplace activities"}
    </motion.p>
  </motion.div>
);

export const FarmSummaryCard = ({ profile, isLoading }) => {
  if (isLoading) return <FarmSummarySkeleton />;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-bold text-heading flex items-center gap-2">
          <Trees className="w-5 h-5 text-primary" /> My Farm Summary
        </h2>
        <Link to="/profile" className="text-sm font-semibold text-primary hover:underline">Edit Profile</Link>
      </div>
      {profile ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Location</p>
            <p className="font-semibold text-heading">{[profile.district, profile.state].filter(Boolean).join(', ') || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><Trees className="w-3.5 h-3.5"/> Farm Size</p>
            <p className="font-semibold text-heading">{profile.farm_size ? `${profile.farm_size} Acres` : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><Sprout className="w-3.5 h-3.5"/> Primary Crop</p>
            <p className="font-semibold text-heading">{profile.primary_crop || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><Activity className="w-3.5 h-3.5"/> Soil Type</p>
            <p className="font-semibold text-heading">{profile.soil_type || 'Not specified'}</p>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Please update your farm profile to see details here.</p>
      )}
    </motion.div>
  );
};

export const ProfileCompletionCard = ({ completionPercentage, isLoading }) => {
  if (isLoading) return <ProfileCompletionSkeleton />;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${completionPercentage || 0}%` }}></div>
      </div>
      <ShieldCheck className="w-12 h-12 text-primary/80 mb-3" />
      <h3 className="font-display text-lg font-bold text-heading mb-1">Profile Completion</h3>
      <p className="text-3xl font-black text-primary mb-2">{completionPercentage || 0}%</p>
      {(completionPercentage || 0) < 100 && (
        <Link to="/profile" className="btn-secondary w-full text-center text-sm py-2">Complete Profile</Link>
      )}
    </motion.div>
  );
};

export const WeatherCard = ({ profile }) => {
  const { data: weather, isLoading, error } = useWeather(profile);
  if (isLoading) return <WeatherSkeleton />;
  if (error) throw error; // Caught by ErrorBoundary

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-100 dark:border-blue-800">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-display font-bold text-heading flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-blue-500" /> Weather Advisory
        </h3>
        {weather?.locationName && <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{weather.locationName}</span>}
      </div>
      {weather ? (
        <>
          <div className="flex items-center gap-6 mb-4">
            <div>
              <p className="text-5xl font-display font-bold text-heading">{weather.temperature}°C</p>
              <p className="text-sm font-semibold text-blue-600 mt-1">{weather.condition}</p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-slate-500">Rain</p>
                <p className="font-semibold text-sm">{weather.rainProbability}%</p>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                <Activity className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-slate-500">Humidity</p>
                <p className="font-semibold text-sm">{weather.humidity}%</p>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                <Wind className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-slate-500">Wind</p>
                <p className="font-semibold text-sm">{weather.windSpeed}km/h</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <p className="text-sm text-blue-800 dark:text-blue-300"><span className="font-bold">Farmer Advisory:</span> {weather.advisory}</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">Weather data unavailable</p>
      )}
    </motion.div>
  );
};

export const MarketCard = ({ profile }) => {
  const { data: marketPrice, isLoading, error } = useMarket(profile);
  
  if (isLoading) return <MarketSkeleton />;
  if (error) throw error;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border border-purple-100 dark:border-purple-800">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-display font-bold text-heading flex items-center gap-2">
          <LineChart className="w-5 h-5 text-purple-500" /> Market Snapshot
        </h3>
        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{profile?.primary_crop || 'Crop'}</span>
      </div>
      {marketPrice && typeof marketPrice === 'object' ? (
        <>
          <div className="flex items-center gap-6 mb-4">
            <div>
              <p className="text-5xl font-display font-bold text-heading">₹{marketPrice.currentPrice}</p>
              <div className="flex items-center gap-1 mt-1">
                {marketPrice.trend > 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : marketPrice.trend < 0 ? <ArrowDownRight className="w-4 h-4 text-red-500" /> : <ArrowRight className="w-4 h-4 text-slate-500" />}
                <p className={`text-sm font-semibold ${marketPrice.trend > 0 ? 'text-green-600' : marketPrice.trend < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {Math.abs(marketPrice.trend)}% trend
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg flex justify-between items-center">
                <p className="text-xs text-slate-500">Previous Price</p>
                <p className="font-semibold text-sm">₹{marketPrice.previousPrice}</p>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg flex justify-between items-center">
                <p className="text-xs text-slate-500">Best Market Price</p>
                <p className="font-semibold text-sm text-purple-600">₹{marketPrice.bestPrice}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
            <p className="text-sm text-purple-800 dark:text-purple-300"><span className="font-bold">Best Market Location:</span> {marketPrice.bestMarket}</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">No market data available</p>
      )}
    </motion.div>
  );
};

export const SchemesCard = ({ profile }) => {
  const { data: schemes, isLoading, error } = useSchemes(profile);
  if (error) throw error;
  
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 flex items-center justify-between border-green-200 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-500 mb-1">Eligible Schemes</p>
          <p className="text-3xl font-display font-bold text-heading text-green-600">
            {isLoading ? '-' : (schemes?.data?.length || 0)}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 relative z-10">
          <CheckCircle className="w-6 h-6" />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 flex items-center justify-between border-amber-200 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-500 mb-1">Potential Benefits</p>
          <p className="text-3xl font-display font-bold text-heading text-amber-600">
            ₹{isLoading ? '-' : (schemes?.totalBenefit?.toLocaleString('en-IN') || 0)}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 relative z-10">
          <Tag className="w-6 h-6" />
        </div>
      </motion.div>
    </>
  );
};

export const StatCard = ({ title, value, icon: Icon, color, delay }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
    green: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800'
  };

  return (
    <motion.div variants={fadeUp} custom={delay} className="glass-card p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-heading">{value}</p>
      </div>
    </motion.div>
  );
};

export const ActionCard = ({ to, icon: Icon, label, color, bg }) => {
  return (
    <Link to={to} className="group glass-card p-4 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-semibold text-heading">{label}</p>
    </Link>
  );
};

export const QuickActions = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
    className="mb-8"
  >
    <h2 className="font-display text-lg font-bold text-heading mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <ActionCard to="/crop-health" icon={Activity} label="Crop Health" color="text-red-500" bg="bg-red-500/10" />
      <ActionCard to="/crop-recommendation" icon={Sprout} label="Crop Rec." color="text-green-500" bg="bg-green-500/10" />
      <ActionCard to="/khedut-ai" icon={Zap} label="Khedut AI" color="text-amber-500" bg="bg-amber-500/10" />
      <ActionCard to="/market-prices" icon={LineChart} label="Market Intel" color="text-purple-500" bg="bg-purple-500/10" />
      <ActionCard to="/smart-irrigation" icon={CloudRain} label="Irrigation" color="text-blue-500" bg="bg-blue-500/10" />
    </div>
  </motion.div>
);
