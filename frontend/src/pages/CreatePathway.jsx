import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathwayAPI } from '../services/apiClient';
import usePathwayStore from '../store/pathwayStore';

const CreatePathway = () => {
  const navigate = useNavigate();
  const { addPathway } = usePathwayStore();
  
  const [step, setStep] = useState(1); // Step 1: Basic info, Step 2: Upload PDFs
  const [pathwayName, setPathwayName] = useState('');
  const [topicsText, setTopicsText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPathwayId, setCurrentPathwayId] = useState(null);

  const topics = topicsText
    .split('\n')
    .map((t) => t.trim())
    .filter((t) => t);

  const handleCreatePathway = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pathwayName.trim()) {
      setError('Pathway name is required');
      return;
    }

    if (topics.length === 0) {
      setError('Please enter at least one topic');
      return;
    }

    try {
      setLoading(true);
      const newPathway = await pathwayAPI.createPathway(pathwayName, topics);
      setCurrentPathwayId(newPathway.id);
      addPathway(newPathway);
      setSuccess('Pathway created! Now upload your study materials.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create pathway');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 4) {
      setError('Maximum 4 PDFs allowed');
      return;
    }
    setFiles(selectedFiles);
    setError('');
  };

  const handleUploadPDFs = async (e) => {
    e.preventDefault();
    setError('');

    if (files.length === 0) {
      setError('Please select at least one PDF file');
      return;
    }

    try {
      setLoading(true);
      await pathwayAPI.uploadPDFs(currentPathwayId, files);
      setSuccess('PDFs uploaded successfully! Processing in background.');
      setTimeout(() => {
        navigate(`/pathway/${currentPathwayId}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload PDFs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create Learning Pathway</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="flex mb-8">
          <div
            className={`flex-1 text-center py-2 border-b-4 ${
              step === 1 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-600'
            }`}
          >
            <p className="font-bold">Step 1: Basic Info</p>
          </div>
          <div
            className={`flex-1 text-center py-2 border-b-4 ${
              step === 2 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-600'
            }`}
          >
            <p className="font-bold">Step 2: Upload PDFs</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleCreatePathway} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pathway Name
                </label>
                <input
                  type="text"
                  value={pathwayName}
                  onChange={(e) => setPathwayName(e.target.value)}
                  placeholder="e.g., Advanced Python Learning"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topics (one per line)
                </label>
                <textarea
                  value={topicsText}
                  onChange={(e) => setTopicsText(e.target.value)}
                  placeholder="Python Basics&#10;Functions and Modules&#10;Object-Oriented Programming&#10;Advanced Python"
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Topics entered: {topics.length}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Creating Pathway...' : 'Create Pathway'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Upload PDFs */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Upload Study Materials</h2>
            <p className="text-gray-600 mb-6">
              Upload up to 4 PDF files to support your learning pathway. The system will
              process them and generate summaries for each topic.
            </p>

            <form onSubmit={handleUploadPDFs} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg
                    className="h-12 w-12 text-gray-400 mb-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20m-24-8l8-8m0 0l8 8m-8-8v20"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-lg font-semibold text-gray-700">
                    Click to select PDF files
                  </p>
                  <p className="text-sm text-gray-600">or drag and drop</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-700">Selected Files:</p>
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        ✓ {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || files.length === 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload PDFs'}
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Skip PDF upload for now? You can add them later from the pathway page.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePathway;
