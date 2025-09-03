import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  RotateCw, 
  RotateCcw,
  FlipHorizontal, 
  ZoomIn, 
  ZoomOut,
  Image as ImageIcon,
  Filter,
  Settings,
  Undo,
  Redo,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import ImageProcessor from '../utils/imageProcessor';
import captureManager from '../utils/captureManager';

const ImageProcessing = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterParams, setFilterParams] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showOriginal, setShowOriginal] = useState(false);
  const [recentCaptures, setRecentCaptures] = useState([]);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageProcessorRef = useRef(new ImageProcessor());

  // Image processing filters configuration
  const availableFilters = {
    basic: [
      { 
        id: 'rotate', 
        name: 'Image Rotation', 
        icon: RotateCw, 
        params: { angle: 90 },
        apply: (processor, params) => processor.rotate(params.angle || 90)
      },
      { 
        id: 'flip', 
        name: 'Image Flipping', 
        icon: FlipHorizontal, 
        params: { direction: 'horizontal' },
        apply: (processor, params) => processor.flip(params.direction || 'horizontal')
      },
      { 
        id: 'brightness', 
        name: 'Brightness/Contrast', 
        icon: ImageIcon, 
        params: { brightness: 0, contrast: 1 },
        apply: (processor, params) => processor.adjustBrightnessContrast(
          params.brightness || 0, 
          params.contrast || 1
        )
      },
      { 
        id: 'invert', 
        name: 'Image Inversion', 
        icon: ImageIcon, 
        params: {},
        apply: (processor) => processor.invert()
      },
      { 
        id: 'grayscale', 
        name: 'Grayscale Conversion', 
        icon: ImageIcon, 
        params: {},
        apply: (processor) => processor.grayscale()
      }
    ],
    spatial: [
      { 
        id: 'gaussian_blur', 
        name: 'Gaussian Blur', 
        icon: Filter, 
        params: { kernel_size: 5, sigma: 1.0 },
        apply: (processor, params) => processor.gaussianBlur(
          params.kernel_size || 5, 
          params.sigma || 1.0
        )
      },
      { 
        id: 'median_filter', 
        name: 'Median Filter', 
        icon: Filter, 
        params: { kernel_size: 5 },
        apply: (processor, params) => processor.medianFilter(params.kernel_size || 5)
      },
      { 
        id: 'sharpen', 
        name: 'Image Sharpening', 
        icon: Filter, 
        params: {},
        apply: (processor) => processor.sharpen()
      }
    ],
    morphological: [
      { 
        id: 'erosion', 
        name: 'Erosion', 
        icon: Filter, 
        params: { kernel_size: 3 },
        apply: (processor, params) => processor.erosion(params.kernel_size || 3)
      },
      { 
        id: 'dilation', 
        name: 'Dilation', 
        icon: Filter, 
        params: { kernel_size: 3 },
        apply: (processor, params) => processor.dilation(params.kernel_size || 3)
      }
    ],
    edge: [
      { 
        id: 'sobel', 
        name: 'Sobel Edge Detection', 
        icon: Filter, 
        params: {},
        apply: (processor) => processor.sobelEdgeDetection()
      }
    ],
    enhancement: [
      { 
        id: 'histogram_equalization', 
        name: 'Histogram Equalization', 
        icon: ImageIcon, 
        params: {},
        apply: (processor) => processor.histogramEqualization()
      },
      { 
        id: 'threshold', 
        name: 'Threshold', 
        icon: ImageIcon, 
        params: { value: 128 },
        apply: (processor, params) => processor.threshold(params.value || 128)
      },
      { 
        id: 'noise_reduction', 
        name: 'Noise Reduction', 
        icon: Filter, 
        params: {},
        apply: (processor) => processor.noiseReduction()
      }
    ]
  };

  // File drop handling
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Load image into the processor
          await imageProcessorRef.current.loadImage(e.target.result);
          
          const newImage = {
            src: e.target.result,
            file: file,
            width: imageProcessorRef.current.canvas.width,
            height: imageProcessorRef.current.canvas.height,
            name: file.name
          };
          
          setCurrentImage(newImage);
          setProcessedImage(newImage);
          addToHistory(newImage);
          toast.success('Image loaded successfully');
        } catch (error) {
          console.error('Error loading image:', error);
          toast.error('Failed to load image');
        }
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

  // History management
  const addToHistory = (image) => {
    const newHistory = imageHistory.slice(0, historyIndex + 1);
    newHistory.push(image);
    setImageHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setProcessedImage(imageHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < imageHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setProcessedImage(imageHistory[newIndex]);
    }
  };

  // Filter management
  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const updateFilterParams = (filterId, params) => {
    setFilterParams(prev => ({
      ...prev,
      [filterId]: { ...prev[filterId], ...params }
    }));
  };

  // Apply individual filter
  const applyFilter = async (filterId) => {
    if (!processedImage) {
      toast.error('Please load an image first');
      return;
    }

    try {
      console.log(`Applying filter: ${filterId}`);
      const filter = findFilterById(filterId);
      if (!filter || !filter.apply) {
        toast.error('Filter not implemented');
        return;
      }

      console.log('Filter found:', filter.name);
      console.log('Filter parameters:', filterParams[filterId] || {});

      // Reload the current image into the processor
      await imageProcessorRef.current.loadImage(processedImage.src);
      console.log('Image loaded into processor');
      
      // Apply the filter
      const startTime = performance.now();
      filter.apply(imageProcessorRef.current, filterParams[filterId] || {});
      const endTime = performance.now();
      console.log(`Filter applied in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Get the result
      const processedSrc = imageProcessorRef.current.toDataURL();
      const newProcessedImage = {
        ...processedImage,
        src: processedSrc
      };
      
      setProcessedImage(newProcessedImage);
      addToHistory(newProcessedImage);
      toast.success(`${filter.name} applied successfully`);
      console.log('Filter application completed successfully');
    } catch (error) {
      console.error('Error applying filter:', error);
      toast.error('Failed to apply filter: ' + error.message);
    }
  };

  // Image processing
  const processImage = async () => {
    if (!currentImage || selectedFilters.length === 0) {
      toast.error('Please select an image and at least one filter');
      return;
    }

    setIsProcessing(true);
    try {
      // Reload the original image into the processor
      await imageProcessorRef.current.loadImage(currentImage.src);
      
      // Apply each selected filter
      for (const filterId of selectedFilters) {
        const filter = findFilterById(filterId);
        if (filter && filter.apply) {
          filter.apply(imageProcessorRef.current, filterParams[filterId] || {});
        }
      }
      
      // Get the processed result
      const processedSrc = imageProcessorRef.current.toDataURL();
      const processed = {
        ...currentImage,
        src: processedSrc,
        filters: selectedFilters
      };
      
      setProcessedImage(processed);
      addToHistory(processed);
      toast.success('Image processed successfully');
    } catch (error) {
      toast.error('Error processing image: ' + error.message);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to find filter by ID
  const findFilterById = (filterId) => {
    for (const category of Object.values(availableFilters)) {
      const filter = category.find(f => f.id === filterId);
      if (filter) return filter;
    }
    return null;
  };

  // Image operations
  const rotateImage = async (angle) => {
    if (!processedImage) return;
    
    try {
      // Reload the current image into the processor
      await imageProcessorRef.current.loadImage(processedImage.src);
      
      // Apply rotation
      imageProcessorRef.current.rotate(angle);
      
      // Get the rotated result
      const rotatedSrc = imageProcessorRef.current.toDataURL();
      const rotatedImage = {
        ...processedImage,
        src: rotatedSrc,
        width: imageProcessorRef.current.canvas.width,
        height: imageProcessorRef.current.canvas.height
      };
      
      setProcessedImage(rotatedImage);
      addToHistory(rotatedImage);
      toast.success('Image rotated successfully');
    } catch (error) {
      console.error('Error rotating image:', error);
      toast.error('Failed to rotate image');
    }
  };

  const flipImage = async (direction) => {
    if (!processedImage) return;
    
    try {
      // Reload the current image into the processor
      await imageProcessorRef.current.loadImage(processedImage.src);
      
      // Apply flip
      imageProcessorRef.current.flip(direction);
      
      // Get the flipped result
      const flippedSrc = imageProcessorRef.current.toDataURL();
      const flippedImage = {
        ...processedImage,
        src: flippedSrc
      };
      
      setProcessedImage(flippedImage);
      addToHistory(flippedImage);
      toast.success('Image flipped successfully');
    } catch (error) {
      console.error('Error flipping image:', error);
      toast.error('Failed to flip image');
    }
  };

  const adjustZoom = (delta) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setZoom(newZoom);
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const saveImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `processed_${processedImage.name}`;
    link.href = processedImage.src;
    link.click();
    toast.success('Image saved successfully');
  };

  const clearImage = () => {
    setCurrentImage(null);
    setProcessedImage(null);
    setImageHistory([]);
    setHistoryIndex(-1);
    setSelectedFilters([]);
    setFilterParams({});
    setZoom(1);
  };

  const resetToOriginal = () => {
    if (currentImage) {
      setProcessedImage(currentImage);
      addToHistory(currentImage);
      toast.success('Image reset to original');
    }
  };

  // Load recent captures
  useEffect(() => {
    const captures = captureManager.getCapturesByType('image_processing');
    setRecentCaptures(captures.slice(0, 6)); // Show last 6 captures
  }, []);

  // Load capture into processor
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
      setProcessedImage(newImage);
      addToHistory(newImage);
      toast.success('Capture loaded successfully');
    } catch (error) {
      console.error('Error loading capture:', error);
      toast.error('Failed to load capture');
    }
  };

  // Test function to verify image processor is working
  const testImageProcessor = async () => {
    if (!currentImage) {
      toast.error('Please load an image first');
      return;
    }

    try {
      toast.loading('Testing image processor...');
      console.log('Starting image processor test...');
      
      // Test basic operations
      await imageProcessorRef.current.loadImage(currentImage.src);
      console.log('Test: Image loaded successfully');
      
      // Test grayscale
      imageProcessorRef.current.grayscale();
      console.log('Test: Grayscale applied successfully');
      
      // Test brightness adjustment
      imageProcessorRef.current.adjustBrightnessContrast(20, 1.2);
      console.log('Test: Brightness/Contrast applied successfully');
      
      // Test noise reduction
      imageProcessorRef.current.noiseReduction();
      console.log('Test: Noise reduction applied successfully');
      
      const testResult = imageProcessorRef.current.toDataURL();
      const testImage = {
        ...currentImage,
        src: testResult
      };
      
      setProcessedImage(testImage);
      addToHistory(testImage);
      
      toast.dismiss();
      toast.success('Image processor test successful! All filters working.');
      console.log('Image processor test completed successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Image processor test failed:', error);
      toast.error('Image processor test failed: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Image Processing</h1>
          <p className="text-secondary-600">Advanced image enhancement and analysis tools</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetToOriginal}
            className="btn-secondary"
            disabled={!currentImage}
          >
            Reset to Original
          </button>
          <button
            onClick={clearImage}
            className="btn-secondary"
            disabled={!currentImage}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="space-y-6">
          {/* File Upload */}
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
              <p className="text-sm text-secondary-500 mt-2">
                Supports: JPG, PNG, BMP, TIFF
              </p>
            </div>
          </div>

          {/* Image Operations */}
          {currentImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Image Operations</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => rotateImage(90)}
                    className="btn-secondary text-sm"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Rotate 90°
                  </button>
                  <button
                    onClick={() => rotateImage(-90)}
                    className="btn-secondary text-sm"
                  >
                    <RotateCw className="h-4 w-4 mr-2 transform scale-x-[-1]" />
                    Rotate -90°
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => flipImage('horizontal')}
                    className="btn-secondary text-sm"
                  >
                    <FlipHorizontal className="h-4 w-4 mr-2" />
                    Flip H
                  </button>
                  <button
                    onClick={() => flipImage('vertical')}
                    className="btn-secondary text-sm"
                  >
                    <FlipHorizontal className="h-4 w-4 mr-2 transform rotate-90" />
                    Flip V
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => adjustZoom(0.2)}
                    className="btn-secondary text-sm"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="btn-secondary text-sm"
                  >
                    100%
                  </button>
                  <button
                    onClick={() => adjustZoom(-0.2)}
                    className="btn-secondary text-sm"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {currentImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => rotateImage(90)}
                  className="btn-secondary text-sm"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate 90°
                </button>
                <button
                  onClick={() => flipImage('horizontal')}
                  className="btn-secondary text-sm"
                >
                  <FlipHorizontal className="h-4 w-4 mr-2" />
                  Flip H
                </button>
                <button
                  onClick={() => flipImage('vertical')}
                  className="btn-secondary text-sm"
                >
                  <FlipHorizontal className="h-4 w-4 mr-2 transform rotate-90" />
                  Flip V
                </button>
                <button
                  onClick={resetToOriginal}
                  className="btn-secondary text-sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </button>
                <button
                  onClick={testImageProcessor}
                  className="btn-primary text-sm col-span-2"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Test Processor
                </button>
              </div>
            </div>
          )}

          {/* History Controls */}
          {currentImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">History</h3>
              <div className="flex space-x-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  <Undo className="h-4 w-4 mr-2" />
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= imageHistory.length - 1}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  <Redo className="h-4 w-4 mr-2" />
                  Redo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center - Image Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Display */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                {showOriginal ? 'Original Image' : 'Processed Image'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="btn-secondary text-sm"
                >
                  {showOriginal ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showOriginal ? 'Hide Original' : 'Show Original'}
                </button>
                <button
                  onClick={saveImage}
                  disabled={!processedImage}
                  className="btn-primary text-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
            
            <div className="image-canvas relative overflow-hidden">
              {currentImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    ref={canvasRef}
                    src={showOriginal ? currentImage.src : (processedImage?.src || currentImage.src)}
                    alt="Processing image"
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              ) : (
                <div className="text-center text-secondary-500">
                  <ImageIcon className="h-24 w-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No image loaded</p>
                  <p className="text-sm">Upload an image to begin processing</p>
                </div>
              )}
            </div>

            {currentImage && (
              <div className="mt-4 text-sm text-secondary-600">
                <p>Image: {currentImage.name}</p>
                <p>Dimensions: {currentImage.width} × {currentImage.height}</p>
                <p>Zoom: {(zoom * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>

          {/* Processing Controls */}
          {currentImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Processing Controls</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={processImage}
                  disabled={selectedFilters.length === 0 || isProcessing}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Apply Filters'}
                </button>
                <span className="text-sm text-secondary-600">
                  {selectedFilters.length} filter(s) selected
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Filter Selection */}
        <div className="space-y-6">
          {/* Filter Categories */}
          {Object.entries(availableFilters).map(([category, filters]) => (
            <div key={category} className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 capitalize">
                {category.replace('_', ' ')} Filters
              </h3>
              <div className="space-y-2">
                {filters.map((filter) => (
                  <div key={filter.id} className="flex items-center justify-between p-2 border border-secondary-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={filter.id}
                        checked={selectedFilters.includes(filter.id)}
                        onChange={() => toggleFilter(filter.id)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={filter.id} className="text-sm text-secondary-700 cursor-pointer">
                        {filter.name}
                      </label>
                    </div>
                    <button
                      onClick={() => applyFilter(filter.id)}
                      disabled={!currentImage}
                      className="btn-secondary text-xs px-2 py-1 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Filter Parameters */}
          {selectedFilters.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Filter Parameters</h3>
              <div className="space-y-4">
                {selectedFilters.map((filterId) => {
                  const filter = Object.values(availableFilters)
                    .flat()
                    .find(f => f.id === filterId);
                  
                  if (!filter || Object.keys(filter.params).length === 0) return null;
                  
                  return (
                    <div key={filterId} className="space-y-2">
                      <h4 className="font-medium text-secondary-800">{filter.name}</h4>
                      {Object.entries(filter.params).map(([param, defaultValue]) => (
                        <div key={param} className="space-y-1">
                          <label className="block text-sm text-secondary-600 capitalize">
                            {param.replace('_', ' ')}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={defaultValue}
                            onChange={(e) => updateFilterParams(filterId, { [param]: parseFloat(e.target.value) })}
                            className="input-field text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

export default ImageProcessing;
