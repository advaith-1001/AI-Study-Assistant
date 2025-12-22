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
      setError('');
      // Get all pathways to find the topic
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

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      setError('');
      const data = await topicAPI.getTopicSummary(topicId);
      setSummary(data.summary);
      setShowSummary(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      await topicAPI.markTopicComplete(topicId);
      setTopic({ ...topic, status: 'COMPLETED' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark topic complete');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Topic Details</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {topic && (
          <>
            {/* Topic Info */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-2">
                    {topic.name}
                  </h2>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      topic.status
                    )}`}
                  >
                    {topic.status}
                  </span>
                </div>
              </div>

              {topic.keywords && topic.keywords.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {topic.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6 flex gap-4">
                <button
                  onClick={fetchSummary}
                  disabled={summaryLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {summaryLoading ? 'Generating...' : 'Generate Summary'}
                </button>

                {topic.status !== 'COMPLETED' && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Mark as Completed'}
                  </button>
                )}

                <button
                  onClick={() => navigate(`/topic/${topicId}/quiz`)}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Take Quiz
                </button>
              </div>
            </div>

            {/* Summary Section */}
            {showSummary && summary && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Summary</h3>
                <div className="prose prose-sm max-w-none">
                  {/* <p className="text-gray-700 whitespace-pre-wrap">{summary}</p> */}
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TopicDetail;
