import React, { useEffect, useState } from 'react';
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
      const data = await pathwayAPI.getAllPathways();
      setPathways(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch pathways');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">StudyFlow AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.username || user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Your Learning Pathways</h2>
          <button
            onClick={() => navigate('/create-pathway')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            + Create New Pathway
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading pathways...</p>
          </div>
        )}

        {!loading && pathways.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No learning pathways yet</p>
            <button
              onClick={() => navigate('/create-pathway')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Create Your First Pathway
            </button>
          </div>
        )}

        {!loading && pathways.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathways.map((pathway) => (
              <div
                key={pathway.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/pathway/${pathway.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {pathway.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Topics: {pathway.topics?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(pathway.created).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pathway/${pathway.id}`);
                    }}
                    className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                  >
                    View Pathway
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
