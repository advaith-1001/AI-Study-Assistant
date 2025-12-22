import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathwayAPI } from '../services/apiClient';
import usePathwayStore from '../store/pathwayStore';

const CreatePathway = () => {
  const navigate = useNavigate();
  const { addPathway } = usePathwayStore();
  
  const [step, setStep] = useState(1);
  const [pathwayName, setPathwayName] = useState('');
  const [topicsText, setTopicsText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPathwayId, setCurrentPathwayId] = useState(null);

  const topics = topicsText
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => t);

  const handleCreatePathway = async (e) => {
    e.preventDefault();
    setError('');
    if (!pathwayName.trim()) return setError('Please provide a name for this pathway.');
    if (topics.length === 0) return setError('At least one module/topic is required.');

    try {
      setLoading(true);
      const newPathway = await pathwayAPI.createPathway(pathwayName, topics);
      setCurrentPathwayId(newPathway.id);
      addPathway(newPathway);
      setStep(2);
    } catch (err) {
      setError('System could not initialize pathway. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 4) return setError('Knowledge base limited to 4 PDFs per pathway.');
    setFiles(selectedFiles);
    setError('');
  };

  const handleUploadPDFs = async (e) => {
    e.preventDefault();
    if (files.length === 0) return setError('No materials selected for upload.');

    try {
      setLoading(true);
      await pathwayAPI.uploadPDFs(currentPathwayId, files);
      setSuccess('Knowledge base integrated. Finalizing structure...');
      setTimeout(() => navigate(`/pathway/${currentPathwayId}`), 1500);
    } catch (err) {
      setError('File processing failed. Ensure PDFs are not password protected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-20">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span>←</span> Back to Library
          </button>
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-emerald-500'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {step === 1 ? 'Phase 01: Definition' : 'Phase 02: Intelligence'}
             </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Step Journey Indicator */}
        <div className="flex items-center justify-center gap-4 mb-16">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step >= 1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>1</div>
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-slate-900' : 'bg-slate-100'}`} />
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step === 2 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>2</div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in zoom-in-95">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in zoom-in-95">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             {success}
          </div>
        )}

        {/* STEP 1: DEFINITION */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3 text-center">Define your <span className="text-blue-600">Pathway</span></h2>
                <p className="text-slate-500 text-center font-medium">What knowledge do you want the Study Assistant to organize?</p>
            </header>

            <form onSubmit={handleCreatePathway} className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-blue-600 transition-colors">
                  Identity / Pathway Name
                </label>
                <input
                  type="text"
                  value={pathwayName}
                  onChange={(e) => setPathwayName(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:border-blue-600/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Modular Structure (One per line)
                </label>
                <textarea
                  value={topicsText}
                  onChange={(e) => setTopicsText(e.target.value)}
                  placeholder="Intro to Microservices&#10;Consensus Algorithms&#10;Data Partitioning strategies"
                  rows={6}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-mono text-sm placeholder:text-slate-300 focus:bg-white focus:border-blue-600/10 outline-none transition-all resize-none"
                />
                <div className="flex justify-between mt-3 px-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Modules Detected: {topics.length}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Recommended: 3-8</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Initialize Pathway →'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: KNOWLEDGE INTEGRATION */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 text-center">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Source <span className="text-blue-600">Integration</span></h2>
                <p className="text-slate-500 font-medium">Upload the technical documentation to feed the RAG engine.</p>
            </header>

            <form onSubmit={handleUploadPDFs} className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
              <div className="relative group">
                <input
                  type="file" multiple accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden" id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-black text-slate-900 mb-1">Upload Study Materials</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Support for PDF (max 4 files)</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Ready for ingestion</p>
                  <div className="grid grid-cols-1 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-lg">📄</span>
                            <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 px-2 py-1 bg-white rounded-md">PDF</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || files.length === 0}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Run Embedding Engine →'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/pathway/${currentPathwayId}`)}
                  className="text-xs font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Skip for now, I'll add them later
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatePathway;