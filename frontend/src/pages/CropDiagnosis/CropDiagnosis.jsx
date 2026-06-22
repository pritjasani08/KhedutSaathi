import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, AlertCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mlApi } from '../../services/mlApi';
import { cropDiagnosisAPI } from '../../services/api';

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

  // Local State
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

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
    setUploadedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setCurrentStep(1); // Move to Preview Step
  };

  const handleCancelPreview = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
    setCurrentStep(0); // Back to Upload
  };

  const handleStartAnalysis = () => {
    setCurrentStep(2); // Analysis Step
    predictMutation.mutate(uploadedImage);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
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

        {/* Diagnostic Workflow */}
        <div className="mb-16">
          <DiagnosisStepper currentStep={currentStep} />

          <div className="mt-8 relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <UploadStep 
                  key="upload" 
                  onImageSelected={handleImageSelected} 
                />
              )}
              {currentStep === 1 && (
                <PreviewStep 
                  key="preview"
                  imageFile={uploadedImage}
                  imagePreviewUrl={imagePreviewUrl}
                  onCancel={handleCancelPreview}
                  onConfirm={handleStartAnalysis}
                />
              )}
              {currentStep === 2 && (
                <motion.div key="analysis" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <AnalysisStep imagePreviewUrl={imagePreviewUrl} />
                  
                  {predictMutation.isError && (
                    <div className="max-w-md mx-auto mt-6 bg-red-50 text-red-600 p-4 rounded-xl flex flex-col items-center gap-3 border border-red-200 text-center">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-bold">Analysis Failed</p>
                      </div>
                      <p className="text-sm">{predictMutation.error?.customMessage || predictMutation.error?.message || 'Could not connect to AI server.'}</p>
                      <button onClick={handleReset} className="mt-2 btn-secondary text-sm">
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
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
            </AnimatePresence>
          </div>
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
