import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicAPI, pathwayAPI } from '../services/apiClient';
import ReactMarkdown from 'react-markdown';

const TopicDetail = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetchTopicData();
  }, [topicId]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const pathways = await pathwayAPI.getAllPathways();
      let foundTopic = null;
      for (const pathway of pathways) {
        foundTopic = pathway.topics?.find((t) => t.id === parseInt(topicId));
        if (foundTopic) {
          setTopic(foundTopic);
          // If the topic already has a summary, show it immediately
          if (foundTopic.summary) {
            setSummary(foundTopic.summary);
            setShowSummary(true);
          }
          break;
        }
      }
      if (!foundTopic) setError('Topic not found');
    } catch (err) {
      setError('Failed to fetch topic details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const data = await topicAPI.getTopicSummary(topicId);
      setSummary(data.summary);
      setShowSummary(true);
    } catch (err) {
      setError('Generation failed. Check your API limits.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await topicAPI.markTopicComplete(topicId);
      setTopic({ ...topic, status: 'COMPLETED' });
    } catch (err) {
      setError('Status update failed');
    }
  };

  if (loading && !topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Opening Document...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-100">
      {/* Editorial Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-16">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Pathway
          </button>
          
          <div className="flex items-center gap-4">
            {topic?.status === 'COMPLETED' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Mastered
              </span>
            )}
            <button 
              onClick={() => navigate(`/topic/${topicId}/quiz`)}
              className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
            >
              Test Knowledge
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {error && (
          <div className="mb-10 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}

        {topic && (
          <article>
            {/* Topic Hero */}
            <header className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                  Topic {topic.order_number}
                </span>
                <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">
                  {Math.round(summary?.length / 500) || 5} min read
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-8">
                {topic.name}
              </h1>
              
              {topic.keywords && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {topic.keywords.map((kw, i) => (
                    <span key={i} className="text-xs font-medium text-slate-500 bg-slate-100/50 px-3 py-1 rounded-full border border-slate-200/40">
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 border-y border-slate-100 py-6">
                {!showSummary ? (
                   <button
                    onClick={fetchSummary}
                    disabled={summaryLoading}
                    className="flex-1 bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {summaryLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : 'Generate Deep Summary'}
                  </button>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    className={`flex-1 font-bold py-4 px-8 rounded-2xl transition-all ${
                      topic.status === 'COMPLETED' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                      : 'bg-slate-900 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {topic.status === 'COMPLETED' ? 'Marked as Completed' : 'Mark Topic as Complete'}
                  </button>
                )}
              </div>
            </header>

            {/* Reading Content */}
            {showSummary && summary && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="prose prose-slate prose-lg max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
                  prose-strong:text-slate-900 prose-strong:font-black
                  prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded
                  prose-li:text-slate-600">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
                
                <div className="mt-20 pt-10 border-t border-slate-100 text-center">
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">Finished reading?</p>
                   <button
                    onClick={() => navigate(`/topic/${topicId}/quiz`)}
                    className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:scale-105 transition-all"
                  >
                    Challenge Yourself with a Quiz
                  </button>
                </div>
              </section>
            )}
          </article>
        )}
      </main>
    </div>
  );
};

export default TopicDetail;