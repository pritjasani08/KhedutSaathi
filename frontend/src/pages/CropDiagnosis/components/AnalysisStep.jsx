import React from 'react';
import { motion } from 'framer-motion';
import { Scan, BrainCircuit, Activity } from 'lucide-react';

export default function AnalysisStep({ imagePreviewUrl }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-8"
    >
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl mb-10 border-4 border-slate-100 dark:border-slate-800">
        
        {/* Background Image being analyzed */}
        {imagePreviewUrl && (
          <img 
            src={imagePreviewUrl} 
            alt="Analyzing" 
            className="w-full h-full object-cover opacity-60 dark:opacity-40"
          />
        )}

        {/* Scanning Line Animation */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_4px_rgba(34,197,94,0.6)] z-20"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Scanning Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 z-10" />

        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-surface/80 backdrop-blur-sm p-4 rounded-full shadow-glass animate-pulse">
            <Scan className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
        <h3 className="text-xl font-bold text-heading animate-pulse">
          Analyzing Crop Health...
        </h3>
        
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <BrainCircuit className="w-4 h-4 text-blue-500" />
            </motion.div>
            <span>Running Deep Learning Models</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Activity className="w-4 h-4 text-rose-500" />
            </motion.div>
            <span>Extracting Visual Features</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
