import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import AIEcosystemVisualization from './AIEcosystemVisualization';

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



export default function HeroSection() {
  const { t } = useTranslation();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Accessibility: check for reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Performance: detect mobile for fallback poster
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center bg-transparent overflow-hidden pt-20">
      {/* Video Layer (full screen) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {(!prefersReducedMotion && !isMobile) ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onEnded={(e) => {
              e.target.currentTime = 0;
              e.target.play();
            }}
            poster="/videos/hero-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.45] dark:opacity-[0.35]"
          >
            <source src="/videos/hero-optimized.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/videos/hero-poster.jpg"
            alt="Atmospheric Farm Background"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.45] dark:opacity-[0.35]"
          />
        )}
      </div>

      {/* Subtle Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(0,0,0,0.18)]" />
      </div>

      <div className="container-custom relative px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left relative z-20"
          >
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-heading leading-[1.1] mb-6 text-balance"
            >
              Farming <span className="gradient-text">Reimagined</span> with Artificial Intelligence
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-slate-600 dark:text-slate-300 text-lg lg:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Plan crops, detect diseases, predict yields, track mandi prices, and make smarter farming decisions with AI-powered tools.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register" className="btn-primary text-base flex items-center justify-center gap-2 px-8 py-3.5">
                Start Farming Smarter
              </Link>
              <Link to="/features" className="btn-secondary text-base flex items-center justify-center gap-2 px-8 py-3.5">
                Explore Features
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} custom={4} className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center lg:justify-start">
              {[
                'Yield Prediction',
                'Disease Detection',
                'Market Prices',
                'Expert Support'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{feature}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Product Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative lg:h-full flex items-center justify-center w-full"
          >
            <div className="relative z-10 w-full">
              <AIEcosystemVisualization />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
