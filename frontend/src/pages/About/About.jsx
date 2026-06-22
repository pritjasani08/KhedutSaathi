import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bot, TrendingUp, ScanLine, Sprout, Newspaper, Landmark,
  ArrowRight, Heart, Lightbulb, BarChart3, Leaf
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ═══════════════ SECTION 1 — HERO ═══════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center gradient-bg overflow-hidden pt-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="container-custom relative px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-primary" />
          </motion.div>

          <motion.h1
            variants={fadeUp} custom={1}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-heading leading-[1.1] mb-6 text-balance"
          >
            About <span className="gradient-text">KhedutSaathi</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} custom={2}
            className="text-slate-600 dark:text-slate-300 text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Empowering farmers through AI-driven insights, real-time intelligence, and modern agricultural technology.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/features" className="btn-primary text-base flex items-center justify-center gap-2 px-8 py-3.5">
              Explore Features <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/khedut-ai" className="btn-secondary text-base flex items-center justify-center gap-2 px-8 py-3.5">
              Ask Khedut AI <Bot className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════ SECTION 2 — OUR STORY ═══════════════ */
function OurStorySection() {
  const challenges = [
    { emoji: '📉', text: 'Farmers struggle to access accurate, timely agricultural information' },
    { emoji: '🧩', text: 'Agricultural services remain fragmented across multiple platforms' },
    { emoji: '🚧', text: 'Technology barriers prevent farmers from leveraging modern tools' },
  ];

  return (
    <section className="py-20 bg-surface border-t border-subtle">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 rounded-2xl p-8 sm:p-10 border border-primary-200/50 dark:border-primary-800/30">
              <div className="absolute -top-3 -right-3 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
              <div className="space-y-5">
                {challenges.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.2, duration: 0.5 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="text-2xl shrink-0">{c.emoji}</span>
                    <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">{c.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Story */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-heading mb-6 leading-tight">
              Our <span className="gradient-text">Story</span>
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Indian agriculture feeds over a billion people, yet farmers often make critical decisions—what to grow, when to sell, how to treat diseases—without reliable data or expert guidance.
              </p>
              <p>
                <strong className="text-heading">KhedutSaathi was born from a simple idea:</strong> every farmer, regardless of their location or resources, deserves access to the same quality of agricultural intelligence that large agri-businesses use.
              </p>
              <p>
                We built a unified digital companion that brings together AI-powered crop guidance, real-time market prices, disease detection, and a farmer marketplace—all in one accessible platform, available in multiple Indian languages.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ SECTION 3 — MISSION & VISION ═══════════════ */
function MissionVisionSection() {
  const cards = [
    {
      title: 'Our Mission',
      emoji: '🎯',
      content: 'To help every farmer make smarter, data-driven decisions by providing accessible AI-powered tools, real-time market intelligence, and actionable agricultural insights—bridging the gap between traditional farming and modern technology.',
      accent: 'border-l-primary',
    },
    {
      title: 'Our Vision',
      emoji: '🌱',
      content: 'To build the most trusted and comprehensive digital agriculture ecosystem in India—where every farmer has the intelligence to maximize yield, minimize costs, and access fair markets, creating a sustainable and prosperous farming future.',
      accent: 'border-l-secondary',
    },
  ];

  return (
    <section className="py-20 bg-background border-t border-subtle">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-heading"
          >
            What Drives Us
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`p-8 rounded-2xl bg-surface border border-subtle border-l-4 ${card.accent} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
            >
              <span className="text-3xl mb-4 block">{card.emoji}</span>
              <h3 className="font-display text-2xl font-bold text-heading mb-4">{card.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{card.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ SECTION 4 — CORE VALUES ═══════════════ */
function CoreValuesSection() {
  const values = [
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: 'Farmer First',
      desc: 'Every feature we build starts with one question: how does this help a farmer make a better decision?',
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-amber-500" />,
      title: 'Innovation Driven',
      desc: 'We leverage AI, machine learning, and real-time data to solve real agricultural challenges.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      title: 'Data Powered Decisions',
      desc: 'From mandi prices to weather patterns, we transform raw data into actionable farmer insights.',
    },
    {
      icon: <Leaf className="w-6 h-6 text-emerald-500" />,
      title: 'Sustainable Agriculture',
      desc: 'Promoting practices that improve yields today while preserving resources for tomorrow.',
    },
  ];

  return (
    <section className="py-20 bg-surface border-t border-subtle">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-heading leading-tight mb-4"
          >
            Core Values
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-lg text-muted"
          >
            The principles that guide every decision we make at KhedutSaathi.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
              className="p-8 rounded-2xl bg-background border border-subtle shadow-sm hover:border-primary/20 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-surface border border-subtle flex items-center justify-center mb-6 shadow-sm">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">{val.title}</h3>
              <p className="text-muted leading-relaxed text-sm">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ SECTION 5 — WHY KHEDUTSAATHI ═══════════════ */
function WhyKhedutSaathiSection() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'AI Powered Assistance',
      desc: 'Ask farming questions in your language and get instant, expert-level answers.',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/40',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Live Mandi Prices',
      desc: 'Track real-time market prices across mandis to sell at the best time.',
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/40',
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: <ScanLine className="w-6 h-6" />,
      title: 'Crop Health Detection',
      desc: 'Upload crop photos and get instant AI-powered disease identification.',
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-900/40',
      color: 'text-rose-600 dark:text-rose-400',
    },
    {
      icon: <Sprout className="w-6 h-6" />,
      title: 'Crop Planning',
      desc: 'Data-driven recommendations based on soil, season, and water availability.',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/40',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      title: 'Agriculture News',
      desc: 'Stay updated with the latest agricultural news, trends, and best practices.',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/40',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: <Landmark className="w-6 h-6" />,
      title: 'Government Schemes',
      desc: 'Discover and apply for beneficial government schemes designed for farmers.',
      bg: 'bg-cyan-50 dark:bg-cyan-900/30',
      hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/40',
      color: 'text-cyan-600 dark:text-cyan-400',
    },
  ];

  return (
    <section className="py-20 pb-24 bg-background border-t border-subtle">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-heading"
          >
            Why KhedutSaathi
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            A complete digital farming companion with everything a modern farmer needs.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.1, duration: 0.5 }}
              className={`glass-card p-8 border border-transparent shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/20 dark:hover:border-primary/40 transition-all duration-300 ${f.hoverBg}`}
            >
              <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-5 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-heading mb-3">{f.title}</h3>
              <p className="text-body text-sm leading-relaxed opacity-80">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════ MAIN ABOUT PAGE ═══════════════ */
export default function About() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <OurStorySection />
      <MissionVisionSection />
      <CoreValuesSection />
      <WhyKhedutSaathiSection />
    </div>
  );
}
