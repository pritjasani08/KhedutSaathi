import { motion } from 'framer-motion';
import { Sprout, ScanLine, LineChart, TrendingUp, Store } from 'lucide-react';

export default function WhyFarmersNeedUsSection() {
  const capabilities = [
    {
      title: "Crop Recommendation",
      description: "Plan the right crop based on season, soil, and water availability.",
      icon: <Sprout className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "Disease Detection",
      description: "Identify crop diseases early and receive treatment guidance.",
      icon: <ScanLine className="w-6 h-6 text-rose-500" />
    },
    {
      title: "Yield Prediction",
      description: "Estimate expected harvest output before harvest season.",
      icon: <LineChart className="w-6 h-6 text-amber-500" />
    },
    {
      title: "Market Intelligence",
      description: "Monitor crop prices and market trends.",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Farmer Marketplace",
      description: "Connect buyers and sellers through a dedicated agricultural marketplace.",
      icon: <Store className="w-6 h-6 text-indigo-500" />
    }
  ];

  return (
    <section className="py-24 bg-surface relative overflow-hidden border-t border-subtle">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading leading-tight mb-4"
          >
            From Planning To Profit
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted"
          >
            Everything farmers need to make better decisions throughout the farming lifecycle.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
              className="p-8 rounded-2xl bg-background border border-subtle hover:border-primary/20 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-surface border border-subtle flex items-center justify-center mb-6 shadow-sm">
                {cap.icon}
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">{cap.title}</h3>
              <p className="text-muted leading-relaxed">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
