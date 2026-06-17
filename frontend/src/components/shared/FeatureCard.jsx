import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function FeatureCard({ icon: Icon, title, desc, path, color, bg, learnMoreText, index = 0 }) {
  return (
    <motion.div variants={fadeUp} custom={index}>
      <Link
        to={path}
        className="block glass-card p-7 card-hover group h-full"
      >
        <div className={`w-14 h-14 rounded-2xl ${bg} dark:bg-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
          {typeof color === 'string' && color.startsWith('from-') ? (
            <Icon className={`w-7 h-7 bg-gradient-to-r ${color} bg-clip-text`} style={{ color: 'inherit' }} />
          ) : (
            <Icon className={`w-7 h-7 ${color}`} />
          )}
        </div>
        <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
          {desc}
        </p>
        {learnMoreText && (
          <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-3 transition-all duration-300">
            {learnMoreText}
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Link>
    </motion.div>
  );
}
