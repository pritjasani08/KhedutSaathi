import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function PageHero({ title, subtitle, children }) {
  return (
    <div className="w-full text-center mb-8 md:mb-12">
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.h1 
          variants={fadeUp} 
          custom={1} 
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4 mx-auto tracking-tight"
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            variants={fadeUp} 
            custom={2} 
            className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
      
      {children && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full flex justify-center mt-6 md:mt-8"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
