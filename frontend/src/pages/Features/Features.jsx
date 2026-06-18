import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sprout, TrendingUp, Users, FileText,
  Activity, ArrowRight, Sparkles
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Features() {
  const features = [
    {
      icon: Activity,
      title: 'Crop Health',
      desc: 'Disease Detection & Crop Health Analysis. Upload an image of your crop to get instant AI diagnosis and treatment recommendations.',
      path: '/crop-health',
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50 dark:bg-green-900/30',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/40',
      emoji: '🌱',
    },
    {
      icon: Sprout,
      title: 'Crop Planning',
      desc: 'Smart Crop Planner, Yield Predictor & Smart Irrigation. Get AI-powered recommendations based on your soil, location, and water availability.',
      path: '/crop-planning',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/40',
      emoji: '📊',
    },
    {
      icon: TrendingUp,
      title: 'Market Prices',
      desc: 'Market Intelligence & Price Tracking. Access live Mandi prices across different states and districts, and analyze market trends.',
      path: '/market-prices',
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/40',
      emoji: '📈',
    },
    {
      icon: Users,
      title: 'Expert Help',
      desc: 'Expert Consultation & Agricultural Guidance. Connect with agricultural experts for personalized advice and advanced crop planning.',
      path: '/expert-help',
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50 dark:bg-violet-900/30',
      hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-900/40',
      emoji: '🧑‍🌾',
    },
    {
      icon: FileText,
      title: 'News & Schemes',
      desc: 'Agriculture News & Government Schemes. Stay updated with the latest agricultural news and beneficial government initiatives.',
      path: '/resources',
      gradient: 'from-indigo-500 to-blue-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/40',
      emoji: '📰',
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
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/60 dark:bg-primary-900/40 text-primary dark:text-primary-light text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> All Features
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            Platform Capabilities
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-body text-lg max-w-2xl mx-auto opacity-90">
            Discover all the powerful tools and modules available in KhedutSaathi designed to empower your agricultural journey.
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
                className={`block glass-card p-8 card-hover group h-full border border-transparent hover:border-primary/20 dark:hover:border-primary/40 transition-all duration-500 ${feature.hoverBg}`}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {feature.emoji}
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-heading mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-body text-sm leading-relaxed mb-6 opacity-80">
                  {feature.desc}
                </p>

                <span className="text-primary dark:text-primary-light font-semibold text-sm flex items-center gap-1 group-hover:gap-3 transition-all duration-300">
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

