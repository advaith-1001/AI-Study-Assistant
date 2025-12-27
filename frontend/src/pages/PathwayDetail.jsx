import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pathwayAPI } from '../services/apiClient';
import usePathwayStore from '../store/pathwayStore';
import ChatSidebar from '../components/ChatSidebar';

const PathwayDetail = () => {
  const { pathwayId } = useParams();
  const navigate = useNavigate();
  const { 
    currentPathway, 
    setCurrentPathway, 
    pathwayStatus,
    setPathwayStatus,
    loading, 
    setLoading, 
    error, 
    setError,
    getCachedStatus,
    isCacheValid,
  } = usePathwayStore();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch pathway data once on mount
  useEffect(() => {
    fetchPathwayData();
  }, [pathwayId]);

  // Smart polling - only fetch if cache is expired
  useEffect(() => {
    const interval = setInterval(() => {
      // Only fetch if cache is invalid
      if (!isCacheValid(pathwayId)) {
        fetchPathwayStatus();
      }
    }, 5000); // Check every 5 seconds, but only fetch if needed
    
    return () => clearInterval(interval);
  }, [pathwayId]);

  const fetchPathwayData = async () => {
    try {
      setLoading(true);
      setError('');
      // ✅ NEW: Use optimized single pathway endpoint instead of fetching all
      const pathway = await pathwayAPI.getPathwayById(pathwayId);
      setCurrentPathway(pathway);
      await fetchPathwayStatus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch pathway');
      console.error('Fetch pathway error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPathwayStatus = async () => {
    try {
      const status = await pathwayAPI.getPathwayStatus(pathwayId);
      setPathwayStatus(pathwayId, status);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Assembling Pathway...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Sidebar Overlay */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsChatOpen(false)} 
        />
      )}

      {/* Sophisticated Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mb-1">Learning Track</p>
              <h1 className="text-xl font-black text-slate-900 leading-none">
                {currentPathway?.name || 'Pathway'}
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
             <button
              onClick={() => setIsChatOpen(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
            >
              <span className="text-lg">💬</span> Ask AI
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold flex items-center gap-3">
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
             {error}
          </div>
        )}

        {/* Dynamic Progress Overview */}
        {pathwayStatus && (
          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 mb-12 shadow-sm relative overflow-hidden">
            {/* <div className="absolute top-0 right-0 p-8">
                <div className="w-20 h-20 rounded-full border-[6px] border-slate-50 border-t-blue-500 flex items-center justify-center -rotate-45">
                    <span className="text-lg font-black text-slate-900 rotate-45">{pathwayStatus.completion_percentage}%</span>
                </div>
            </div> */}
            
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Mastery Metrics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Completion', val: `${pathwayStatus.completion_percentage}%`, color: 'text-blue-600' },
                { label: 'Completed', val: pathwayStatus.completed_topics_count, color: 'text-emerald-500' },
                { label: 'Remaining', val: pathwayStatus.pending_topics_count, color: 'text-amber-500' },
                { label: 'Total Steps', val: pathwayStatus.total_topics, color: 'text-slate-400' }
              ].map((stat, i) => (
                <div key={i}>
                  <p className={`text-3xl font-black ${stat.color} mb-1`}>{stat.val}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${pathwayStatus.completion_percentage}%` }}
              />
            </div>
          </section>
        )}

        {/* Curriculum Timeline */}
        <section className="relative">
          <div className="absolute left-[27px] top-10 bottom-10 w-0.5 bg-slate-100" />
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curriculum Structure</h2>
            {/* <button 
                onClick={() => navigate(`/pathway/${pathwayId}/upload`)}
                className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-lg transition-colors"
            >
                + Add Materials
            </button> */}
          </div>

          <div className="space-y-6">
            {currentPathway?.topics?.sort((a, b) => a.order_number - b.order_number).map((topic, idx) => (
              <div
                key={topic.id}
                onClick={() => navigate(`/topic/${topic.id}`)}
                className="group relative flex items-start gap-8 p-6 bg-white rounded-[2rem] border border-slate-200/60 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer"
              >
                {/* Step Number Bubble */}
                <div className="relative z-10 w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 font-black text-xl group-hover:border-blue-600 group-hover:text-blue-600 transition-all">
                  {topic.order_number}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {topic.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(topic.status)}`}>
                      {topic.status.replace('_', ' ')}
                    </span>
                  </div>

                  {topic.keywords && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {topic.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <ChatSidebar 
        pathwayId={pathwayId} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
};

export default PathwayDetail;