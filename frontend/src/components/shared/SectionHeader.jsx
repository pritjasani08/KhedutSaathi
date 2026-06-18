import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function SectionHeader({ title, subtitle, center = true }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className={`mb-12 md:mb-16 ${center ? 'text-center' : 'text-left'}`}
    >
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-slate-500 dark:text-slate-400 text-lg ${center ? 'max-w-2xl mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
