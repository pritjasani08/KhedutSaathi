import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UploadStep({ onImageSelected }) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file);
    }
  }, [onImageSelected]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full flex flex-col items-center"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-10 md:p-16 text-center transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
            : 'border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop or click to upload a crop image"
      >
        <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/10">
          <ImageIcon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl md:text-2xl font-display font-bold text-slate-800 dark:text-slate-100 mb-3">
          Upload Crop Image
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Drag and drop a clear, close-up photo of the affected plant leaf, or browse your device.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <label className="btn-primary cursor-pointer flex items-center gap-2 justify-center px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
            <Upload className="w-5 h-5" />
            Browse Files
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect} 
              aria-label="Upload image from file explorer"
            />
          </label>
          <button 
            className="btn-secondary flex items-center gap-2 justify-center px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-transform"
            aria-label="Open camera to take a photo"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
        </div>
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-sm mt-6">
        Supported formats: JPG, PNG. Max size: 10MB.
      </p>
    </motion.div>
  );
}
