import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pathwayAPI } from '../services/apiClient';
import usePathwayStore from '../store/pathwayStore';
import ChatSidebar from '../components/ChatSidebar';

const PathwayDetail = () => {
  const { pathwayId } = useParams();
  const navigate = useNavigate();
  const { currentPathway, setCurrentPathway, loading, setLoading, error, setError } = usePathwayStore();
  const [pathwayStatus, setPathwayStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchPathwayData();
  }, [pathwayId]);

  // Refresh status every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPathwayStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [pathwayId]);

  const fetchPathwayData = async () => {
    try {
      setLoading(true);
      setError('');
      const pathway = await pathwayAPI.getAllPathways();
      const current = pathway.find((p) => p.id === pathwayId);
      if (current) {
        setCurrentPathway(current);
      }
      await fetchPathwayStatus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch pathway');
    } finally {
      setLoading(false);
    }
  };

  const fetchPathwayStatus = async () => {
    try {
      setStatusLoading(true);
      const status = await pathwayAPI.getPathwayStatus(pathwayId);
      setPathwayStatus(status);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading pathway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsChatOpen(false)} 
        />
      )}
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {currentPathway?.name || 'Pathway'}
          </h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Progress Section */}
        {pathwayStatus && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {pathwayStatus.completion_percentage}%
                </p>
                <p className="text-gray-600">Completion</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">
                  {pathwayStatus.completed_topics_count}
                </p>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-500">
                  {pathwayStatus.pending_topics_count}
                </p>
                <p className="text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-500">
                  {pathwayStatus.total_topics}
                </p>
                <p className="text-gray-600">Total Topics</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${pathwayStatus.completion_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Topics List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Topics</h2>

          {currentPathway?.topics && currentPathway.topics.length > 0 ? (
            <div className="space-y-3">
              {currentPathway.topics
                .sort((a, b) => a.order_number - b.order_number)
                .map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/topic/${topic.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-400">
                          {topic.order_number}.
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-800">{topic.name}</h3>
                          {topic.keywords && topic.keywords.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Keywords: {topic.keywords.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        topic.status
                      )}`}
                    >
                      {topic.status}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600">No topics in this pathway</p>
          )}
        </div>

        {/* Upload PDFs Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold mb-4">Study Materials</h2>
  <p className="text-gray-600 mb-4">
    Upload PDF files to generate summaries and quizzes for your topics.
  </p>

  {/* Flex container for buttons */}
  <div className="flex gap-4">
    <button
      onClick={() => navigate(`/pathway/${pathwayId}/upload`)}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition flex-1"
    >
      Upload PDFs
    </button>
    <button
      onClick={() => setIsChatOpen(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition flex justify-center items-center gap-3 shadow-lg shadow-blue-200 flex-1"
    >
      <span className="text-lg">💬</span> Chat with Path PDFs
    </button>
  </div>
</div>

      </div>
      <ChatSidebar 
        pathwayId={pathwayId} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
};

export default PathwayDetail;
