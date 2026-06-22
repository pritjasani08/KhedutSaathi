import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, AlertCircle, Upload, Image, Camera, X, CheckCircle2, Pill, Loader2, AlertTriangle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mlApi } from '../../services/mlApi';
import { cropDiagnosisAPI } from '../../services/api';
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};



// Stepper Components
import DiagnosisStepper from './components/DiagnosisStepper';
import UploadStep from './components/UploadStep';
import PreviewStep from './components/PreviewStep';
import AnalysisStep from './components/AnalysisStep';
import DiagnosisReport from './components/DiagnosisReport';
import TreatmentPlan from './components/TreatmentPlan';

export default function CropDiagnosis() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Application state
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera permission denied or not available. Please allow camera access.");
      setIsCameraOpen(false);
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
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setImage(file);
          setPreview(URL.createObjectURL(file));
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // History Query

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // History Query
  const { data: history = [] } = useQuery({
    queryKey: ['diagnosisHistory'],
    queryFn: async () => {
      const res = await cropDiagnosisAPI.getHistory();
      return (res && res.success && res.data) ? res.data : (Array.isArray(res) ? res : []);
    },
    initialData: [],
  });

  // Prediction Mutation
  const predictMutation = useMutation({
    mutationFn: (file) => {
      const lang = localStorage.getItem('i18nextLng') || 'en';
      return mlApi.predictDisease(file, lang);
    },
    onSuccess: async (data) => {
      // Save history after successful prediction
      try {
        await cropDiagnosisAPI.saveHistory({
          crop: data.details?.crop || 'Unknown',
          disease: data.details?.disease || 'Unknown Disease',
          status: data.details?.status || 'Active',
          confidence: parseFloat(data.confidence) || 0,
          image_url: null
        });
        // Invalidate history query to refetch
        queryClient.invalidateQueries({ queryKey: ['diagnosisHistory'] });
      } catch (saveErr) {
        console.error("Could not save history:", saveErr);
      }

      // Automatically move to Result Step after a short delay to let analysis animation finish
      setTimeout(() => {
        setCurrentStep(3); // Result Step
      }, 1500);
    },
    onError: (err) => {
      // Stay on Analysis step so user sees the error
      console.error(err);
    }
  });

  // Handlers
  const handleImageSelected = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setCurrentStep(1); // Move to Preview Step
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelected(e.target.files[0]);
    }
  };

  const handleCancelPreview = () => {
    setImage(null);
    setPreview(null);
    setCurrentStep(0); // Back to Upload
  };

  const handleAnalyze = () => {
    if (!image) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      predictMutation.mutate(image, {
        onSettled: () => setIsAnalyzing(false)
      });
    }, 1500);
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    predictMutation.reset();
    setCurrentStep(0);
  };

  // Prepare result data format for the UI components
  const formatResult = (data) => {
    if (!data) return null;
    const details = data.details || {};
    const treatments = [
      ...(details.organic_treatment || []),
      ...(details.chemical_treatment || [])
    ];
    return {
      disease: details.disease || 'Unknown Disease',
      confidence: parseFloat(data.confidence) || 0,
      severity: details.status || 'High',
      symptoms: details.symptoms || ['Discoloration on leaves', 'Fungal spots visible'], // Fallback if API lacks it
      treatment: treatments.length > 0 ? treatments : ['No specific treatment found'],
      prevention: Array.isArray(details.prevention) ? details.prevention : ['No prevention data found']
    };
  };

  // Helper for History Table
  const statusColor = (status) => {
    switch (status) {
      case 'Treated': return 'badge-success';
      case 'Active': return 'badge-danger';
      case 'Monitoring': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-heading mb-4">
            {t('cropDiagnosis.title')}
          </h1>
          <p className="text-slate-500 text-lg">
            {t('cropDiagnosis.subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 mb-12 max-w-4xl mx-auto">
          {/* TOP — Upload Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 md:p-8"
          >
            <h2 className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {t('cropDiagnosis.uploadTitle')}
            </h2>

            {!preview ? (
              isCameraOpen ? (
                <div className="border-2 border-primary rounded-2xl p-4 text-center bg-slate-900 overflow-hidden relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-72 object-cover rounded-xl bg-black"
                  />
                  <div className="flex justify-center gap-4 mt-4">
                    <button 
                      onClick={capturePhoto} 
                      className="btn-primary flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Capture Photo
                    </button>
                    <button 
                      onClick={stopCamera} 
                      className="btn-secondary flex items-center gap-2 bg-red-500 text-white border-red-500 hover:bg-red-600"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    dragActive
                      ? 'border-primary bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
                      : 'border-subtle hover:border-primary/50 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
                  }`}
                >
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Image className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-slate-700 font-semibold mb-2">{t('cropDiagnosis.dragDrop')}</p>
                  <p className="text-slate-400 text-sm mb-6">{t('cropDiagnosis.orBrowse')}</p>
  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <label className="btn-primary text-sm cursor-pointer flex items-center gap-2 justify-center">
                      <Upload className="w-4 h-4" />
                      Browse Files
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>
                    <button 
                      onClick={startCamera}
                      className="btn-secondary text-sm cursor-pointer flex items-center gap-2 justify-center"
                    >
                      <Camera className="w-4 h-4" />
                      {t('cropDiagnosis.camera')}
                    </button>
                  </div>
  
                  <p className="text-slate-400 text-xs mt-4">{t('cropDiagnosis.supportedFormats')}</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden group bg-slate-900">
                  <img 
                    src={preview} 
                    alt="Crop" 
                    className={`w-full h-72 object-cover transition-all duration-500 ${isAnalyzing ? 'opacity-40 blur-sm scale-105' : 'opacity-100'}`} 
                  />
                  {!isAnalyzing && (
                    <>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <button
                        onClick={handleCancelPreview}
                        className="absolute top-3 right-3 w-10 h-10 bg-surface/90 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors duration-300 z-10"
                      >
                        <X className="w-5 h-5 text-slate-700" />
                      </button>
                    </>
                  )}
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1),0_0_40px_rgba(34,197,94,0.6)]"
                      >
                        <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-green-500/30" />
                      </motion.div>
                      <p className="text-green-400 font-medium text-lg animate-pulse mt-32 bg-slate-900/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-green-500/30">
                        Analyzing tissue patterns...
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">📎 {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)</p>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span key="analyzing-text">{t('cropDiagnosis.analyzing')}</span>
                    </>
                  ) : (
                    <>
                      <Pill className="w-5 h-5" />
                      <span key="analyze-text">{t('cropDiagnosis.analyzeButton') || 'Analyze Crop Image'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* BOTTOM — Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6 md:p-8"
          >
            <h2 className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              {t('cropDiagnosis.results')}
            </h2>

            {!result && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                  <Pill className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-slate-400 text-lg">{t('cropDiagnosis.noDiagnosis')}</p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-80">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <p className="text-slate-600 font-semibold">{t('cropDiagnosis.analyzing')}</p>
                <p className="text-slate-400 text-sm mt-2">Running AI model analysis...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Disease Name */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-red-500 font-medium mb-1">{t('cropDiagnosis.diseaseName')}</p>
                      <p className="font-display font-bold text-lg text-body">{result.disease}</p>
                    </div>
                  </div>
                </div>

                {/* Confidence & Severity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-muted rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('cropDiagnosis.confidence')}</p>
                    <p className="font-display text-2xl font-bold gradient-text">{result.confidence}%</p>
                    <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                      />
                    </div>
                  </div>
                  <div className="bg-surface-muted rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Severity</p>
                    <p className="font-display text-2xl font-bold text-slate-700 dark:text-slate-200">{result.severity || 'High'}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {currentStep === 3 && (
            <DiagnosisReport 
              key="report"
              result={formatResult(predictMutation.data)}
              onContinue={() => setCurrentStep(4)}
            />
          )}
          {currentStep === 4 && (
            <TreatmentPlan 
              key="treatment"
              result={formatResult(predictMutation.data)}
              onReset={handleReset}
            />
          )}
          </div>


        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 md:p-8 mt-16"
        >
          <h2 className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t('cropDiagnosis.history')}
          </h2>

          <div className="overflow-x-auto">
            {history.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('cropDiagnosis.date')}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('cropDiagnosis.crop')}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('cropDiagnosis.disease')}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('cropDiagnosis.status')}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('cropDiagnosis.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-surface-muted/50 transition-colors duration-200">
                      <td className="py-4 px-4 text-sm text-slate-600">{row.date}</td>
                      <td className="py-4 px-4 text-sm font-medium text-body">{row.crop}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{row.disease}</td>
                      <td className="py-4 px-4"><span className={statusColor(row.status)}>{row.status}</span></td>
                      <td className="py-4 px-4">
                        <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {t('cropDiagnosis.viewDetails')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-slate-500">
                No past diagnoses found.
              </div>
            )}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
