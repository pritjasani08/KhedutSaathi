import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, LineChart, IndianRupee } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function MarketPricesSection() {
  
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
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/60 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm font-semibold mb-4">
                <TrendingUp className="w-4 h-4" /> Market Intelligence
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-heading mb-6">
                Never Undersell Your Hard Work Again
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Access real-time Mandi prices from across the country. Compare rates, analyze historical trends, and connect directly with buyers to eliminate middlemen and maximize your profits.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: IndianRupee, title: 'Live Mandi Rates', desc: 'Updated daily from 1000+ markets.' },
                { icon: LineChart, title: 'Price Forecasting', desc: 'Know when to hold or sell.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-heading mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/market-prices" className="inline-flex items-center gap-2 btn-primary bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600 shadow-amber-500/30">
                <IndianRupee className="w-5 h-5" />
                Check Market Prices
                <ArrowRight className="w-5 h-5" />
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
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-[2.5rem] transform rotate-3" />
            <div className="relative bg-surface border border-subtle rounded-[2.5rem] p-8 shadow-glass transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              
              <div className="space-y-4">
                {[
                  { crop: 'Wheat (Lokwan)', price: '₹2,450', trend: '+125', up: true },
                  { crop: 'Cotton (Hybrid)', price: '₹7,120', trend: '-50', up: false },
                  { crop: 'Soyabean (Yellow)', price: '₹4,890', trend: '+210', up: true },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex justify-between items-center p-4 bg-background border border-subtle rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-lg">
                        {item.crop.includes('Wheat') ? '🌾' : item.crop.includes('Cotton') ? '☁️' : '🌱'}
                      </div>
                      <div>
                        <p className="font-semibold text-body">{item.crop}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Rajkot Mandi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-heading">{item.price}</p>
                      <p className={`text-xs font-semibold ${item.up ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1`}>
                        <TrendingUp className={`w-3 h-3 ${!item.up && 'rotate-180'}`} />
                        {item.trend}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
