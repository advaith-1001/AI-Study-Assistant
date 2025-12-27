import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Cpu, 
  BrainCircuit, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-100 font-sans">
      {/* 1. Global Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-slate-200">
              S
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">StudyFlow <span className="text-blue-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Workflow</a>
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-sm hover:bg-slate-50 transition-all">Log In</button>
            <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Get Started</button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm mb-8">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Powered by Gemini 1.5 Pro</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-10 text-slate-900">
              Master complex <br />subjects <span className="text-blue-600 italic font-serif">instantly.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload technical documents and watch our RAG engine transform raw PDFs into structured, interactive learning pathways.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={() => navigate('/register')} className="group px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all hover:-translate-y-1 flex items-center gap-3">
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* High-Fidelity Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
          className="mt-24 max-w-5xl mx-auto relative px-4"
        >
          <div className="relative bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border border-slate-800">
            <div className="bg-slate-800/50 rounded-[1.8rem] overflow-hidden border border-slate-700 aspect-[16/9] flex">
              {/* Sidebar Mockup */}
              <div className="w-1/4 border-r border-slate-700 p-6 hidden md:block">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-8 rounded-lg ${i === 1 ? 'bg-blue-600' : 'bg-slate-700/50'}`} />
                  ))}
                  <div className="pt-8 space-y-3">
                    <div className="h-2 w-12 bg-slate-600 rounded" />
                    <div className="h-2 w-full bg-slate-700 rounded" />
                    <div className="h-2 w-full bg-slate-700 rounded" />
                  </div>
                </div>
              </div>
              {/* Main Content Mockup */}
              <div className="flex-1 p-8 bg-slate-900/50">
                <div className="max-w-md space-y-6">
                  <div className="h-10 w-48 bg-slate-700 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-slate-800 rounded-2xl border border-slate-700" />
                    <div className="h-32 bg-slate-800 rounded-2xl border border-slate-700" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-800 rounded" />
                    <div className="h-3 w-5/6 bg-slate-800 rounded" />
                    <div className="h-3 w-4/6 bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Glass Card */}
            <div className="absolute -bottom-10 -right-10 hidden lg:block w-72 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-bold">Analysis Complete</span>
              </div>
              <div className="text-xs font-medium text-slate-500 leading-relaxed">
                "Quantum Mechanics.pdf" has been indexed into 12 study modules.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Features: Bento Grid */}
      <section id="features" className="py-32 px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <header className="mb-20">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Core Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Engineered for <br />Deep Understanding.</h2>
          </header>

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-white p-12 rounded-[3rem] border border-slate-200/60 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
               <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                 <Cpu className="w-7 h-7 text-blue-600" />
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-4">Semantic PDF Analysis</h3>
               <p className="text-slate-500 font-medium leading-relaxed max-w-md">Our Retrieval-Augmented Generation (RAG) engine indexes your documents, allowing for pinpoint accuracy during summarization and chat sessions.</p>
               <div className="absolute top-12 right-12 opacity-5 group-hover:opacity-10 transition-opacity">
                 <FileText className="w-48 h-48" />
               </div>
            </div>

            <div className="md:col-span-4 bg-slate-900 p-12 rounded-[3rem] text-white group hover:shadow-2xl transition-all relative">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                 <Zap className="w-7 h-7 text-blue-400" />
               </div>
               <h3 className="text-2xl font-black mb-4 leading-tight">Automated Curriculum</h3>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">Instantly break down 100+ page documents into logical, bite-sized study modules.</p>
            </div>

            <div className="md:col-span-4 bg-white p-12 rounded-[3rem] border border-slate-200/60 shadow-sm group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
                  <BrainCircuit className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Smart Quizzing</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">AI-generated assessments that test conceptual application rather than rote memorization.</p>
            </div>

            <div className="md:col-span-8 bg-blue-600 p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative group">
                <div className="flex-1 relative z-10">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-black mb-4">Contextual Chat</h3>
                    <p className="text-blue-100 font-medium leading-relaxed">A dedicated assistant that only answers based on your study materials. No hallucinations, just facts.</p>
                </div>
                {/* Chat Mockup Element */}
                <div className="w-full md:w-1/2 relative">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-3 transform group-hover:translate-y-[-10px] transition-transform">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-400 shrink-0" />
                      <div className="h-10 w-full bg-white/20 rounded-lg rounded-tl-none" />
                    </div>
                    <div className="flex flex-row-reverse gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/40 shrink-0" />
                      <div className="h-14 w-full bg-blue-500 rounded-lg rounded-tr-none flex items-center px-4 text-[10px] font-bold">
                        According to Page 14, the primary mechanism is...
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How it Works */}
      <section id="workflow" className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-24">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">The Methodology</p>
            <h2 className="text-5xl font-black tracking-tight text-slate-900">Four phases to mastery.</h2>
        </div>

        <div className="max-w-5xl mx-auto relative px-4">
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-slate-100 hidden md:block" />
          
          {[
            { step: '01', title: 'Ingestion', desc: 'Upload your lecture notes, textbooks, or research papers. Our system supports PDFs up to 200MB.' },
            { step: '02', title: 'Synthesis', desc: 'Our AI analyzes the semantic structure and creates a logical learning pathway customized for you.' },
            { step: '03', title: 'Deep Study', desc: 'Read AI-distilled summaries that capture nuanced mechanisms, equations, and examples.' },
            { step: '04', title: 'Verification', desc: 'Challenge yourself with adaptive quizzes and clarify doubts using the Context Assistant.' }
          ].map((item, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center mb-24 last:mb-0 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
               <div className={`flex-1 px-12 text-center ${i % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
               </div>
               <div className="relative z-10 w-20 h-20 rounded-[1.8rem] bg-white border-2 border-slate-100 flex items-center justify-center font-black text-xl text-slate-900 shadow-xl shadow-slate-100 my-8 md:my-0">
                  {item.step}
               </div>
               <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -ml-48 -mb-48" />
           
           <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-10 relative z-10">
             Ready to redefine how <br />you <span className="text-blue-500 italic font-serif underline underline-offset-8">understand</span> knowledge?
           </h2>
           <button onClick={() => navigate('/register')} className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 relative z-10">
             Create Your Free Pathway
           </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">S</div>
                <span className="text-sm font-black tracking-widest uppercase text-slate-400">StudyFlow AI</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">© 2025 StudyFlow. Engineered for modern scholarship.</p>
            <div className="flex gap-6">
                <a href="#" className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Privacy</a>
                <a href="#" className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Twitter</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;