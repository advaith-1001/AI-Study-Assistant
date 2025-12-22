import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, topicAPI, pathwayAPI } from '../services/apiClient';

const Quiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showDetailedReview, setShowDetailedReview] = useState(false); // NEW: Toggle for review

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
          break;
        }
      }
      if (!foundTopic) setError('Topic not found');
    } catch (err) {
      setError('Failed to sync topic data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      const quizData = await quizAPI.generateQuiz(topicId, difficulty, numQuestions);
      setQuiz(quizData);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowAnswers(false);
      setQuizFinished(false);
      setShowDetailedReview(false);
    } catch (err) {
      setError('AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer });
  };

  const calculateScore = () => {
    return Object.entries(userAnswers).filter(
      ([idx, answer]) => answer === quiz.questions[idx]?.answer
    ).length;
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion?.answer;

  if (loading && !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Assessment...</p>
      </div>
    );
  }

  // 1. SETUP VIEW (Settings)
  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
        <nav className="h-16 border-b border-slate-100 bg-white flex items-center px-6">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
            ← Exit
          </button>
        </nav>

        <main className="max-w-xl mx-auto px-6 py-20">
          <header className="text-center mb-12">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Knowledge Check</p>
            <h1 className="text-4xl font-black tracking-tight mb-4">{topic?.name}</h1>
            <p className="text-slate-500 font-medium">Configure your AI-generated quiz parameters.</p>
          </header>

          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm">
            <form onSubmit={(e) => { e.preventDefault(); handleGenerateQuiz(); }} className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-3 rounded-xl font-bold text-sm capitalize transition-all border ${
                        difficulty === level ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Questions Count</label>
                <input
                  type="range" min="1" max="15" value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-4 text-xs font-black text-slate-900">
                  <span>1</span>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">Target: {numQuestions}</span>
                  <span>15</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                Begin Assessment →
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  // 2. RESULTS & REVIEW VIEW
  if (quizFinished) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Main Score Card */}
          <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl text-center mb-12">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
               <span className="text-3xl font-black text-blue-600">{percentage}%</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Quiz Complete</h2>
            <p className="text-slate-500 font-medium mb-10">You correctly identified {score} out of {quiz.questions.length} concepts.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate(-1)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Return to Pathway
              </button>
              <button 
                onClick={() => setShowDetailedReview(!showDetailedReview)} 
                className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all"
              >
                {showDetailedReview ? 'Hide Review' : 'Detailed Review'}
              </button>
              <button onClick={() => setQuiz(null)} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors">
                Retake
              </button>
            </div>
          </div>

          {/* Detailed Review Section */}
          {showDetailedReview && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">In-Depth Analysis</h3>
              {quiz.questions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.answer;
                return (
                  <div key={idx} className={`bg-white rounded-[2rem] p-8 border ${isCorrect ? 'border-emerald-100' : 'border-rose-100'} shadow-sm`}>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Question {idx + 1}</span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isCorrect ? 'Mastered' : 'Mismatch'}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-black text-slate-900 mb-6 leading-tight">{q.question}</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Selection</p>
                        <p className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{userAnswers[idx] || 'No answer'}</p>
                      </div>
                      {!isCorrect && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Correct Identity</p>
                          <p className="font-bold text-emerald-700">{q.answer}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Context</p>
                       <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                         "{q.explanation}"
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. ACTIVE QUIZ VIEW
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
          <button onClick={() => setQuiz(null)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-600 transition-all duration-500" 
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                />
            </div>
            <span className="text-xs font-black text-slate-900 uppercase">
              {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {currentQuestion && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-black leading-tight text-slate-900 mb-12">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4 mb-12">
              {(currentQuestion.type === 'mcq' ? currentQuestion.options : ['True', 'False']).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerChange(currentQuestionIndex, option)}
                  className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center justify-between group ${
                    userAnswer === option 
                    ? 'border-blue-600 bg-blue-50/30' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <span className={`font-bold ${userAnswer === option ? 'text-blue-600' : 'text-slate-600'}`}>
                    {option}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    userAnswer === option ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 group-hover:border-slate-200'
                  }`}>
                    {userAnswer === option && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                  </div>
                </button>
              ))}
              
              {currentQuestion.type === 'short' && (
                <input
                  type="text"
                  value={userAnswer || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-6 bg-white border-2 border-slate-100 rounded-[1.5rem] text-lg font-bold focus:border-blue-600 outline-none transition-all"
                />
              )}
            </div>

            {/* Footer Navigation */}
            <footer className="flex items-center gap-4 mt-12">
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
                className="px-8 py-4 text-slate-400 font-bold disabled:opacity-0 transition-opacity"
              >
                ← Prev
              </button>
              
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button
                  onClick={() => setQuizFinished(true)}
                  className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  Finalize Result
                </button>
              ) : (
                <button
                  onClick={() => { setCurrentQuestionIndex(prev => prev + 1); setShowAnswers(false); }}
                  disabled={!userAnswer}
                  className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  Next Step →
                </button>
              )}
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default Quiz;