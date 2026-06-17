import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../../components/shared/SectionHeader';
import NewsCard from '../../components/shared/NewsCard';

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function NewsSection() {
  const news = [
    {
      title: "New Subsidy Announced for Drip Irrigation Systems",
      date: "Oct 15, 2026",
      category: "Government",
      excerpt: "The agriculture ministry has announced a new 80% subsidy for small and marginal farmers installing drip irrigation systems.",
      image: "https://images.unsplash.com/photo-1592982537447-6f296d63428e?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Wheat Prices Expected to Rise Next Quarter",
      date: "Oct 12, 2026",
      category: "Market Trend",
      excerpt: "Market analysts predict a 15% increase in wheat prices due to lower than expected yields in northern regions.",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "AI in Farming: How Technology is Changing Agriculture",
      date: "Oct 10, 2026",
      category: "Technology",
      excerpt: "From drones to AI-powered disease detection, technology is making farming more efficient and profitable than ever before.",
      image: "https://images.unsplash.com/photo-1628045618451-b84742a1f108?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <section className="section-padding bg-slate-50 dark:bg-slate-900/50">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <SectionHeader 
            title="Latest Agriculture News" 
            subtitle="Stay updated with market trends, government policies, and farming technology."
            center={false}
          />
          <Link to="/news" className="btn-secondary text-sm flex items-center justify-center gap-2 whitespace-nowrap mb-12 md:mb-16">
            View All News
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {news.map((item, i) => (
            <NewsCard key={i} {...item} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
