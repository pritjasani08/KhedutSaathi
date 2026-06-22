import { motion } from 'framer-motion';
import { LineChart, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function YieldPredictionShowcase() {
  return (
    <section className="py-24 bg-background relative overflow-hidden transition-colors duration-300 border-t border-subtle">
      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Content - Interactive Chart Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:h-full flex items-center justify-center order-last lg:order-first"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-blue-200/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-[3rem] transform -rotate-3 scale-105 blur-xl hidden lg:block" />
            
            <div className="w-full max-w-lg mx-auto bg-surface border border-subtle rounded-3xl p-6 shadow-2xl relative z-10">
               <div className="flex justify-between items-center mb-6 border-b border-subtle pb-4">
                 <div>
                   <h3 className="font-bold text-heading text-lg">Estimated Wheat Yield</h3>
                   <p className="text-sm text-slate-500 mt-1">Rajkot District • 5 Hectares</p>
                 </div>
                 <div className="text-right">
                   <p className="text-3xl font-black text-blue-600 dark:text-blue-400">12.4t</p>
                   <p className="text-sm text-green-500 font-semibold flex items-center justify-end gap-1 mt-1"><TrendingUp className="w-3 h-3" /> +8% vs Avg</p>
                 </div>
               </div>

               {/* Simulated Chart */}
               <div className="h-48 flex items-end justify-between gap-3 mt-8 relative">
                 {[40, 55, 45, 60, 75, 65, 85, 100].map((h, i) => (
                   <div key={i} className="w-full h-full flex items-end justify-center group relative">
                     <motion.div 
                       initial={{ height: 0 }}
                       whileInView={{ height: `${h}%` }}
                       viewport={{ once: true }}
                       transition={{ duration: 1, delay: i * 0.1 }}
                       className={`w-full rounded-t-md transition-all duration-300 ${i === 7 ? 'bg-blue-500 hover:bg-blue-400' : 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50'}`}
                     />
                     {i === 7 && (
                        <div className="absolute -top-10 bg-slate-800 dark:bg-slate-700 text-white text-xs px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap z-20">
                          Harvest (Nov)
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-700 rotate-45" />
                        </div>
                     )}
                   </div>
                 ))}
               </div>
               <div className="flex justify-between text-xs font-medium text-slate-500 mt-4 border-t border-subtle pt-4 px-1">
                 <span>Apr</span>
                 <span>May</span>
                 <span>Jun</span>
                 <span>Jul</span>
                 <span>Aug</span>
                 <span>Sep</span>
                 <span>Oct</span>
                 <span>Nov</span>
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
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-4">
                <LineChart className="w-4 h-4" /> Predictive Analytics
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-6 leading-tight">
                Know your harvest months before you plant.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                By analyzing decades of historical data, soil conditions, and hyper-local weather forecasts, our ML models predict your exact yield output with unprecedented accuracy.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-subtle">
              {[
                { icon: ShieldCheck, title: 'Risk Mitigation', desc: 'Secure crop insurance and loans with data.' },
                { icon: TrendingUp, title: 'Forward Contracts', desc: 'Pre-sell your harvest with confidence.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-heading mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="pt-4">
              <Link to="/features" className="inline-flex items-center gap-2 btn-primary bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 px-8 py-4 text-white shadow-blue-500/30">
                <LineChart className="w-5 h-5" />
                Explore Analytics
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ml-2" />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
