import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Microscope, 
  BarChart3, 
  FileText, 
  Save,
  Settings,
  Play,
  Square,
  Circle,
  Type
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const GraphiteAnalysis = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [analysisType, setAnalysisType] = useState('nodularity');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisParams, setAnalysisParams] = useState({
    nodularity: {
      minCircularity: 0.7,
      minArea: 20,
      maxArea: 10000,
      shapeFactorThreshold: 0.8
    },
    flakes: {
      minLength: 10,
      maxLength: 500,
      aspectRatioThreshold: 3.0
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            setCurrentImage({
              src: e.target.result,
              file: file,
              width: img.width,
              height: img.height,
              name: file.name
            });
            setAnalysisResults(null);
            toast.success('Image loaded successfully');
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }, []),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff', '.tif'] },
    multiple: false
  });

  const runAnalysis = async () => {
    if (!currentImage) {
      toast.error('Please load an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = generateMockResults(analysisType);
      setAnalysisResults(results);
      toast.success('Analysis completed successfully');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockResults = (type) => {
    if (type === 'nodularity') {
      return {
        nodularityPercentage: Math.random() * 30 + 70,
        noduleCount: Math.floor(Math.random() * 100) + 50,
        flakeCount: Math.floor(Math.random() * 50) + 20,
        averageNoduleSize: Math.random() * 100 + 50
      };
    } else {
      return {
        flakeCount: Math.floor(Math.random() * 200) + 100,
        typeDistribution: {
          'Type A': Math.floor(Math.random() * 40) + 20,
          'Type B': Math.floor(Math.random() * 35) + 15,
          'Type C': Math.floor(Math.random() * 30) + 10,
          'Type D': Math.floor(Math.random() * 20) + 5,
          'Type E': Math.floor(Math.random() * 15) + 3
        }
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Graphite Analysis</h1>
          <p className="text-secondary-600">Nodularity assessment and flake analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Image Upload</h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-secondary-400" />
              <p className="text-secondary-600">
                {isDragActive ? 'Drop image here' : 'Drag & drop image or click to select'}
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Type</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="nodularity"
                  checked={analysisType === 'nodularity'}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="text-primary-600"
                />
                <span className="text-sm font-medium">Nodularity Assessment</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="flakes"
                  checked={analysisType === 'flakes'}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="text-primary-600"
                />
                <span className="text-sm font-medium">Flake Analysis</span>
              </label>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Parameters</h3>
            <div className="space-y-4">
              {Object.entries(analysisParams[analysisType] || {}).map(([param, value]) => (
                <div key={param}>
                  <label className="block text-sm font-medium text-secondary-700 capitalize mb-1">
                    {param.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setAnalysisParams(prev => ({
                      ...prev,
                      [analysisType]: {
                        ...prev[analysisType],
                        [param]: parseFloat(e.target.value)
                      }
                    }))}
                    className="input-field text-sm"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Controls</h3>
            <button
              onClick={runAnalysis}
              disabled={!currentImage || isAnalyzing}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Analysis
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center - Image Display */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Image Analysis</h3>
            <div className="image-canvas">
              {currentImage ? (
                <img
                  src={currentImage.src}
                  alt="Analysis image"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-secondary-500">
                  <Microscope className="h-24 w-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No image loaded</p>
                  <p className="text-sm">Upload an image to begin analysis</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Display */}
          {analysisResults && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Results</h3>
              {analysisType === 'nodularity' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysisResults.nodularityPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-primary-700">Nodularity</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-600">
                      {analysisResults.noduleCount}
                    </div>
                    <div className="text-sm text-secondary-700">Nodules</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysisResults.flakeCount}
                    </div>
                    <div className="text-sm text-primary-700">Total Flakes</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(analysisResults.typeDistribution).map(([type, count]) => (
                      <div key={type} className="text-center p-3 bg-secondary-50 rounded-lg">
                        <div className="text-lg font-bold text-secondary-600">{count}</div>
                        <div className="text-xs text-secondary-700">{type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphiteAnalysis;
