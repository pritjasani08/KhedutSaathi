import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../../components/shared/SectionHeader';
import SchemeCard from '../../components/shared/SchemeCard';

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function SchemesSection() {
  const schemes = [
    {
      title: "PM Kisan Samman Nidhi",
      description: "Income support of ₹6,000 per year in three equal installments to all land holding farmer families.",
      eligibility: [
        "Must hold cultivable land",
        "Valid Aadhaar Card",
        "Active Bank Account linked with Aadhaar"
      ],
      deadline: "Dec 31, 2026",
      applyLink: "#"
    },
    {
      title: "Pradhan Mantri Fasal Bima Yojana",
      description: "Provides insurance cover and financial support to farmers in the event of crop failure due to natural calamities.",
      eligibility: [
        "Growing notified crops in notified areas",
        "Tenant farmers are eligible",
        "Copy of land records required"
      ],
      deadline: "Nov 15, 2026",
      applyLink: "#"
    },
    {
      title: "Kisan Credit Card (KCC)",
      description: "Timely and adequate credit support from the banking system to farmers for their cultivation and other needs.",
      eligibility: [
        "All farmers including small/marginal",
        "Tenant farmers & oral lessees",
        "SHGs or Joint Liability Groups"
      ],
      applyLink: "#"
    }
  ];

  return (
    <section className="section-padding bg-surface">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <SectionHeader 
            title="Government Schemes" 
            subtitle="Discover and apply for agricultural schemes and subsidies to maximize your benefits."
            center={false}
          />
          <Link to="/resources" className="btn-secondary text-sm flex items-center justify-center gap-2 whitespace-nowrap mb-12 md:mb-16">
            View All Schemes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {schemes.map((scheme, i) => (
            <SchemeCard key={i} {...scheme} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
