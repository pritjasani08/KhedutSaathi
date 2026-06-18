import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight, ShieldCheck, Activity, Pill } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function CropHealthSection() {
  
  return (
    <section className="py-20 bg-surface relative overflow-hidden transition-colors duration-300">
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
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-heading mb-6">
                Protect Your Yield with Instant AI Diagnosis
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Don't let crop diseases ruin your harvest. Simply snap a picture of a sick plant, and our advanced AI will instantly identify the disease and provide actionable treatment recommendations.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, title: '98% Accuracy', desc: 'Trained on millions of plant images.' },
                { icon: Pill, title: 'Expert Remedies', desc: 'Get organic and chemical solutions.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-heading mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/crop-health" className="inline-flex items-center gap-2 btn-primary">
                <Upload className="w-5 h-5" />
                Check Crop Health
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-[2.5rem] transform rotate-3" />
            <div className="relative bg-surface border border-subtle rounded-[2.5rem] p-8 shadow-glass transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              {/* Mock App UI */}
              <div className="bg-background rounded-2xl overflow-hidden border border-subtle">
                <div className="h-48 bg-green-100 dark:bg-green-900/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 border-4 border-dashed border-green-500/30 dark:border-green-400/20 rounded-xl m-4" />
                  <span className="text-6xl animate-pulse">🌿</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
                      <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
