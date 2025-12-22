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

  useEffect(() => {
    fetchTopicData();
  }, [topicId]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      setError('');
      const pathways = await pathwayAPI.getAllPathways();
      let foundTopic = null;
      for (const pathway of pathways) {
        foundTopic = pathway.topics?.find((t) => t.id === parseInt(topicId));
        if (foundTopic) {
          setTopic(foundTopic);
          break;
        }
      }
      if (!foundTopic) {
        setError('Topic not found');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch topic');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      const quizData = await quizAPI.generateQuiz(
        topicId,
        difficulty,
        numQuestions
      );
      setQuiz(quizData);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowAnswers(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answer,
    });
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion?.answer;

  if (loading && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <nav className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Quiz Generator</h1>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Quiz Settings</h2>
            <p className="text-gray-600 mb-6">
              Topic: <span className="font-semibold">{topic?.name}</span>
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleGenerateQuiz();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Generating Quiz...' : 'Generate Quiz'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Quiz</h1>
          </div>
          <p className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentQuestion.question}
              </h2>

              {currentQuestion.type === 'mcq' && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        userAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={userAnswer === option}
                        onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="ml-3 text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div className="space-y-2 flex gap-4">
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition flex-1 ${
                        userAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={userAnswer === option}
                        onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="ml-3 text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'short' && (
                <input
                  type="text"
                  value={userAnswer || ''}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestionIndex, e.target.value)
                  }
                  placeholder="Type your answer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Show Answer Button */}
            {!showAnswers && userAnswer && (
              <button
                onClick={() => setShowAnswers(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition mb-4"
              >
                Show Answer & Explanation
              </button>
            )}

            {/* Answer & Explanation */}
            {showAnswers && currentQuestion && (
              <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className={`mb-4 p-3 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="font-bold">
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm mt-1">
                      Correct answer: <span className="font-bold">{currentQuestion.answer}</span>
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Explanation:</p>
                  <p className="text-gray-800">{currentQuestion.explanation}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button
                  onClick={() => {
                    const correctCount = Object.entries(userAnswers).filter(
                      ([idx, answer]) => answer === quiz.questions[idx]?.answer
                    ).length;
                    alert(
                      `Quiz Complete!\n\nYou got ${correctCount} out of ${quiz.questions.length} correct.`
                    );
                    navigate(-1);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Finish Quiz
                </button>
              ) : (
                <button
                  onClick={() => 
                    {setCurrentQuestionIndex(currentQuestionIndex + 1)
                      setShowAnswers(false);
                    }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
