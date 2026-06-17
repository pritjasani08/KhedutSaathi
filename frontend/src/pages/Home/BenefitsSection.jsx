import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, BarChart3, Droplets, Coins, ShieldCheck, Globe } from 'lucide-react';
import SectionHeader from '../../components/shared/SectionHeader';

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

export default function BenefitsSection() {
  const { t } = useTranslation();

  const benefits = [
    { icon: Heart, title: t('benefits.betterCropHealth.title'), desc: t('benefits.betterCropHealth.description'), color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: BarChart3, title: t('benefits.higherYield.title'), desc: t('benefits.higherYield.description'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Droplets, title: t('benefits.waterSaving.title'), desc: t('benefits.waterSaving.description'), color: 'text-sky-500', bg: 'bg-sky-50' },
    { icon: Coins, title: t('benefits.betterMarketPrice.title'), desc: t('benefits.betterMarketPrice.description'), color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: ShieldCheck, title: t('benefits.reducedMiddlemen.title'), desc: t('benefits.reducedMiddlemen.description'), color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: Globe, title: t('benefits.aiGuidance.title'), desc: t('benefits.aiGuidance.description'), color: 'text-primary', bg: 'bg-primary-50' },
  ];

  return (
    <section className="section-padding bg-slate-50 dark:bg-slate-900/50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          title={t('benefits.title')} 
          subtitle={t('benefits.subtitle')} 
        />

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
              <div className={`w-14 h-14 rounded-2xl ${benefit.bg} dark:bg-slate-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                {benefit.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
