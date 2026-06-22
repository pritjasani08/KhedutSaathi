import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import AIEcosystemVisualization from './AIEcosystemVisualization';

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
            
            <AIEcosystemVisualization />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
