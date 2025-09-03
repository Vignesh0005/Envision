import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Microscope, 
  BarChart3, 
  FileText, 
  Save,
  Play,
  Square,
  Ruler,
  Circle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const StructuralAnalysis = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [analysisType, setAnalysisType] = useState('grain_size');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisParams, setAnalysisParams] = useState({
    grain_size: {
      minGrainSize: 5,
      maxGrainSize: 200,
      detectionSensitivity: 0.5
    },
    dendritic: {
      minSpacing: 10,
      maxSpacing: 500,
      angleThreshold: 30
    },
    particles: {
      minSize: 2,
      maxSize: 100,
      shapeThreshold: 0.6
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
    if (type === 'grain_size') {
      return {
        averageGrainSize: Math.random() * 50 + 10,
        grainCount: Math.floor(Math.random() * 300) + 100,
        sizeDistribution: {
          small: Math.floor(Math.random() * 100) + 30,
          medium: Math.floor(Math.random() * 80) + 20,
          large: Math.floor(Math.random() * 50) + 10
        }
      };
    } else if (type === 'dendritic') {
      return {
        averageSpacing: Math.random() * 100 + 50,
        spacingCount: Math.floor(Math.random() * 200) + 50,
        spacingRange: {
          min: Math.random() * 30 + 10,
          max: Math.random() * 200 + 100
        }
      };
    } else {
      return {
        particleCount: Math.floor(Math.random() * 500) + 100,
        averageSize: Math.random() * 30 + 5,
        sizeDistribution: {
          small: Math.floor(Math.random() * 200) + 50,
          medium: Math.floor(Math.random() * 150) + 30,
          large: Math.floor(Math.random() * 100) + 20
        }
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Structural Analysis</h1>
          <p className="text-secondary-600">Grain size, dendritic spacing, and particle analysis</p>
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
                  value="grain_size"
                  checked={analysisType === 'grain_size'}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="text-primary-600"
                />
                <span className="text-sm font-medium">Grain Size Analysis</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="dendritic"
                  checked={analysisType === 'dendritic'}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="text-primary-600"
                />
                <span className="text-sm font-medium">Dendritic Spacing</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="particles"
                  checked={analysisType === 'particles'}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="text-primary-600"
                />
                <span className="text-sm font-medium">Particle Analysis</span>
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
              {analysisType === 'grain_size' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysisResults.averageGrainSize.toFixed(1)} μm
                    </div>
                    <div className="text-sm text-primary-700">Average Grain Size</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-600">
                      {analysisResults.grainCount}
                    </div>
                    <div className="text-sm text-secondary-700">Total Grains</div>
                  </div>
                </div>
              )}
              
              {analysisType === 'dendritic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysisResults.averageSpacing.toFixed(1)} μm
                    </div>
                    <div className="text-sm text-primary-700">Average Spacing</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-600">
                      {analysisResults.spacingCount}
                    </div>
                    <div className="text-sm text-secondary-700">Measurements</div>
                  </div>
                </div>
              )}
              
              {analysisType === 'particles' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {analysisResults.particleCount}
                    </div>
                    <div className="text-sm text-primary-700">Total Particles</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-600">
                      {analysisResults.averageSize.toFixed(1)} μm
                    </div>
                    <div className="text-sm text-secondary-700">Average Size</div>
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

export default StructuralAnalysis;
