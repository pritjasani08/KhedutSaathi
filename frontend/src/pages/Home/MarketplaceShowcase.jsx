import { motion } from 'framer-motion';
import { Store, ShoppingCart, ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function MarketplaceShowcase() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden transition-colors duration-300">
      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center text-center max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/60 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-sm font-semibold mb-8">
            <Store className="w-4 h-4" /> B2B Marketplace
          </motion.div>
          
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-heading mb-6 leading-tight max-w-4xl mx-auto">
            Buy and sell with zero intermediaries.
          </motion.h2>
          
          <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-16 max-w-2xl mx-auto">
            Connect directly with verified buyers, bulk purchasers, and trusted seed suppliers. Keep 100% of the profits and manage your entire sales cycle in one place.
          </motion.p>

          <motion.div variants={fadeUp} className="w-full h-px bg-subtle mb-16 max-w-3xl mx-auto" />

          <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-8 md:gap-12 w-full mb-16 max-w-4xl mx-auto">
            {[
              { icon: ShieldCheck, title: 'Verified Users', desc: 'Every buyer and seller is KYC verified.' },
              { icon: Truck, title: 'Logistics Support', desc: 'Integrated transport tracking.' },
              { icon: CreditCard, title: 'Secure Payments', desc: 'Escrow protection for every trade.' }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center border border-violet-100 dark:border-violet-800 shrink-0">
                  <feature.icon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h4 className="font-bold text-heading mb-2 text-lg">{feature.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex justify-center">
            <Link to="/agri-marketplace" className="inline-flex items-center justify-center gap-2 btn-primary bg-violet-600 hover:bg-violet-700 border-violet-600 hover:border-violet-700 px-8 py-4 text-white shadow-violet-500/30 rounded-xl text-lg font-bold group transition-all">
              <ShoppingCart className="w-5 h-5" />
              Browse Marketplace
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
