import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, Landmark } from 'lucide-react';
import NewsCard from '../../components/shared/NewsCard';
import SchemeCard from '../../components/shared/SchemeCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const MOCK_NEWS = [
  {
    id: 1,
    title: 'Monsoon Advances Over Central India: IMD Forecast',
    date: '15 June 2026',
    category: 'Weather',
    excerpt: 'Favorable conditions for further advance of southwest monsoon into more parts of Gujarat, Madhya Pradesh and Chhattisgarh.',
  },
  {
    id: 2,
    title: 'New MSP Announced for Kharif Crops',
    date: '12 June 2026',
    category: 'Market',
    excerpt: 'The Cabinet Committee has approved the increase in the Minimum Support Prices for all mandated Kharif Crops.',
  }
];

const MOCK_SCHEMES = [
  {
    id: 1,
    title: 'PM-KISAN Samman Nidhi',
    deadline: 'Ongoing',
    category: 'Income Support',
    description: 'Financial benefit of Rs. 6000/- per year in three equal installments to all eligible farmer families.',
    eligibility: ['Small & Marginal Farmers', 'Valid Aadhaar'],
    benefit: '₹6,000 / year'
  },
  {
    id: 2,
    title: 'PM KUSUM Scheme',
    deadline: '30 Sept 2026',
    category: 'Solar Energy',
    description: 'Installation of solar pumps and grid connected solar power plants by farmers.',
    eligibility: ['Individual farmers', 'Cooperatives'],
    benefit: '60% Subsidy'
  }
];

export default function NewsAndSchemesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden transition-colors duration-300">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Latest News & Government Schemes
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Stay informed about market trends, weather alerts, and financial assistance available for your farming business.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Latest News Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-primary" />
                Latest News
              </h3>
            </div>
            <div className="grid gap-6">
              {MOCK_NEWS.map((news, idx) => (
                <div key={news.id} className="h-full">
                  <NewsCard {...news} index={idx} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Government Schemes Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Landmark className="w-6 h-6 text-primary" />
                Government Schemes
              </h3>
            </div>
            <div className="grid gap-6">
              {MOCK_SCHEMES.map((scheme, idx) => (
                <div key={scheme.id} className="h-full">
                  <SchemeCard {...scheme} index={idx} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* View All Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link to="/resources" className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-all duration-300 font-semibold text-lg hover:shadow-md hover:-translate-y-1">
            View All News & Schemes
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
