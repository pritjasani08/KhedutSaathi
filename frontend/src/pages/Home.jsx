import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sprout, TrendingUp, Users, Droplets,
  ShoppingCart, Bot, Upload, Cpu, Lightbulb, CheckCircle2,
  Heart, Coins, ShieldCheck, Globe, Leaf, BarChart3
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/* ───── Animated Counter ───── */
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ───── Animation Variants ───── */
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

export default function Home() {
  const { t } = useTranslation();

  const features = [
    { icon: Sprout, title: t('featureShowcase.cropDiagnosis.title'), desc: t('featureShowcase.cropDiagnosis.description'), path: '/crop-diagnosis', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    { icon: TrendingUp, title: t('featureShowcase.marketHub.title'), desc: t('featureShowcase.marketHub.description'), path: '/market-hub', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { icon: Users, title: t('featureShowcase.expertPanel.title'), desc: t('featureShowcase.expertPanel.description'), path: '/expert-panel', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
    { icon: Droplets, title: t('featureShowcase.smartIrrigation.title'), desc: t('featureShowcase.smartIrrigation.description'), path: '/smart-irrigation', color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50' },
    { icon: ShoppingCart, title: t('featureShowcase.agriMarketplace.title'), desc: t('featureShowcase.agriMarketplace.description'), path: '/agri-marketplace', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    { icon: Bot, title: t('featureShowcase.chatbot.title'), desc: t('featureShowcase.chatbot.description'), path: '#', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50' },
  ];

  const steps = [
    { icon: Upload, title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.description'), num: '01' },
    { icon: Cpu, title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.description'), num: '02' },
    { icon: Lightbulb, title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.description'), num: '03' },
    { icon: CheckCircle2, title: t('howItWorks.step4.title'), desc: t('howItWorks.step4.description'), num: '04' },
  ];

  const benefits = [
    { icon: Heart, title: t('benefits.betterCropHealth.title'), desc: t('benefits.betterCropHealth.description'), color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: BarChart3, title: t('benefits.higherYield.title'), desc: t('benefits.higherYield.description'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Droplets, title: t('benefits.waterSaving.title'), desc: t('benefits.waterSaving.description'), color: 'text-sky-500', bg: 'bg-sky-50' },
    { icon: Coins, title: t('benefits.betterMarketPrice.title'), desc: t('benefits.betterMarketPrice.description'), color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: ShieldCheck, title: t('benefits.reducedMiddlemen.title'), desc: t('benefits.reducedMiddlemen.description'), color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: Globe, title: t('benefits.aiGuidance.title'), desc: t('benefits.aiGuidance.description'), color: 'text-primary', bg: 'bg-primary-50' },
  ];

  const stats = [
    { value: 50000, suffix: '+', label: t('stats.farmersHelped'), icon: Users },
    { value: 120, suffix: '+', label: t('stats.diseasesSupported'), icon: Leaf },
    { value: 5000, suffix: '+', label: t('stats.marketListings'), icon: ShoppingCart },
    { value: 3, suffix: '', label: t('stats.supportedLanguages'), icon: Globe },
  ];

  return (
    <div className="overflow-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center gradient-bg">
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
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/60 text-primary text-sm font-semibold mb-6">
                  <Sprout className="w-4 h-4" />
                  AI-Powered Agriculture Platform
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 text-balance"
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
                className="text-slate-600 text-lg lg:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/features" className="btn-primary text-base flex items-center justify-center gap-2">
                  {t('hero.getStarted')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/features" className="btn-secondary text-base flex items-center justify-center gap-2">
                  {t('hero.exploreFeatures')}
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">50,000+</span> farmers trust us
                </div>
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
                <div className="absolute inset-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full animate-pulse-slow" />
                <div className="absolute inset-16 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full" />
                <div className="absolute inset-20 bg-white rounded-full shadow-card flex items-center justify-center">
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
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="section-padding bg-white relative">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="container-custom relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="glass-card p-6 md:p-8 text-center card-hover"
              >
                <div className="w-14 h-14 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-extrabold gradient-text mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURE SHOWCASE ═══════════ */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {t('featureShowcase.title')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('featureShowcase.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <Link
                  to={feature.path}
                  className="block glass-card p-7 card-hover group h-full"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon className={`w-7 h-7 bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'inherit' }} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">
                    {feature.desc}
                  </p>
                  <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-3 transition-all duration-300">
                    {t('featureShowcase.learnMore')}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="section-padding bg-white">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {t('howItWorks.title')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
          >
            {/* Connector line */}
            <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
                {/* Step number circle */}
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl rotate-45 flex items-center justify-center mx-auto shadow-green">
                    <step.icon className="w-7 h-7 text-white -rotate-45" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {step.num}
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              {t('benefits.title')}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('benefits.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="glass-card p-7 card-hover group"
              >
                <div className={`w-14 h-14 rounded-2xl ${benefit.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                  <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
