import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Features() {
  const featureCategories = [
    {
      title: 'Crop Management',
      features: [
        {
          title: 'Crop Health',
          desc: 'Get comprehensive crop health analysis and instantly identify issues before they spread.',
          path: '/crop-health',
          bg: 'bg-green-50 dark:bg-green-900/30',
          hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/40',
          emoji: '🌿',
        },

        {
          title: 'Crop Recommendation',
          desc: 'Get AI-powered recommendations based on your soil, location, and water availability.',
          path: '/crop-recommendation',
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/40',
          emoji: '📋',
        },

        {
          title: 'Smart Irrigation',
          desc: 'Monitor irrigation requirements and optimize water usage using AI-powered recommendations.',
          path: '/smart-irrigation',
          bg: 'bg-cyan-50 dark:bg-cyan-900/30',
          hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/40',
          emoji: '💧',
        },
      ]
    },
    {
      title: 'Market & Commerce',
      features: [

        {
          title: 'Market Intelligence',
          desc: 'Advanced insights and demand forecasting to help you sell at the best time.',
          path: '/market-prices',
          bg: 'bg-orange-50 dark:bg-orange-900/30',
          hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/40',
          emoji: '🧠',
        },
        {
          title: 'Agri Marketplace',
          desc: 'Buy and sell agricultural products, tools, fertilizers, seeds, and farming equipment.',
          path: '/agri-marketplace',
          bg: 'bg-yellow-50 dark:bg-yellow-900/30',
          hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/40',
          emoji: '🛒',
        },
      ]
    },
    {
      title: 'AI & Support',
      features: [
        {
          title: 'Khedut AI',
          desc: 'Your personal 24/7 farming assistant ready to answer your agricultural questions.',
          path: '/khedut-ai',
          bg: 'bg-purple-50 dark:bg-purple-900/30',
          hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/40',
          emoji: '🤖',
        },
      ]
    },
    {
      title: 'Resources',
      features: [
        {
          title: 'News & Schemes',
          desc: 'Stay updated with the latest agricultural news and beneficial government initiatives.',
          path: '/resources',
          bg: 'bg-rose-50 dark:bg-rose-900/30',
          hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-900/40',
          emoji: '📰',
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <PageHero
          title="Platform Capabilities"
          subtitle="Discover all the powerful tools and modules available in KhedutSaathi designed to empower your agricultural journey."
        />
        <div className="mt-12">

        {/* Feature Categories */}
        <div className="space-y-16">
          {featureCategories.map((category) => (
            <motion.section
              key={category.title}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.h2 
                variants={fadeUp} 
                className="font-display text-2xl font-bold text-heading mb-6 pb-2 border-b border-subtle"
              >
                {category.title}
              </motion.h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.features.map((feature, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i}>
                    <Link
                      to={feature.path}
                      className={`block glass-card p-8 card-hover group h-full border border-transparent hover:border-primary/20 dark:hover:border-primary/40 transition-all duration-500 ${feature.hoverBg}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0`}>
                          {feature.emoji}
                        </div>
                        {feature.isComingSoon && (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 shrink-0">
                            Coming Soon
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-xl font-bold text-heading mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-body text-sm leading-relaxed mb-6 opacity-80">
                        {feature.desc}
                      </p>

                      <span className="text-primary dark:text-primary-light font-semibold text-sm flex items-center gap-1 group-hover:gap-3 transition-all duration-300">
                        Open {feature.title}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
