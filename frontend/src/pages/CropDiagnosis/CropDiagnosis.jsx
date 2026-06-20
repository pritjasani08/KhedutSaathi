import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Upload, Camera, Image, X, AlertTriangle, CheckCircle2,
  ShieldAlert, Pill, ShieldCheck, Clock, Eye, Loader2
} from 'lucide-react';
import { cropDiagnosisAPI } from '../../services/api';


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

// Mock diagnosis result
const mockResult = {
  disease: 'Late Blight (Phytophthora infestans)',
  confidence: 94.7,
  severity: 'High',
  treatment: [
    'Apply Mancozeb 75% WP @ 2.5g/litre as foliar spray',
    'Remove and destroy infected plant parts',
    'Apply copper-based fungicide as preventive measure',
    'Repeat spraying every 7-10 days during wet weather',
  ],
  prevention: [
    'Use certified disease-free seed tubers',
    'Maintain proper plant spacing for air circulation',
    'Avoid overhead irrigation',
    'Practice crop rotation with non-solanaceous crops',
    'Remove volunteer plants and weed hosts',
  ],
};

// Removed mockHistory

export default function CropDiagnosis() {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await cropDiagnosisAPI.getHistory();
      if (res && res.success && res.data) {
        setHistory(res.data);
      } else if (Array.isArray(res)) {
        setHistory(res);
      }
    } catch (err) {
      console.error("Failed to fetch diagnosis history", err);
      // Set empty array on failure instead of mock data
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);

    // Get language from localStorage
    const lang = localStorage.getItem('i18nextLng') || 'en';

    try {
      const formData = new FormData();
      formData.append('image', image);

      // Hit the FastAPI backend running on port 8000
      const res = await fetch(`http://localhost:8000/api/crop-disease/predict?lang=${lang}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (res.ok && data.success && data.details) {
        // Combine organic and chemical treatments
        const treatments = [
          ...(data.details.organic_treatment || []),
          ...(data.details.chemical_treatment || [])
        ];

        setResult({
          disease: data.details.disease || 'Unknown Disease',
          confidence: parseFloat(data.confidence) || 0,
          severity: data.details.status || 'High',
          treatment: Array.isArray(treatments) && treatments.length > 0 ? treatments : ['No specific treatment found'],
          prevention: Array.isArray(data.details.prevention) ? data.details.prevention : ['No prevention data found']
        });
        
        // Save to database
        try {
          await cropDiagnosisAPI.saveHistory({
            crop: data.details.crop || 'Unknown',
            disease: data.details.disease || 'Unknown Disease',
            status: data.details.status || 'Active',
            confidence: parseFloat(data.confidence) || 0,
            image_url: null
          });
          // Refresh history table
          fetchHistory();
        } catch (saveErr) {
          console.error("Could not save history to database:", saveErr);
        }
      } else {
        throw new Error(data.detail || 'Failed to analyze');
      }
    } catch (err) {
      console.error(err);
      // Fallback to mock if backend is down
      setResult(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  const severityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'badge-success';
      case 'Medium': return 'badge-warning';
      case 'High': return 'badge-danger';
      default: return 'badge-info';
    }
  };

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
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-heading">{t('cropDiagnosis.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('cropDiagnosis.subtitle')}</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* LEFT — Upload Panel */}
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
                  <button className="btn-secondary text-sm flex items-center gap-2 justify-center">
                    <Camera className="w-4 h-4" />
                    {t('cropDiagnosis.camera')}
                  </button>
                </div>

                <p className="text-slate-400 text-xs mt-4">{t('cropDiagnosis.supportedFormats')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden group">
                  <img src={preview} alt="Crop" className="w-full h-72 object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 w-10 h-10 bg-surface/90 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
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
                      {t('cropDiagnosis.analyzing')}
                    </>
                  ) : (
                    <>
                      <Pill className="w-5 h-5" />
                      {t('cropDiagnosis.analyzeButton') || 'Analyze Crop Image'}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* RIGHT — Results Panel */}
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('cropDiagnosis.severity')}</p>
                    <span className={`${severityColor(result.severity)} text-lg`}>{result.severity}</span>
                    <ShieldAlert className="w-5 h-5 text-red-400 mx-auto mt-2" />
                  </div>
                </div>

                {/* Treatment */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs text-green-600 font-medium mb-3 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5" />
                    {t('cropDiagnosis.treatment')}
                  </p>
                  <ul className="space-y-2">
                    {Array.isArray(result.treatment) && result.treatment.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-medium mb-3 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('cropDiagnosis.prevention')}
                  </p>
                  <ul className="space-y-2">
                    {Array.isArray(result.prevention) && result.prevention.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 md:p-8"
        >
          <h2 className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t('cropDiagnosis.history')}
          </h2>

          <div className="overflow-x-auto">
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
                {Array.isArray(history) && history.map((row) => (
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
