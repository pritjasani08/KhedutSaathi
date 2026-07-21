import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UploadStep({ onImageSelected }) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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

  const startCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          stopCamera();
          onImageSelected(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full flex flex-col items-center"
    >
      <AnimatePresence mode="wait">
        {isCameraOpen ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-black rounded-3xl overflow-hidden relative shadow-2xl"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-[60vh] md:h-[500px] object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-white p-6 text-center">
                <p className="text-red-400 font-medium">{cameraError}</p>
              </div>
            )}
            
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={stopCamera}
                className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur transition-colors"
                aria-label="Close Camera"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {!cameraError && (
              <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
                  aria-label="Capture Photo"
                >
                  <div className="w-12 h-12 bg-white rounded-full border border-slate-200" />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-10 md:p-16 text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? 'border-primary bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
                : 'border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
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
                onClick={startCamera}
                className="btn-secondary cursor-pointer flex items-center gap-2 justify-center px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-transform"
                aria-label="Open camera to take a photo"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isCameraOpen && (
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-6">
          Supported formats: JPG, PNG. Max size: 10MB.
        </p>
      )}
    </motion.div>
  );
}
