import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';

export default function FinalCTASection() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
      <div className="container-custom relative px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to upgrade your farming business?
          </h2>
          <p className="text-xl text-green-50 mb-10 leading-relaxed max-w-2xl mx-auto opacity-90">
            Join thousands of successful farmers using KhedutSaathi to predict yields, prevent diseases, and sell at higher prices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-primary hover:bg-slate-50 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/features" className="w-full sm:w-auto px-8 py-4 bg-primary-dark/30 hover:bg-primary-dark/50 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 text-lg backdrop-blur-sm">
              Explore Features
            </Link>
          </div>
          <p className="mt-8 text-sm text-green-100 opacity-80">
            100% Free for individual farmers. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
