import { motion } from 'framer-motion';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AIAssistantSection() {
  
  return (
    <section className="py-24 bg-surface relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[800px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/60 dark:bg-primary-900/40 text-primary dark:text-primary-light text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" /> 24/7 Expert Support
            </motion.div>
            
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-extrabold text-heading leading-tight">
              Have farming questions? <br />
              <span className="gradient-text">Ask Your AI Agronomist</span>
            </motion.h2>
            
            <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Get instant, personalized advice on crop care, pest management, and farming best practices anytime, anywhere, in your local language.
            </motion.p>

            <motion.div variants={fadeUp} className="pt-6">
              {/* This button could trigger the ChatbotWidget open state, but for now we'll just style it beautifully */}
              <button className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 group">
                <Bot className="w-6 h-6 animate-bounce-slow" />
                Chat with AI Assistant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-slate-100 dark:border-slate-800">
              {[
                { title: 'Multilingual Support', desc: 'Chat in English, Hindi, or Gujarati.' },
                { title: 'Instant Answers', desc: 'No waiting time. Immediate resolutions.' },
                { title: 'Personalized Advice', desc: 'Context-aware agricultural guidance.' }
              ].map((feature, i) => (
                <div key={i} className="pt-6">
                  <h4 className="font-semibold text-heading mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
