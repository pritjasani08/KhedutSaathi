import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, LineChart, IndianRupee, TrendingDown, Minus } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const marketData = [
  { crop: 'Wheat (Lokwan)', market: 'Rajkot Mandi', price: '₹2,450', change: '+₹125', trend: 'up', volume: 'High' },
  { crop: 'Cotton (Hybrid)', market: 'Gondal APMC', price: '₹7,120', change: '-₹50', trend: 'down', volume: 'Medium' },
  { crop: 'Soyabean (Yellow)', market: 'Indore Mandi', price: '₹4,890', change: '+₹210', trend: 'up', volume: 'High' },
  { crop: 'Groundnut (Bold)', market: 'Jamnagar', price: '₹6,200', change: '₹0', trend: 'neutral', volume: 'Low' },
  { crop: 'Onion (Red)', market: 'Nashik', price: '₹1,850', change: '+₹300', trend: 'up', volume: 'Very High' },
];

export default function MarketPricesSection() {
  
  return (
    <section className="py-24 bg-surface relative overflow-hidden transition-colors duration-300 border-t border-subtle">
      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/60 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm font-semibold mb-6"
          >
            <TrendingUp className="w-4 h-4" /> Market Intelligence
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-6 leading-tight"
          >
            Real-time APMC Prices
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed"
          >
            Don't rely on middlemen for market information. Get live, accurate pricing data from over 1,000 mandis across India to negotiate better rates.
          </motion.p>
        </div>

        {/* Data Table Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto bg-background border border-subtle rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-subtle text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Crop</th>
                  <th className="px-6 py-4 font-semibold">Market</th>
                  <th className="px-6 py-4 font-semibold text-right">Price (per Qtl)</th>
                  <th className="px-6 py-4 font-semibold text-right">24h Change</th>
                  <th className="px-6 py-4 font-semibold text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {marketData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-heading">{row.crop}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 dark:text-slate-300">{row.market}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-heading text-lg">{row.price}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${
                        row.trend === 'up' ? 'text-green-500' : 
                        row.trend === 'down' ? 'text-red-500' : 'text-slate-500'
                      }`}>
                        {row.change}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        row.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                        row.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {row.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                         row.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                         <Minus className="w-4 h-4" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-surface-muted p-4 border-t border-subtle flex justify-center">
            <Link to="/market-prices" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors">
              View All Market Prices
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
