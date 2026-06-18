import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, MapPin, Package, IndianRupee, FileText, Image, Gavel, User, Scale } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const mockListings = [
  { id: 1, crop: 'Wheat', farmer: 'Ramesh Patel', quantity: '50 Quintals', price: '₹2,400/Quintal', location: 'Ahmedabad, Gujarat', time: '2 hours ago' },
  { id: 2, crop: 'Rice', farmer: 'Suresh Kumar', quantity: '30 Quintals', price: '₹2,100/Quintal', location: 'Rajkot, Gujarat', time: '5 hours ago' },
  { id: 3, crop: 'Cotton', farmer: 'Bhavesh Shah', quantity: '80 Quintals', price: '₹6,500/Quintal', location: 'Surat, Gujarat', time: '1 day ago' },
  { id: 4, crop: 'Groundnut', farmer: 'Keshav Desai', quantity: '40 Quintals', price: '₹5,700/Quintal', location: 'Junagadh, Gujarat', time: '1 day ago' },
];

export default function SellYield() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    cropName: '', quantity: '', price: '', description: '', location: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
      {/* Listing Form */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="glass-card p-6 md:p-8"
      >
        <h3 className="font-display text-lg font-bold text-body mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Post Your Yield for Sale
        </h3>

        <div className="grid md:grid-cols-2 gap-5">
          <motion.div variants={fadeUp}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.cropName')}</label>
            <input
              type="text" name="cropName" value={form.cropName} onChange={handleChange}
              placeholder="e.g., Wheat, Rice, Cotton"
              className="input-field"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.quantity')}</label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number" name="quantity" value={form.quantity} onChange={handleChange}
                placeholder="e.g., 50"
                className="input-field !pl-10"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.price')}</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number" name="price" value={form.price} onChange={handleChange}
                placeholder="e.g., 2400"
                className="input-field !pl-10"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.location')}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" name="location" value={form.location} onChange={handleChange}
                placeholder="e.g., Ahmedabad, Gujarat"
                className="input-field !pl-10"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.description')}</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={3}
              placeholder="Describe your produce quality, harvest date, etc."
              className="input-field resize-none"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={5}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.uploadImages')}</label>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary-50/30 transition-all duration-300">
              <Image className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">Choose images</span>
              <input type="file" accept="image/*" multiple className="hidden" />
            </label>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="flex items-end">
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              {t('marketHub.postListing')}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Marketplace Feed */}
      <div>
        <h3 className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {t('marketHub.marketplaceFeed')}
        </h3>

        <div className="grid md:grid-cols-2 gap-5">
          {mockListings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-display font-bold text-lg text-body">{listing.crop}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <User className="w-3.5 h-3.5" /> {listing.farmer}
                  </p>
                </div>
                <span className="badge-success">{listing.time}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-surface-muted rounded-lg p-3">
                  <p className="text-xs text-slate-500">{t('marketHub.quantity')}</p>
                  <p className="font-semibold text-body text-sm">{listing.quantity}</p>
                </div>
                <div className="bg-surface-muted rounded-lg p-3">
                  <p className="text-xs text-slate-500">{t('marketHub.expectedPrice')}</p>
                  <p className="font-semibold text-primary text-sm">{listing.price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {listing.location}
                </p>
                <button className="btn-accent text-xs !py-2 !px-4 flex items-center gap-1">
                  <Gavel className="w-3.5 h-3.5" />
                  {t('marketHub.placeBid')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
