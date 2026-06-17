import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

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

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function StatCard({ icon: Icon, value, suffix, label, index = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="glass-card p-6 md:p-8 text-center card-hover"
    >
      <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <div className="font-display text-3xl md:text-4xl font-extrabold gradient-text mb-2">
        <AnimatedCounter end={value} suffix={suffix} />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
    </motion.div>
  );
}
