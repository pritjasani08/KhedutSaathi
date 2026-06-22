import { motion } from 'framer-motion';
import { AlertCircle, TrendingDown, CloudRain } from 'lucide-react';

export default function FarmerProblemsSection() {
  const problems = [
    {
      icon: <AlertCircle className="w-8 h-8 text-rose-500" />,
      title: "Disease Losses",
      desc: "Up to 30% of crops are lost to unidentified diseases before harvest. Late diagnosis means permanent damage and financial ruin."
    },
    {
      icon: <TrendingDown className="w-8 h-8 text-amber-500" />,
      title: "Market Uncertainty",
      desc: "Farmers routinely sell below true market value due to a lack of real-time price intelligence and reliance on middlemen."
    },
    {
      icon: <CloudRain className="w-8 h-8 text-sky-500" />,
      title: "Unpredictable Yields",
      desc: "Struggling to estimate harvest sizes makes it impossible to plan finances, secure loans, or negotiate futures contracts accurately."
    }
  ];

  return (
    <section className="py-24 bg-surface relative">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-heading leading-tight tracking-tight"
          >
            Farming is harder than it needs to be.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Every season brings new risks. Without the right data, one bad decision can wipe out months of hard work.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col space-y-16">
            {problems.map((problem, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${i % 2 !== 0 ? 'md:flex-row-reverse text-right' : 'text-left'}`}
              >
                <div className="w-24 h-24 rounded-3xl bg-background border border-subtle flex items-center justify-center shrink-0 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300">
                  {problem.icon}
                </div>
                <div className={`flex-1 ${i % 2 !== 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <h3 className="font-display text-3xl font-bold text-heading mb-4">{problem.title}</h3>
                  <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">{problem.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
