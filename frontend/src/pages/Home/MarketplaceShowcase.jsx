import { motion } from 'framer-motion';
import { Store, ShoppingCart, ArrowRight, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const products = [
  { id: 1, name: 'Premium Organic Wheat', seller: 'Ramesh Bhai', location: 'Rajkot, Gujarat', price: '₹2,600/qtl', tag: 'Verified Seller' },
  { id: 2, name: 'Hybrid Cotton Seed', seller: 'AgriTech Seeds', location: 'Surat, Gujarat', price: '₹8,500/qtl', tag: 'Best Seller' },
];

export default function MarketplaceShowcase() {
  return (
    <section className="py-24 bg-background relative overflow-hidden transition-colors duration-300">
      <div className="container-custom relative px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            <div>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/60 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-sm font-semibold mb-4">
                <Store className="w-4 h-4" /> B2B Marketplace
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-6 leading-tight">
                Buy and sell with zero intermediaries.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Connect directly with verified buyers, bulk purchasers, and trusted seed suppliers. Keep 100% of the profits and manage your entire sales cycle in one place.
              </motion.p>
            </div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-subtle">
              {[
                { icon: ShieldCheck, title: 'Verified Users', desc: 'Every buyer and seller is KYC verified.' },
                { icon: Truck, title: 'Logistics Support', desc: 'Integrated transport tracking.' },
                { icon: CreditCard, title: 'Secure Payments', desc: 'Escrow protection for every trade.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-800">
                    <feature.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-heading mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link to="/agri-marketplace" className="inline-flex items-center justify-center gap-2 btn-primary bg-violet-600 hover:bg-violet-700 border-violet-600 hover:border-violet-700 px-8 py-4 text-white shadow-violet-500/30">
                <ShoppingCart className="w-5 h-5" />
                Browse Marketplace
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual Content - Marketplace Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:h-full flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-violet-100/50 to-violet-200/50 dark:from-violet-900/20 dark:to-violet-800/20 rounded-[3rem] transform rotate-2 scale-105 blur-xl hidden lg:block" />
            
            <div className="w-full max-w-lg mx-auto bg-surface border border-subtle rounded-3xl p-6 shadow-2xl relative z-10 flex flex-col gap-4">
               
               {/* Search/Filter Bar Mockup */}
               <div className="flex gap-2">
                 <div className="flex-1 bg-background border border-subtle rounded-xl px-4 py-2.5 flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                   <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                 </div>
                 <div className="w-12 h-11 bg-background border border-subtle rounded-xl flex items-center justify-center">
                   <div className="w-4 h-4 border-t-2 border-l-2 border-slate-400" />
                 </div>
               </div>

               {/* Product Cards Mockup */}
               {products.map((product, i) => (
                 <div key={i} className="bg-background border border-subtle rounded-2xl p-4 flex gap-4 group hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                   <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                     <span className="text-3xl">{i === 0 ? '🌾' : '🌱'}</span>
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <h4 className="font-bold text-heading text-sm">{product.name}</h4>
                       <span className="text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full">
                         {product.tag}
                       </span>
                     </div>
                     <p className="text-xs text-slate-500 mt-1">{product.seller} • {product.location}</p>
                     
                     <div className="flex justify-between items-end mt-3">
                       <p className="font-black text-lg text-heading">{product.price}</p>
                       <button className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold px-4 py-2 rounded-lg group-hover:bg-violet-600 dark:group-hover:bg-violet-500 transition-colors">
                         Buy Now
                       </button>
                     </div>
                   </div>
                 </div>
               ))}

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
