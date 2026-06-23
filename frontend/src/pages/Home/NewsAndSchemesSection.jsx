import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, Landmark, Calendar, ChevronRight } from 'lucide-react';

const MOCK_NEWS = [
  {
    id: 1,
    title: 'Monsoon Advances Over Central India: IMD Forecast',
    date: '15 June 2026',
    category: 'Weather',
    source: 'IMD Official',
  },
  {
    id: 2,
    title: 'New MSP Announced for Kharif Crops',
    date: '12 June 2026',
    category: 'Market',
    source: 'Govt. of India',
  },
  {
    id: 3,
    title: 'Export Ban Lifted on Non-Basmati White Rice',
    date: '10 June 2026',
    category: 'Policy',
    source: 'Ministry of Commerce',
  }
];

const MOCK_SCHEMES = [
  {
    id: 1,
    title: 'PM-KISAN Samman Nidhi',
    deadline: 'Ongoing',
    category: 'Income Support',
    benefit: '₹6,000 / year'
  },
  {
    id: 2,
    title: 'PM KUSUM Scheme',
    deadline: '30 Sept 2026',
    category: 'Solar Energy',
    benefit: '60% Subsidy'
  },
  {
    id: 3,
    title: 'Pradhan Mantri Fasal Bima Yojana',
    deadline: '31 July 2026',
    category: 'Insurance',
    benefit: 'Crop Coverage'
  }
];

export default function NewsAndSchemesSection() {
  return (
    <section className="py-24 bg-surface-muted relative overflow-hidden transition-colors duration-300 border-t border-subtle">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-6 leading-tight"
          >
            Stay Ahead with Vital Updates
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Get the latest agricultural news, policy changes, and financial schemes delivered straight to you without the noise.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Latest News Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-background border border-subtle rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-subtle">
              <h3 className="font-display text-2xl font-bold text-heading flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-primary" />
                Latest News
              </h3>
              <Link to="/resources" state={{ activeTab: 'news' }} className="text-sm font-semibold text-primary hover:underline">View All</Link>
            </div>
            <div className="flex flex-col divide-y divide-subtle">
              {MOCK_NEWS.map((news, idx) => (
                <Link key={news.id} to={`/resources/news/${news.id}`} className="py-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-4 rounded-xl transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {news.category}
                        </span>
                        <span className="text-xs flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" /> {news.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-heading group-hover:text-primary transition-colors">{news.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{news.source}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Government Schemes Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-background border border-subtle rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-subtle">
              <h3 className="font-display text-2xl font-bold text-heading flex items-center gap-2">
                <Landmark className="w-6 h-6 text-primary" />
                Active Schemes
              </h3>
              <Link to="/resources" state={{ activeTab: 'schemes' }} className="text-sm font-semibold text-primary hover:underline">View All</Link>
            </div>
            <div className="flex flex-col divide-y divide-subtle">
              {MOCK_SCHEMES.map((scheme, idx) => (
                <Link key={scheme.id} to={`/resources/schemes/${scheme.id}`} className="py-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-4 px-4 rounded-xl transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                          {scheme.benefit}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Deadline: {scheme.deadline}
                        </span>
                      </div>
                      <h4 className="font-bold text-heading group-hover:text-primary transition-colors">{scheme.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{scheme.category}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
