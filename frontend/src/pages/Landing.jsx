import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Cpu, BrainCircuit, MessageSquare, 
  ArrowRight, CheckCircle2, Zap 
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-100 font-sans antialiased">
      
      {/* 1. Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              S
            </div>
            <span className="text-xl font-black tracking-tighter">
              StudyFlow <span className="text-blue-600">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Workflow</a>
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-sm hover:bg-slate-50 transition-colors">Log In</button>
            <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-transform active:scale-95">Get Started</button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section - Clean & Minimized */}
      <section className="relative pt-52 pb-32 px-6 overflow-hidden">
        {/* Subtle subtle background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className={`transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-6xl md:text-9xl font-black tracking-tight leading-[0.85] mb-12 text-slate-900">
              Master complex <br />subjects <span className="text-blue-600 italic font-serif">instantly.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
              Upload technical documents and watch our RAG engine transform raw PDFs into structured, interactive learning pathways.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button 
                onClick={() => navigate('/register')} 
                className="group px-12 py-6 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-600 transition-[background-color,transform] hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                Start Learning Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center gap-4 px-6 py-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Join 1,000+ Students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features: Bento Grid */}
      <section id="features" className="py-32 px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <header className="mb-20 text-center md:text-left">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Core Capabilities</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">Engineered for Understanding.</h2>
          </header>

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-white p-12 rounded-[3rem] border border-slate-200/60 shadow-sm transition-[transform,box-shadow] hover:shadow-lg hover:-translate-y-1">
               <Cpu className="w-12 h-12 text-blue-600 mb-8" />
               <h3 className="text-3xl font-black text-slate-900 mb-4">Semantic PDF Analysis</h3>
               <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md">Our Retrieval-Augmented Generation (RAG) engine indexes your documents with pinpoint accuracy.</p>
            </div>
            
            <div className="md:col-span-4 bg-slate-900 p-12 rounded-[3rem] text-white transition-transform hover:-translate-y-1 shadow-xl shadow-slate-200">
               <Zap className="w-12 h-12 text-blue-400 mb-8" />
               <h3 className="text-2xl font-black mb-4 leading-tight">Automated Curriculum</h3>
               <p className="text-slate-400 text-sm font-medium">Instantly break down 100+ page documents into bite-sized modules.</p>
            </div>

            <div className="md:col-span-4 bg-white p-12 rounded-[3rem] border border-slate-200/60 shadow-sm transition-transform hover:-translate-y-1">
                <BrainCircuit className="w-12 h-12 text-emerald-600 mb-8" />
                <h3 className="text-2xl font-black text-slate-900 mb-4">Smart Quizzing</h3>
                <p className="text-slate-500 text-sm font-medium">Assessments that test conceptual application rather than rote memorization.</p>
            </div>

            <div className="md:col-span-8 bg-blue-600 p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden transition-transform hover:-translate-y-1">
                <div className="flex-1">
                    <MessageSquare className="w-12 h-12 text-white mb-8" />
                    <h3 className="text-3xl font-black mb-4">Contextual Chat</h3>
                    <p className="text-blue-100 text-lg font-medium">A dedicated assistant that only answers based on your study materials.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Workflow */}
      <section id="workflow" className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-24">
            <h2 className="text-5xl font-black tracking-tight text-slate-900">Four phases to mastery.</h2>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden md:block" />
          {[
            { step: '01', title: 'Ingestion', desc: 'Upload technical papers or textbooks (PDF).' },
            { step: '02', title: 'Synthesis', desc: 'AI analyzes and creates your logical learning pathway.' },
            { step: '03', title: 'Deep Study', desc: 'Read AI-distilled summaries and key mechanisms.' },
            { step: '04', title: 'Verification', desc: 'Test yourself with adaptive context quizzes.' }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center mb-20 last:mb-0 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
               <div className={`flex-1 px-8 text-center ${i % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 font-medium">{item.desc}</p>
               </div>
               <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-900 shadow-sm my-6 md:my-0">
                  {item.step}
               </div>
               <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">S</div>
                <span className="text-sm font-black tracking-widest uppercase text-slate-900">StudyFlow AI</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2025 StudyFlow. Engineered for modern scholarship.</p>
            <div className="flex gap-8">
              <a href="#" className="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Privacy</a>
              <a href="#" className="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Twitter</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;