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
                {t('cropDiagnosis.title') || 'Crop Diagnosis'}
              </Link>
              <Link to="/khedut-ai" className="btn-secondary text-base flex items-center justify-center gap-2">
                <Bot className="w-5 h-5" />
                {t('chatbot.title') || 'Khedut AI'}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} custom={4} className="mt-10 grid grid-cols-2 gap-4 justify-center lg:justify-start max-w-lg mx-auto lg:mx-0">
              {[
                t('cropDiagnosis.title') || 'AI Disease Detection',
                t('nav.resources') || 'Government Schemes',
                t('marketHub.livePrices') || 'Real-Time Market Prices',
                t('expertPanel.title') || 'Expert Guidance'
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
            className="relative order-first lg:order-last mb-12 lg:mb-0 mt-8 lg:mt-0"
          >
            <div className="relative w-full aspect-square max-w-[400px] md:max-w-[500px] lg:max-w-[700px] mx-auto flex items-center justify-center">

              {/* Central Logo & Subtle Glow */}
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl animate-pulse-slow scale-125" />

                <img
                  src="/logo.png"
                  alt="KhedutSaathi Logo"
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl scale-100 md:scale-110 lg:scale-[1.3]"
                />
              </div>

              {/* Floating cards */}
              {[
{ 
  icon: '🌱', 
  label: t('cropDiagnosis.title') || 'Disease Detection', 
  pos: 'top-[-20px] left-[-10px] md:top-[-10px] md:left-[-20px]', 
  delay: 0 
},
{ 
  icon: '📈', 
  label: t('marketHub.title') || 'Market Prices', 
  pos: 'top-8 right-[-20px] md:top-12 md:right-[-30px]', 
  delay: 0.5 
},
{ 
  icon: '💧', 
  label: t('smartIrrigation.title') || 'Smart Irrigation', 
  pos: 'bottom-24 left-[-20px] md:bottom-36 md:left-[-30px]', 
  delay: 1 
},
{ 
  icon: '🤖', 
  label: t('chatbot.title') || 'Khedut AI', 
  pos: 'bottom-8 right-[-10px] md:bottom-16 md:right-[-20px]', 
  delay: 1.5 
},
              ].map((item, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute ${item.pos} glass-card px-3 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3 shadow-card z-20 whitespace-nowrap scale-90 md:scale-100`}
                >
                  <span className="text-xl md:text-2xl">{item.icon}</span>
                  <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
