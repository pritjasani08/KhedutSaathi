import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Upload, Camera, Image, X, AlertTriangle, CheckCircle2,
  ShieldAlert, Pill, ShieldCheck, Clock, Eye, Loader2
} from 'lucide-react';
import { supabase } from '../../services/supabase/client';
import { useAuth } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

// Mock diagnosis removed in favor of Supabase

export default function CropDiagnosis() {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('crop_diagnosis_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/crop-disease/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      setResult(data);

      // Save to Supabase
      if (data && data.details && user?.id) {
        let uploadedImageUrl = null;
        try {
          const fileExt = image.name.split('.').pop();
          const fileName = `diagnosis_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `history/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('crop_images')
            .upload(filePath, image);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('crop_images')
              .getPublicUrl(filePath);
            uploadedImageUrl = publicUrl;
          } else {
            console.error('Image upload failed:', uploadError);
          }
        } catch(e) {
          console.error("Failed to upload image", e);
        }

        const insertData = {
          user_id: user.id,
          crop: data.details.crop || 'Unknown',
          disease: data.details.disease || 'Unknown',
          status: data.details.status === 'healthy' ? 'Healthy' : 'Active',
          confidence: data.confidence,
          image_url: uploadedImageUrl,
          details: data.details // Saving the full JSON for the modal
        };
        const { error: insertError } = await supabase
          .from('crop_diagnosis_history')
          .insert([insertData]);
        
        if (!insertError) {
          fetchHistory();
        } else {
          console.error('Error saving diagnosis to history:', insertError);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
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
    <div className="min-h-screen gradient-bg pt-24 pb-16 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modal for View Details */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 relative border border-subtle shadow-2xl"
          >
            <button 
              onClick={() => setSelectedRecord(null)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h3 className="text-2xl font-display font-bold mb-6 text-heading flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" /> Diagnosis Details
            </h3>
            
            {/* Top row with Image and basic stats */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {selectedRecord.image_url ? (
                <img src={selectedRecord.image_url} alt="Analyzed Crop" className="w-full md:w-1/2 h-48 object-cover rounded-2xl shadow-sm border border-subtle" />
              ) : (
                <div className="w-full md:w-1/2 h-48 bg-surface-muted rounded-2xl flex flex-col items-center justify-center border border-dashed border-subtle">
                  <Image className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-slate-500">No image available</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 w-full md:w-1/2">
                <div className="bg-surface-muted p-3 rounded-xl border border-subtle">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Date</p>
                  <p className="text-sm font-medium">{new Date(selectedRecord.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-surface-muted p-3 rounded-xl border border-subtle">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Status</p>
                  <p className="text-sm font-medium"><span className={statusColor(selectedRecord.status)}>{selectedRecord.status}</span></p>
                </div>
                <div className="bg-surface-muted p-3 rounded-xl border border-subtle col-span-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Crop & Disease</p>
                  <p className="text-sm font-medium">{selectedRecord.crop} • {selectedRecord.disease}</p>
                </div>
                {selectedRecord.confidence && (
                  <div className="col-span-2 bg-primary/5 p-3 rounded-xl border border-primary/20">
                    <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-1">AI Confidence</p>
                    <p className="text-primary font-bold">{Number(selectedRecord.confidence).toFixed(2)}%</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Treatment Section */}
            {selectedRecord.details ? (
              <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {selectedRecord.details.symptoms && selectedRecord.details.symptoms.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 rounded-xl p-4">
                    <p className="text-xs text-orange-600 font-medium mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Symptoms
                    </p>
                    <ul className="space-y-1">
                      {selectedRecord.details.symptoms.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedRecord.details.prevention && selectedRecord.details.prevention.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Prevention
                    </p>
                    <ul className="space-y-1">
                      {selectedRecord.details.prevention.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedRecord.details.organic_treatment && selectedRecord.details.organic_treatment.length > 0 && !selectedRecord.details.organic_treatment.includes("No treatment required") && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-xl p-4">
                    <p className="text-xs text-green-600 font-medium mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Organic Treatment
                    </p>
                    <ul className="space-y-1">
                      {selectedRecord.details.organic_treatment.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedRecord.details.chemical_treatment && selectedRecord.details.chemical_treatment.length > 0 && !selectedRecord.details.chemical_treatment.includes("No treatment required") && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 rounded-xl p-4">
                    <p className="text-xs text-purple-600 font-medium mb-2 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" /> Chemical Treatment
                    </p>
                    <ul className="space-y-1">
                      {selectedRecord.details.chemical_treatment.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center text-sm text-slate-500">
                Detailed treatment information is not available for this historical record.
              </div>
            )}
          </motion.div>
        </div>
      )}

      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/60 dark:bg-primary-900/40 text-primary text-sm font-semibold mb-4">
            <Pill className="w-4 h-4" /> AI Disease Detection
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            {t('cropDiagnosis.title')}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            {t('cropDiagnosis.subtitle')}
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto flex flex-col gap-8 mb-12">
          {/* TOP — Upload Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
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
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${dragActive
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
                      Analyze Crop Image
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* BOTTOM — Results Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
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
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    {error}
                  </div>
                )}

                {result && result.details === null ? (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-yellow-700 font-medium">Disease information currently unavailable.</p>
                    <p className="text-sm text-yellow-600 mt-1">Prediction: {result.prediction} ({result.confidence}%)</p>
                  </div>
                ) : result && result.details ? (
                  <>
                    {/* Crop & Disease Name */}
                    {result.details.status === "healthy" ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-green-500 font-medium mb-1">Crop: {result.details.crop}</p>
                            <p className="font-display font-bold text-lg text-body mb-2">✅ Crop Healthy</p>
                            <p className="text-sm text-green-700">{result.details.message}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-red-500 font-medium mb-1">Crop: {result.details.crop}</p>
                            <p className="font-display font-bold text-lg text-body">{result.details.disease}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confidence */}
                    <div className="bg-surface-muted rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('cropDiagnosis.confidence')} Score</p>
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

                    {/* Symptoms */}
                    {result.details.symptoms && result.details.symptoms.length > 0 && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                        <p className="text-xs text-orange-600 font-medium mb-3 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Symptoms
                        </p>
                        <ul className="space-y-2">
                          {result.details.symptoms.map((item, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Prevention */}
                    {result.details.prevention && result.details.prevention.length > 0 && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-medium mb-3 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Prevention
                        </p>
                        <ul className="space-y-2">
                          {result.details.prevention.map((item, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Organic Treatment */}
                    {result.details.organic_treatment && result.details.organic_treatment.length > 0 &&
                      !result.details.organic_treatment.includes("No treatment required") && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                          <p className="text-xs text-green-600 font-medium mb-3 flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5" />
                            Organic Treatment
                          </p>
                          <ul className="space-y-2">
                            {result.details.organic_treatment.map((item, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Chemical Treatment */}
                    {result.details.chemical_treatment && result.details.chemical_treatment.length > 0 &&
                      !result.details.chemical_treatment.includes("No treatment required") && (
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                          <p className="text-xs text-purple-600 font-medium mb-3 flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5" />
                            Chemical Treatment
                          </p>
                          <ul className="space-y-2">
                            {result.details.chemical_treatment.map((item, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </>
                ) : null}
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
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-surface-muted/50 transition-colors duration-200">
                    <td className="py-4 px-4 text-sm text-slate-600">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
                        {row.image_url ? (
                          <button onClick={() => setSelectedRecord(row)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1 w-fit">
                            <Image className="w-3.5 h-3.5" /> View Image
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs flex items-center gap-1"><Image className="w-3.5 h-3.5" /> No Image</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-body">{row.crop}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{row.disease}</td>
                    <td className="py-4 px-4"><span className={statusColor(row.status)}>{row.status}</span></td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => setSelectedRecord(row)}
                        className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
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
