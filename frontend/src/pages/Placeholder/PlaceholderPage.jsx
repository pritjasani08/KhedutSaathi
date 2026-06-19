import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16 flex items-center justify-center">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-12 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary dark:text-primary-light"
          >
            <Clock className="w-10 h-10" />
          </motion.div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            {title}
          </h1>
          <p className="text-body text-lg mb-8 max-w-xl mx-auto">
            We are working hard to bring you this feature. It will be available soon!
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
