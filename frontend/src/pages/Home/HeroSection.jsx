import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Upload, Bot, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function YieldPredictionDemo() {
  const [district, setDistrict] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = (e) => {
    e.preventDefault();
    if (!district || !crop || !area) return;
    setIsPredicting(true);
    // Simulate API call
    setTimeout(() => {
      setIsPredicting(false);
      setResult({
        yield: (parseFloat(area) * 2.4).toFixed(1) + ' Tons',
        value: '₹' + (parseFloat(area) * 2.4 * 24500).toLocaleString('en-IN')
      });
    }, 1500);
  };

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-2xl w-full max-w-md mx-auto relative z-10">
      <div className="absolute -top-4 -right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce-slow">
        <Bot className="w-3.5 h-3.5" /> AI Powered
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold text-heading flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Predict Your Yield
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Estimate your upcoming harvest and market value instantly.</p>
      </div>
      
      <form onSubmit={handlePredict} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">District</label>
          <select 
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-background border border-subtle rounded-xl px-4 py-2.5 text-body focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          >
            <option value="">Select District</option>
            <option value="Rajkot">Rajkot</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Surat">Surat</option>
            <option value="Junagadh">Junagadh</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Crop</label>
            <select 
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-background border border-subtle rounded-xl px-4 py-2.5 text-body focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            >
              <option value="">Select</option>
              <option value="Wheat">Wheat</option>
              <option value="Cotton">Cotton</option>
              <option value="Groundnut">Groundnut</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Area (Ha)</label>
            <input 
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. 5"
              className="w-full bg-background border border-subtle rounded-xl px-4 py-2.5 text-body focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPredicting || !district || !crop || !area}
          className="w-full btn-primary py-3 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPredicting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Generate Prediction'
          )}
        </button>
      </form>

      {/* Result Area */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1 uppercase tracking-wider">Est. Yield</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{result.yield}</p>
            </div>
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1 uppercase tracking-wider">Market Value</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">{result.value}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center gradient-bg overflow-hidden pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-heading leading-[1.1] mb-6 text-balance"
            >
              Farming <span className="gradient-text">Reimagined</span> with Artificial Intelligence
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-600 dark:text-slate-300 text-lg lg:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Join thousands of successful farmers using KhedutSaathi to predict yields, diagnose crop diseases, and get the best market prices.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register" className="btn-primary text-base flex items-center justify-center gap-2 px-8 py-3.5">
                Start Farming Smarter
              </Link>
              <Link to="/features" className="btn-secondary text-base flex items-center justify-center gap-2 px-8 py-3.5">
                Explore Features
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} custom={4} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center lg:justify-start">
              {[
                'Yield Prediction',
                'Disease Detection',
                'Market Prices',
                'Expert Support'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{feature}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Product Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative lg:h-full flex items-center justify-center"
          >
            {/* Decorative blob behind the demo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] rotate-3 scale-105 blur-lg hidden lg:block" />
            
            <YieldPredictionDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
