import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function PageHero({ title, subtitle, icon: Icon, colorClass = "from-primary to-primary-light", bgClass = "bg-primary-50 dark:bg-primary-900/30", textClass = "text-primary" }) {
  return (
    <div className="relative py-16 md:py-24 bg-white dark:bg-slate-900 overflow-hidden border-b border-slate-100 dark:border-slate-800">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${colorClass} opacity-5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3`} />
      </div>

      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl"
        >
          {Icon && (
            <div className={`w-16 h-16 rounded-2xl ${bgClass} flex items-center justify-center mb-6`}>
              <Icon className={`w-8 h-8 ${textClass}`} />
            </div>
          )}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
