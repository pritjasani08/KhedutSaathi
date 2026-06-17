import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sprout, TrendingUp, Users, Droplets, ShoppingCart,
  Bot, ArrowRight, Sparkles
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Sprout,
      title: t('featureShowcase.cropDiagnosis.title'),
      desc: t('featureShowcase.cropDiagnosis.description'),
      path: '/crop-diagnosis',
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      hoverBg: 'hover:bg-green-50',
      emoji: '🌱',
    },
    {
      icon: TrendingUp,
      title: t('featureShowcase.marketHub.title'),
      desc: t('featureShowcase.marketHub.description'),
      path: '/market-hub',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-50',
      emoji: '📈',
    },
    {
      icon: Users,
      title: t('expertPanel.smartCropPlanner'),
      desc: 'Get AI-powered crop planning recommendations based on your soil, location, and water availability.',
      path: '/expert-panel',
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      hoverBg: 'hover:bg-violet-50',
      emoji: '🧑‍🌾',
    },
    {
      icon: TrendingUp,
      title: t('expertPanel.yieldPredictor'),
      desc: 'Predict expected yield, revenue, and risk using advanced AI models trained on agricultural data.',
      path: '/expert-panel',
      gradient: 'from-indigo-500 to-blue-500',
      bg: 'bg-indigo-50',
      hoverBg: 'hover:bg-indigo-50',
      emoji: '📊',
    },
    {
      icon: Droplets,
      title: t('featureShowcase.smartIrrigation.title'),
      desc: t('featureShowcase.smartIrrigation.description'),
      path: '/smart-irrigation',
      gradient: 'from-sky-500 to-blue-500',
      bg: 'bg-sky-50',
      hoverBg: 'hover:bg-sky-50',
      emoji: '💧',
    },
    {
      icon: ShoppingCart,
      title: t('featureShowcase.agriMarketplace.title'),
      desc: t('featureShowcase.agriMarketplace.description'),
      path: '/agri-marketplace',
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      hoverBg: 'hover:bg-amber-50',
      emoji: '🛒',
    },
    {
      icon: Bot,
      title: t('featureShowcase.chatbot.title'),
      desc: t('featureShowcase.chatbot.description'),
      path: '#',
      gradient: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      hoverBg: 'hover:bg-rose-50',
      emoji: '🤖',
    },
  ];

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/60 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> All Features
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {t('features.title')}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t('features.subtitle')}
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Link
                to={feature.path}
                className={`block glass-card p-8 card-hover group h-full border border-transparent hover:border-primary/10 ${feature.hoverBg} transition-all duration-500`}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {feature.emoji}
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {feature.desc}
                </p>

                <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-3 transition-all duration-300">
                  Explore Feature
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
