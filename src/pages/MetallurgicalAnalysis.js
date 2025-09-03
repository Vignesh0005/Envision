import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Microscope, 
  BarChart3, 
  FileText, 
  Save,
  Settings,
  Play,
  Square,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Ruler,
  Circle,
  Square as SquareIcon,
  Type,
  ArrowRight,
  Minus,
  Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import captureManager from '../utils/captureManager';

const MetallurgicalAnalysis = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [analysisType, setAnalysisType] = useState('porosity');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [recentCaptures, setRecentCaptures] = useState([]);
  const [analysisParams, setAnalysisParams] = useState({
    porosity: {
      minArea: 10,
      maxArea: 10000,
      circularityThreshold: 0.3,
      contrastThreshold: 0.1
    },
    phases: {
      nClusters: 3,
      minArea: 50,
      smoothingFactor: 1.0
    },
    inclusions: {
      minSize: 5,
      maxSize: 500,
      shapeThreshold: 0.6,
      intensityThreshold: 0.3
    }
  });

  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);

  // Load recent captures
  useEffect(() => {
    const captures = captureManager.getCapturesByType('metallurgical');
    setRecentCaptures(captures.slice(0, 6)); // Show last 6 captures
  }, []);

  // Load capture into analysis
  const loadCapture = (capture) => {
    try {
      const newImage = {
        src: capture.imageData,
        file: null,
        width: 800, // Default width, will be updated when loaded
        height: 600, // Default height, will be updated when loaded
        name: `Capture_${new Date(capture.timestamp).toLocaleDateString()}`
      };
      
      setCurrentImage(newImage);
      setAnalysisResults(null);
      setMeasurements([]);
      toast.success('Capture loaded successfully');
    } catch (error) {
      console.error('Error loading capture:', error);
      toast.error('Failed to load capture');
    }
  };

  // Analysis types
  const analysisTypes = [
    { id: 'porosity', name: 'Porosity Analysis', icon: Circle, description: 'Analyze pore distribution and characteristics' },
    { id: 'phases', name: 'Phase Segmentation', icon: BarChart3, description: 'Identify and quantify material phases' },
    { id: 'inclusions', name: 'Inclusion Analysis', icon: Microscope, description: 'Detect and classify inclusions' }
  ];

  // Measurement tools
  const measurementTools = [
    { id: 'point', name: 'Point', icon: Circle, description: 'Single point measurement' },
    { id: 'line', name: 'Line', icon: Minus, description: 'Distance measurement' },
    { id: 'rectangle', name: 'Rectangle', icon: SquareIcon, description: 'Area and perimeter' },
    { id: 'circle', name: 'Circle', icon: Circle, description: 'Radius and area' },
    { id: 'angle', name: 'Angle', icon: ArrowRight, description: 'Three-point angle' },
    { id: 'curve', name: 'Curve', icon: RotateCw, description: 'Curve length' },
    { id: 'closed', name: 'Closed Area', icon: SquareIcon, description: 'Irregular area' }
  ];

  // File drop handling
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const newImage = {
            src: e.target.result,
            file: file,
            width: img.width,
            height: img.height,
            name: file.name
          };
          setCurrentImage(newImage);
          setAnalysisResults(null);
          setMeasurements([]);
          toast.success('Image loaded successfully');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff', '.tif']
    },
    multiple: false
  });

  // Analysis execution
  const runAnalysis = async () => {
    if (!currentImage) {
      toast.error('Please load an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate analysis (in real implementation, this would call the backend)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock results based on analysis type
      const results = generateMockResults(analysisType, currentImage);
      setAnalysisResults(results);
      toast.success(`${analysisTypes.find(t => t.id === analysisType).name} completed successfully`);
    } catch (error) {
      toast.error('Analysis failed');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate mock analysis results
  const generateMockResults = (type, image) => {
    const baseResults = {
      image: image,
      timestamp: new Date().toISOString(),
      parameters: analysisParams[type]
    };

    switch (type) {
      case 'porosity':
        return {
          ...baseResults,
          porosityPercentage: Math.random() * 5 + 0.5,
          poreCount: Math.floor(Math.random() * 50) + 10,
          poreAreas: Array.from({ length: 20 }, () => Math.random() * 100 + 5),
          averagePoreSize: Math.random() * 50 + 10,
          poreDistribution: {
            small: Math.floor(Math.random() * 20) + 5,
            medium: Math.floor(Math.random() * 15) + 3,
            large: Math.floor(Math.random() * 10) + 1
          }
        };
      
      case 'phases':
        return {
          ...baseResults,
          totalPhases: 3,
          phases: [
            { id: 1, name: 'Phase A', percentage: Math.random() * 40 + 20, color: '#FF6B6B' },
            { id: 2, name: 'Phase B', percentage: Math.random() * 40 + 20, color: '#4ECDC4' },
            { id: 3, name: 'Phase C', percentage: Math.random() * 40 + 20, color: '#45B7D1' }
          ]
        };
      
      case 'inclusions':
        return {
          ...baseResults,
          inclusionCount: Math.floor(Math.random() * 100) + 20,
          inclusionPercentage: Math.random() * 3 + 0.5,
          sizeDistribution: {
            small: Math.floor(Math.random() * 40) + 10,
            medium: Math.floor(Math.random() * 30) + 5,
            large: Math.floor(Math.random() * 20) + 2
          },
          types: {
            typeA: Math.floor(Math.random() * 30) + 5,
            typeB: Math.floor(Math.random() * 25) + 5,
            typeC: Math.floor(Math.random() * 20) + 3,
            typeD: Math.floor(Math.random() * 15) + 2
          }
        };
      
      default:
        return baseResults;
    }
  };

  // Measurement handling
  const startMeasurement = (toolType) => {
    setMeasurementMode(toolType);
    toast.info(`Click on image to start ${measurementTools.find(t => t.id === toolType).name} measurement`);
  };

  const addMeasurement = (measurement) => {
    setMeasurements(prev => [...prev, { ...measurement, id: Date.now() }]);
    setMeasurementMode(null);
  };

  const removeMeasurement = (id) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const clearMeasurements = () => {
    setMeasurements([]);
  };

  // Zoom controls
  const adjustZoom = (delta) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setZoom(newZoom);
  };

  const resetZoom = () => {
    setZoom(1);
  };

  // Export functionality
  const exportResults = (format) => {
    if (!analysisResults) {
      toast.error('No analysis results to export');
      return;
    }

    // Simulate export (in real implementation, this would generate actual files)
    toast.success(`${format.toUpperCase()} export started`);
  };

  const generateReport = () => {
    if (!analysisResults) {
      toast.error('No analysis results to report');
      return;
    }

    // Simulate report generation
    toast.success('PDF report generation started');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Metallurgical Analysis</h1>
          <p className="text-secondary-600">Advanced analysis tools for materials science</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={generateReport}
            disabled={!analysisResults}
            className="btn-outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="space-y-6">
          {/* Image Upload */}
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

          {/* Analysis Type Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Type</h3>
            <div className="space-y-3">
              {analysisTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={type.id}
                    name="analysisType"
                    value={type.id}
                    checked={analysisType === type.id}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor={type.id} className="flex items-center space-x-2 cursor-pointer">
                    <type.icon className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm font-medium text-secondary-700">{type.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Parameters */}
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

          {/* Analysis Controls */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Controls</h3>
            <div className="space-y-3">
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
              
              {analysisResults && (
                <div className="space-y-2">
                  <button
                    onClick={() => exportResults('csv')}
                    className="btn-secondary w-full text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportResults('json')}
                    className="btn-secondary w-full text-sm"
                  >
                    Export JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Image Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Display */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">Image Analysis</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className="btn-secondary text-sm"
                >
                  {showMeasurements ? 'Hide' : 'Show'} Measurements
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => adjustZoom(-0.2)}
                    className="tool-button"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-secondary-600 px-2">
                    {(zoom * 100).toFixed(0)}%
                  </span>
                  <button
                    onClick={() => adjustZoom(0.2)}
                    className="tool-button"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="tool-button"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            
            <div className="image-canvas relative overflow-hidden">
              {currentImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    ref={canvasRef}
                    src={currentImage.src}
                    alt="Analysis image"
                    className="max-w-full max-h-full object-contain cursor-crosshair"
                    style={{ transform: `scale(${zoom})` }}
                    onClick={(e) => {
                      if (measurementMode) {
                        const rect = e.target.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / zoom;
                        const y = (e.clientY - rect.top) / zoom;
                        addMeasurement({
                          type: measurementMode,
                          x,
                          y,
                          timestamp: new Date().toISOString()
                        });
                      }
                    }}
                  />
                  
                  {/* Overlay measurements */}
                  {showMeasurements && measurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="absolute bg-primary-500 text-white text-xs px-1 py-0.5 rounded cursor-pointer"
                      style={{
                        left: measurement.x * zoom,
                        top: measurement.y * zoom,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => removeMeasurement(measurement.id)}
                    >
                      {measurement.type}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-secondary-500">
                  <Microscope className="h-24 w-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No image loaded</p>
                  <p className="text-sm">Upload an image to begin analysis</p>
                </div>
              )}
            </div>

            {currentImage && (
              <div className="mt-4 text-sm text-secondary-600">
                <p>Image: {currentImage.name}</p>
                <p>Dimensions: {currentImage.width} × {currentImage.height}</p>
                <p>Analysis Type: {analysisTypes.find(t => t.id === analysisType).name}</p>
              </div>
            )}
          </div>

          {/* Measurement Tools */}
          {currentImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Measurement Tools</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {measurementTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => startMeasurement(tool.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      measurementMode === tool.id
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-secondary-200 hover:border-primary-300 text-secondary-600 hover:text-primary-500'
                    }`}
                    title={tool.description}
                  >
                    <tool.icon className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-xs font-medium">{tool.name}</span>
                  </button>
                ))}
              </div>
              
              {measurements.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-secondary-600">
                    {measurements.length} measurement(s)
                  </span>
                  <button
                    onClick={clearMeasurements}
                    className="btn-secondary text-sm"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Results */}
        <div className="space-y-6">
          {/* Analysis Results */}
          {analysisResults && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Analysis Results</h3>
              <div className="space-y-4">
                {analysisType === 'porosity' && (
                  <>
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">
                        {analysisResults.porosityPercentage.toFixed(2)}%
                      </div>
                      <div className="text-sm text-primary-700">Porosity</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Pores:</span>
                        <span className="font-medium">{analysisResults.poreCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Size:</span>
                        <span className="font-medium">{analysisResults.averagePoreSize.toFixed(1)} μm²</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-secondary-800">Size Distribution</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Small:</span>
                          <span>{analysisResults.poreDistribution.small}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Medium:</span>
                          <span>{analysisResults.poreDistribution.medium}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Large:</span>
                          <span>{analysisResults.poreDistribution.large}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {analysisType === 'phases' && (
                  <>
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">
                        {analysisResults.totalPhases}
                      </div>
                      <div className="text-sm text-primary-700">Phases Detected</div>
                    </div>
                    
                    <div className="space-y-3">
                      {analysisResults.phases.map((phase) => (
                        <div key={phase.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: phase.color }}
                            />
                            <span className="text-sm font-medium">{phase.name}</span>
                          </div>
                          <span className="text-sm text-secondary-600">
                            {phase.percentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {analysisType === 'inclusions' && (
                  <>
                    <div className="text-center p-3 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">
                        {analysisResults.inclusionCount}
                      </div>
                      <div className="text-sm text-primary-700">Inclusions</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Area %:</span>
                        <span className="font-medium">{analysisResults.inclusionPercentage.toFixed(2)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-secondary-800">Size Distribution</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Small:</span>
                          <span>{analysisResults.sizeDistribution.small}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Medium:</span>
                          <span>{analysisResults.sizeDistribution.medium}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Large:</span>
                          <span>{analysisResults.sizeDistribution.large}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setAnalysisType('porosity')}
                className="btn-secondary w-full text-sm"
              >
                <Circle className="h-4 w-4 mr-2" />
                Porosity Analysis
              </button>
              <button
                onClick={() => setAnalysisType('phases')}
                className="btn-secondary w-full text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Phase Analysis
              </button>
              <button
                onClick={() => setAnalysisType('inclusions')}
                className="btn-secondary w-full text-sm"
              >
                <Microscope className="h-4 w-4 mr-2" />
                Inclusion Analysis
              </button>
            </div>
          </div>

          {/* Recent Captures */}
          {recentCaptures.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Captures</h3>
              <div className="space-y-3">
                {recentCaptures.map((capture) => (
                  <div key={capture.id} className="flex items-center space-x-3 p-2 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
                    <img
                      src={capture.imageData}
                      alt="Recent capture"
                      className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                      onClick={() => loadCapture(capture)}
                      title="Click to load this capture"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {new Date(capture.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-secondary-600">
                        {capture.metadata.resolution} • {capture.metadata.magnification}x
                      </p>
                      {capture.metadata.notes && (
                        <p className="text-xs text-secondary-500 truncate">
                          {capture.metadata.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => loadCapture(capture)}
                      className="btn-secondary text-xs px-2 py-1"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetallurgicalAnalysis;
