import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, BrainCircuit, Droplets, Leaf } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function CropPlanningSection() {
  
  return (
    <section className="py-20 bg-surface-muted relative overflow-hidden transition-colors duration-300">
      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center flex-col-reverse lg:flex-row">
          
          {/* Visual Content (Left on Desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-last lg:order-first"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-[2.5rem] transform -rotate-3" />
            <div className="relative bg-surface border border-subtle rounded-[2.5rem] p-8 shadow-glass transform rotate-3 transition-transform hover:rotate-0 duration-500">
              
              <div className="space-y-4">
                {/* Mock Chart / Planner UI */}
                <div className="flex items-end gap-2 h-32 mb-6 border-b border-subtle pb-2">
                  {[40, 70, 45, 90, 60, 85].map((height, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="flex-1 bg-indigo-200 dark:bg-indigo-900/40 rounded-t-lg relative group"
                    >
                      <div className="absolute inset-0 bg-indigo-500 dark:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                    </motion.div>
                  ))}
                </div>
                
                <div className="bg-background p-4 rounded-xl flex items-center justify-between border border-subtle">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-8 h-8 text-blue-500 p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg" />
                    <div>
                      <p className="text-sm font-semibold text-body">Smart Irrigation</p>
                      <p className="text-xs text-slate-500">Optimize water usage</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-500">+15% Yield</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <div>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-sm font-semibold mb-4">
                <Target className="w-4 h-4" /> AI Precision Planning
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-heading mb-6">
                Maximize Yields with Smart Crop Planning
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Take the guesswork out of farming. Our AI analyzes your soil data, local weather patterns, and historical trends to recommend the best crops, optimal sowing times, and precise irrigation schedules.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: BrainCircuit, title: 'Yield Prediction', desc: 'Forecast harvest volume accurately.' },
                { icon: Leaf, title: 'Crop Rotation', desc: 'Maintain soil health automatically.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-heading mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/crop-planning" className="inline-flex items-center gap-2 btn-primary bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 shadow-indigo-500/30">
                <Target className="w-5 h-5" />
                Start Crop Planner
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
