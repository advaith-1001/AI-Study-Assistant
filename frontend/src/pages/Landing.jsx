import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-xl font-bold tracking-tight">StudyFlow AI</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="px-4 py-2 font-medium hover:text-blue-600 transition">Login</button>
          <button onClick={() => navigate('/register')} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8">
              Your PDFs, <br />
              <span className="text-blue-600">Perfectly</span> Structured.
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
              Upload your syllabus and study materials. We generate a step-by-step pathway with quizzes and you can chat with your documents using AI.
            </p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                Create Free Account
              </button>
            </div>
          </motion.div>

          {/* Visual Placeholder: This represents your App UI preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative bg-slate-100 rounded-3xl p-4 border border-slate-200 aspect-video shadow-2xl"
          >
            <div className="w-full h-full bg-white rounded-2xl border border-slate-200 flex items-center justify-center">
               <div className="relative w-full h-full bg-white p-4 overflow-hidden">
  {/* Main Dashboard Layout */}
  <div className="grid grid-cols-12 gap-4 h-full">
    {/* Sidebar */}
    <div className="col-span-3 space-y-4 pt-4 border-r border-slate-50 pr-4">
      <div className="h-3 w-full bg-slate-100 rounded-full" />
      <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
      <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
    </div>
    
    {/* Content Area */}
    <div className="col-span-9 pt-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-8 w-8 bg-blue-100 rounded-full" />
      </div>
      
      {/* Topic Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="h-3 w-1/2 bg-blue-200 rounded-full mb-3" />
            <div className="h-2 w-full bg-slate-200 rounded-full mb-1" />
            <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
      
      {/* Chat Preview Overlay */}
      <div className="absolute bottom-6 right-6 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 transform rotate-[-2deg]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <div className="h-2 w-20 bg-slate-200 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-100 rounded-full" />
          <div className="h-2 w-5/6 bg-blue-50 rounded-full" />
        </div>
      </div>
    </div>
  </div>
</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;