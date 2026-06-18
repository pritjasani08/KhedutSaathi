import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Upload, Bot, CheckCircle2 } from 'lucide-react';

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
    <section className="relative min-h-screen flex items-center gradient-bg overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/60 dark:bg-primary-900/40 text-primary dark:text-primary-light text-sm font-semibold mb-6">
                <Sprout className="w-4 h-4" />
                AI-Powered Agriculture Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-heading leading-[1.1] mb-6 text-balance"
            >
              {t('hero.title').split(' ').map((word, i) => (
                <span key={i}>
                  {['AI', 'Powered', 'Every'].includes(word) ? (
                    <span className="gradient-text">{word} </span>
                  ) : (
                    word + ' '
                  )}
                </span>
              ))}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-600 dark:text-slate-300 text-lg lg:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/crop-health" className="btn-primary text-base flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Upload a Crop Image
              </Link>
              <button className="btn-secondary text-base flex items-center justify-center gap-2">
                <Bot className="w-5 h-5" />
                Ask AI Assistant
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} custom={4} className="mt-10 grid grid-cols-2 gap-4 justify-center lg:justify-start max-w-lg mx-auto lg:mx-0">
              {[
                'AI Disease Detection',
                'Government Scheme Assistance',
                'Real-Time Market Prices',
                'Expert Guidance'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Central circle */}
              <div className="absolute inset-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-full animate-pulse-slow" />
              <div className="absolute inset-16 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-800/50 dark:to-primary-700/50 rounded-full" />
              <div className="absolute inset-20 bg-surface rounded-full shadow-card flex items-center justify-center">
                <span className="text-8xl">🌾</span>
              </div>

              {/* Floating cards */}
              {[
                { icon: '🌱', label: 'Disease Detection', pos: 'top-4 left-4', delay: 0 },
                { icon: '📈', label: 'Market Prices', pos: 'top-8 right-0', delay: 0.5 },
                { icon: '💧', label: 'Smart Irrigation', pos: 'bottom-8 left-0', delay: 1 },
                { icon: '🤖', label: 'AI Assistant', pos: 'bottom-4 right-4', delay: 1.5 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute ${item.pos} glass-card px-4 py-3 flex items-center gap-3 shadow-card`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
