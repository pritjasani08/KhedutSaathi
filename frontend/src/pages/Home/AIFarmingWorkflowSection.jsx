import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sprout, ScanLine, LineChart, TrendingUp, Store, Bot } from 'lucide-react';

export default function AIFarmingWorkflowSection() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const beamHeight = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const steps = [
    {
      icon: <Sprout className="w-6 h-6" />,
      title: "Crop Recommendation",
      desc: "Get the most suitable crop suggestions based on soil, season, and water availability.",
      color: "bg-emerald-500 text-white"
    },
    {
      icon: <ScanLine className="w-6 h-6" />,
      title: "Disease Detection",
      desc: "Upload crop images and receive AI-assisted disease identification with treatment guidance.",
      color: "bg-green-500 text-white"
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Yield Prediction",
      desc: "Estimate expected harvest output before harvest season using agricultural data.",
      color: "bg-emerald-400 text-white"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Live Mandi Prices",
      desc: "Track real-time crop prices and market trends to make informed selling decisions.",
      color: "bg-green-400 text-white"
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: "Agri Marketplace",
      desc: "Buy and sell agricultural products through a dedicated farming marketplace.",
      color: "bg-emerald-500 text-white"
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Khedut AI",
      desc: "Ask farming questions and receive AI-powered agricultural guidance and recommendations.",
      color: "bg-green-500 text-white"
    }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden border-t border-subtle">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading"
          >
            The Complete AI Farming Workflow
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            From planting the first seed to selling your final harvest, KhedutSaathi guides every decision.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto relative" ref={containerRef}>
          {/* Static Background Line */}
          <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 rounded-full" />
          
          {/* Animated Tracing Beam */}
          <motion.div 
            style={{ height: beamHeight }}
            className="absolute left-10 md:left-1/2 top-0 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#4ADE80] via-[#22C55E] to-[#10B981] shadow-[0_0_15px_rgba(34,197,94,0.6)]"
          >
            {/* Glowing dot at the end of the beam */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,1)]" />
          </motion.div>
          
          <div className="space-y-16">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-20% 0px -30% 0px" }}
                variants={{
                  hidden: { opacity: 0.4, y: 20, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Connecting Node */}
                <motion.div 
                  variants={{
                    hidden: { borderColor: "var(--color-border-subtle, #e2e8f0)", backgroundColor: "var(--color-bg-background, #f8fafc)" },
                    visible: { borderColor: "#10B981", backgroundColor: "white", transition: { delay: 0.2 } }
                  }}
                  className="absolute left-10 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-5 h-5 rounded-full border-4 z-10 dark:bg-slate-900"
                />
                
                {/* Content */}
                <div className={`flex-1 pl-24 md:pl-0 w-full ${i % 2 !== 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                  <motion.div 
                    variants={{
                      hidden: { scale: 0.8, opacity: 0.5 },
                      visible: { scale: 1, opacity: 1, transition: { delay: 0.1 } }
                    }}
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 shadow-lg ${step.color} ${i % 2 !== 0 ? 'md:ml-auto' : 'md:mr-auto'}`}
                  >
                    {step.icon}
                  </motion.div>
                  <motion.h3 
                    variants={{
                      hidden: { opacity: 0.7 },
                      visible: { opacity: 1, transition: { delay: 0.1 } }
                    }}
                    className="text-2xl font-bold mb-3 text-heading transition-colors duration-500"
                  >
                    {step.title}
                  </motion.h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                {/* Empty half for desktop alignment */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
