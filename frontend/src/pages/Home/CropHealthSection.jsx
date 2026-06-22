import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight, ShieldCheck, Activity, Pill, Camera, CheckCircle2, AlertTriangle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

function InteractiveScanner() {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, result

  const handleScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('result');
    }, 2000);
  };

  const reset = () => setScanState('idle');

  return (
    <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-2xl relative overflow-hidden h-[420px] flex flex-col z-10">
      <div className="flex items-center justify-between border-b border-subtle pb-4 mb-4">
        <h3 className="font-semibold text-heading flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          AI Plant Scanner
        </h3>
        {scanState === 'result' && (
          <button onClick={reset} className="text-sm text-primary hover:underline font-medium">Scan Another</button>
        )}
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {scanState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full h-full flex flex-col items-center justify-center text-center"
            >
              <div 
                onClick={handleScan}
                className="w-full h-full border-2 border-dashed border-green-500/30 dark:border-green-400/20 rounded-2xl bg-green-50/50 dark:bg-green-900/10 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Click to upload a leaf photo</p>
                <p className="text-xs text-slate-500 mt-2">Supports JPG, PNG (Max 5MB)</p>
              </div>
            </motion.div>
          )}

          {scanState === 'scanning' && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center h-full"
            >
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-subtle bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                 <span className="text-7xl blur-[2px] opacity-60">🌿</span>
                 {/* Scanner line */}
                 <motion.div 
                   animate={{ top: ['0%', '100%', '0%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                   className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)] z-10"
                 />
              </div>
              <p className="mt-8 font-semibold text-green-600 dark:text-green-400 animate-pulse tracking-wide">Analyzing tissue patterns...</p>
            </motion.div>
          )}

          {scanState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full flex flex-col"
            >
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-700 dark:text-red-400">Leaf Rust Detected</h4>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1 font-medium">AI Confidence: 96%</p>
                </div>
              </div>

              <div className="bg-background border border-subtle rounded-xl p-5 flex-1 shadow-sm">
                <h5 className="text-sm font-bold text-heading flex items-center gap-2 mb-4 uppercase tracking-wider">
                  <Pill className="w-4 h-4 text-primary" /> Recommended Treatment
                </h5>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    Apply Mancozeb 75% WP @ 2g/liter of water immediately.
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    Ensure proper field drainage and reduce canopy humidity.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CropHealthSection() {
  
  return (
    <section className="py-24 bg-surface relative overflow-hidden transition-colors duration-300 border-t border-subtle">
      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <div>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/60 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-semibold mb-4">
                <Activity className="w-4 h-4" /> AI Diagnostics
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-6 leading-tight">
                Stop diseases before they destroy your yield.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Visual symptoms often appear too late. Simply snap a picture of a sick plant, and our advanced AI will instantly identify the disease and provide actionable, chemical, or organic treatment recommendations.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-subtle">
              {[
                { icon: ShieldCheck, title: '98% Accuracy', desc: 'Trained on over 5 million plant images.' },
                { icon: Pill, title: 'Expert Remedies', desc: 'Get organic and chemical solutions instantly.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 border border-green-100 dark:border-green-800">
                    <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-heading mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="pt-4">
              <Link to="/crop-health" className="inline-flex items-center gap-2 btn-primary px-8 py-4">
                <Upload className="w-5 h-5" />
                Open Full Scanner
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ml-2" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual Content - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:h-full flex items-center justify-center"
          >
            {/* Decorative background blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-green-200/50 dark:from-green-900/20 dark:to-green-800/20 rounded-[3rem] transform rotate-3 scale-105 blur-xl hidden lg:block" />
            
            <div className="w-full max-w-lg mx-auto">
              <InteractiveScanner />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
