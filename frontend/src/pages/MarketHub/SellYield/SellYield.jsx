import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, MapPin, Package, IndianRupee, Image as ImageIcon, Scale, Loader2 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function SellYield() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    cropName: '', quantity: '', price: '', description: '', village: '', district: '', state: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('cropName', form.cropName);
    formData.append('quantity', form.quantity);
    formData.append('expectedPrice', form.price);
    
    // Combine location fields
    const combinedLocation = `${form.village}, ${form.district}, ${form.state}`;
    formData.append('location', combinedLocation);
    
    formData.append('description', form.description);
    
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await fetch('http://localhost:5000/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type here, let the browser set it with the boundary for FormData
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create listing');
      }

      setSuccess('Yield listed successfully!');
      setForm({ cropName: '', quantity: '', price: '', description: '', village: '', district: '', state: '' });
      setImages([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Listing Form */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="glass-card p-6 md:p-8 max-w-4xl mx-auto"
      >
        <h3 className="font-display text-lg font-bold text-body mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Post Your Yield for Sale
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <motion.div variants={fadeUp}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Crop Name</label>
            <input
              type="text" name="cropName" value={form.cropName} onChange={handleChange}
              placeholder="e.g., Wheat, Rice, Cotton"
              className="input-field"
              required
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Quantity (in Quintals)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number" name="quantity" value={form.quantity} onChange={handleChange}
                placeholder="e.g., 50"
                className="input-field !pl-10"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Expected Price Per Quintal</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number" name="price" value={form.price} onChange={handleChange}
                placeholder="e.g., 2400"
                className="input-field !pl-10"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="md:col-span-2 grid md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Village</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" name="village" value={form.village} onChange={handleChange}
                  placeholder="Village"
                  className="input-field !pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" name="district" value={form.district} onChange={handleChange}
                  placeholder="District"
                  className="input-field !pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">State</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" name="state" value={form.state} onChange={handleChange}
                  placeholder="State"
                  className="input-field !pl-10"
                  required
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={3}
              placeholder="Describe your produce quality, harvest date, etc."
              className="input-field resize-none"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={5} className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Upload Images</label>
            <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary-50/30 transition-all duration-300">
              <ImageIcon className="w-8 h-8 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                {images.length > 0 ? `${images.length} file(s) selected` : 'Click to choose images'}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
            
            {/* Image Previews */}
            {images.length > 0 && (
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                    <img 
                      src={URL.createObjectURL(img)} 
                      alt={`preview-${idx}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="md:col-span-2 flex items-end mt-4">
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-70">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
