import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathwayAPI } from '../services/apiClient';
import useAuthStore from '../store/authStore';
import usePathwayStore from '../store/pathwayStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { pathways, setPathways, loading, setLoading, error, setError } = usePathwayStore();

  useEffect(() => {
    fetchPathways();
  }, []);

  const fetchPathways = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pathwayAPI.getAllPathways();
      setPathways(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch pathways');
      console.error('Fetch pathways error:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.username || user?.email?.split('@')[0] || 'Scholar';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <span className="font-black text-xl">S</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">StudyFlow <span className="text-blue-600 italic">AI</span></h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
              <p className="text-sm font-bold text-slate-700 capitalize leading-none">{displayName}</p>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Your Learning <span className="text-blue-600">Library</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-md">
              Manage your generated pathways and track your progress through technical concepts.
            </p>
          </div>
          <button
            onClick={() => navigate('/create-pathway')}
            className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold overflow-hidden shadow-2xl shadow-slate-200 hover:shadow-blue-200 transition-all hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-xl">+</span> Create New Pathway
            </span>
            <div className="absolute inset-0 bg-blue-600 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        {/* Dynamic Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Synchronizing Data...</p>
          </div>
        ) : pathways.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-3xl">📚</div>
            <p className="text-slate-400 font-medium mb-8 max-w-xs">You haven't initialized any learning pathways yet.</p>
            <button
              onClick={() => navigate('/create-pathway')}
              className="text-blue-600 font-black hover:underline underline-offset-8"
            >
              Start Your First Journey →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pathways.map((pathway) => (
              <div
                key={pathway.id}
                onClick={() => navigate(`/pathway/${pathway.id}`)}
                className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer overflow-hidden hover:-translate-y-2"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-500" />
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {new Date(pathway.created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                    {pathway.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-slate-400 mb-8 font-bold text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      {pathway.topics?.length || 0} Modules
                    </span>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 group-hover:translate-x-1 transition-transform inline-block">
                      View Insights <span className="text-blue-600 ml-1">→</span>
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
