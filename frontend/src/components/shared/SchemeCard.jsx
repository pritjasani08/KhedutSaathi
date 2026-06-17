import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function SchemeCard({ title, description, eligibility, deadline, applyLink, index = 0 }) {
  return (
    <motion.div variants={fadeUp} custom={index} className="glass-card p-6 card-hover group flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        {deadline && (
          <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Ends: {deadline}
          </span>
        )}
      </div>
      
      <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
        {title}
      </h3>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-1">
        {description}
      </p>
      
      <div className="mb-6 space-y-2">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Eligibility</p>
        <ul className="space-y-1">
          {eligibility.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <a 
        href={applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full btn-secondary py-2 text-sm flex items-center justify-center gap-2 mt-auto"
      >
        Apply Now
        <ArrowRight className="w-4 h-4" />
      </a>
    </motion.div>
  );
}
