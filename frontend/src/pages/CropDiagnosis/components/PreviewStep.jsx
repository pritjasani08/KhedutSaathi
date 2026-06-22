import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function PreviewStep({ imageFile, imagePreviewUrl, onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card overflow-hidden">
        {/* Preview Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between bg-surface-muted/50">
          <h3 className="font-semibold text-heading">Preview Image</h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {imageFile ? (imageFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
          </span>
        </div>

        {/* Image Container */}
        <div className="relative w-full h-[400px] bg-slate-900 flex items-center justify-center overflow-hidden">
          {imagePreviewUrl ? (
            <img 
              src={imagePreviewUrl} 
              alt="Crop Leaf Preview" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-slate-500 flex flex-col items-center">
              <AlertCircle className="w-10 h-10 mb-2" />
              <p>No preview available</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface">
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Select Different Image
          </button>
          
          <button 
            onClick={onConfirm}
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Check className="w-4 h-4" />
            Proceed to Analysis
          </button>
        </div>
      </div>
    </motion.div>
  );
}
