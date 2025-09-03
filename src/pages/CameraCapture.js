import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  Camera, 
  CameraOff, 
  Download, 
  Settings, 
  RotateCcw, 
  Maximize2,
  Ruler,
  Save,
  Play,
  Pause,
  Square,
  Clock,
  Image as ImageIcon,
  Trash2,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import captureManager from '../utils/captureManager';

const CameraCapture = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraSettings, setCameraSettings] = useState({
    resolution: '1920x1080',
    frameRate: 30,
    exposure: 'auto',
    gain: 'auto',
    whiteBalance: 'auto'
  });
  const [calibration, setCalibration] = useState({
    pixelSize: 0.1, // microns per pixel
    magnification: 100,
    calibrated: false
  });
  const [activeTab, setActiveTab] = useState('capture');
  const [captures, setCaptures] = useState([]);
  const [captureNotes, setCaptureNotes] = useState('');
  const [captureTags, setCaptureTags] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('general');

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      // First check if we have permission to access media devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        toast.error('Media devices not supported in this browser');
        return;
      }

      // Request camera permission first
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (permissionError) {
        console.log('Camera permission not granted yet:', permissionError);
        // Continue anyway to see if we can enumerate devices
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Found video devices:', videoDevices);
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
        toast.success(`Found ${videoDevices.length} camera(s)`);
      } else {
        toast.warning('No cameras detected. Check camera connections and permissions.');
      }
    } catch (error) {
      console.error('Error getting cameras:', error);
      toast.error('Failed to get camera list: ' + error.message);
    }
  }, []);

  // Request camera permissions explicitly
  const requestCameraPermission = useCallback(async () => {
    try {
      toast.loading('Requesting camera permission...');
      await navigator.mediaDevices.getUserMedia({ video: true });
      toast.dismiss();
      toast.success('Camera permission granted!');
      // Now try to get cameras
      getCameras();
    } catch (error) {
      toast.dismiss();
      console.error('Camera permission denied:', error);
      toast.error('Camera permission denied. Please allow camera access and try again.');
    }
  }, [getCameras]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (!selectedCamera) {
        toast.error('Please select a camera first');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera,
          width: { ideal: parseInt(cameraSettings.resolution.split('x')[0]) },
          height: { ideal: parseInt(cameraSettings.resolution.split('x')[1]) },
          frameRate: { ideal: cameraSettings.frameRate }
        }
      });

      setIsCameraOn(true);
      toast.success('Camera started successfully');
    } catch (error) {
      console.error('Error starting camera:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please grant camera access and try again.');
      } else if (error.name === 'NotFoundError') {
        toast.error('Selected camera not found. Please refresh the camera list.');
      } else {
        toast.error('Failed to start camera: ' + error.message);
      }
    }
  }, [selectedCamera, cameraSettings]);

  // Stop camera
  const stopCamera = useCallback(() => {
    setIsCameraOn(false);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    toast.success('Camera stopped');
  }, []);

  // Capture image
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      
      // Save capture with metadata
      const capture = captureManager.addCapture(imageSrc, {
        resolution: cameraSettings.resolution,
        magnification: calibration.magnification,
        camera: selectedCamera,
        notes: captureNotes,
        tags: captureTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        analysisType: selectedAnalysisType
      });
      
      // Update captures list
      setCaptures(captureManager.getCaptures());
      
      // Clear form
      setCaptureNotes('');
      setCaptureTags('');
      
      toast.success('Image captured and saved successfully');
    }
  }, [webcamRef, cameraSettings, calibration, selectedCamera, captureNotes, captureTags, selectedAnalysisType]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!isCameraOn) {
      toast.error('Camera must be on to record');
      return;
    }

    try {
      const stream = webcamRef.current?.video?.srcObject;
      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `microscopy_recording_${new Date().toISOString()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast.success('Recording started');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [isCameraOn]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  }, []);

  // Save captured image
  const saveImage = useCallback(() => {
    if (capturedImage) {
      const a = document.createElement('a');
      a.href = capturedImage;
      a.download = `microscopy_capture_${new Date().toISOString()}.png`;
      a.click();
      toast.success('Image saved successfully');
    }
  }, [capturedImage]);

  // Delete capture
  const deleteCapture = useCallback((captureId) => {
    if (captureManager.deleteCapture(captureId)) {
      setCaptures(captureManager.getCaptures());
      toast.success('Capture deleted successfully');
    }
  }, []);

  // Clear all captures
  const clearAllCaptures = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all captures? This action cannot be undone.')) {
      captureManager.clearAllCaptures();
      setCaptures([]);
      toast.success('All captures cleared');
    }
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Calibration functions
  const calibratePixelSize = useCallback((knownDistance) => {
    // This would integrate with the measurement tools
    const newPixelSize = knownDistance / 100; // Placeholder calculation
    setCalibration(prev => ({
      ...prev,
      pixelSize: newPixelSize,
      calibrated: true
    }));
    toast.success('Calibration completed');
  }, []);

  useEffect(() => {
    // Auto-detect cameras when component mounts
    getCameras();
    // Load existing captures
    setCaptures(captureManager.getCaptures());
  }, [getCameras]);

  const videoConstraints = {
    deviceId: selectedCamera,
    width: { ideal: parseInt(cameraSettings.resolution.split('x')[0]) },
    height: { ideal: parseInt(cameraSettings.resolution.split('x')[1]) },
    frameRate: { ideal: cameraSettings.frameRate }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Camera Capture</h1>
          <p className="text-secondary-600">Real-time microscopy image acquisition and recording</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`status-indicator ${isCameraOn ? 'status-success' : 'status-error'}`}>
            {isCameraOn ? 'Camera Active' : 'Camera Inactive'}
          </span>
        </div>
      </div>

      {/* Camera Detection Help */}
      {availableCameras.length === 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">Camera Detection Required</h3>
              <p className="text-sm text-blue-700 mt-1">
                Click "Detect Cameras" in the Camera Settings panel to find available camera devices. 
                Make sure your camera is connected and you've granted camera permissions to this application.
              </p>
              <div className="mt-3">
                <button
                  onClick={requestCameraPermission}
                  className="btn-primary text-sm px-3 py-1"
                >
                  Grant Camera Permission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex space-x-1 border-b border-secondary-200">
          <button
            onClick={() => setActiveTab('capture')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'capture'
                ? 'bg-primary-500 text-white'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
            }`}
          >
            <Camera className="h-4 w-4 inline mr-2" />
            Live Capture
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Capture History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Controls */}
        <div className="space-y-6">
          {/* Camera Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">Camera Settings</h3>
              <button
                onClick={getCameras}
                className="btn-secondary text-sm px-3 py-1"
              >
                Detect Cameras
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-secondary-700">
                    Camera Device
                  </label>
                  <button
                    onClick={getCameras}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Refresh
                  </button>
                </div>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="input-field"
                  disabled={availableCameras.length === 0}
                >
                  {availableCameras.length === 0 ? (
                    <option value="">No cameras found</option>
                  ) : (
                    <>
                      <option value="">Select a camera</option>
                      {availableCameras.map((camera, index) => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                          {camera.label || `Camera ${index + 1} (${camera.deviceId.slice(0, 8)}...)`}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {availableCameras.length === 0 && (
                  <p className="text-sm text-secondary-500 mt-1">
                    Click "Refresh" to detect cameras or check camera permissions
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Resolution
                </label>
                <select
                  value={cameraSettings.resolution}
                  onChange={(e) => setCameraSettings(prev => ({ ...prev, resolution: e.target.value }))}
                  className="input-field"
                >
                  <option value="640x480">640x480</option>
                  <option value="1280x720">1280x720</option>
                  <option value="1920x1080">1920x1080</option>
                  <option value="3840x2160">3840x2160</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Frame Rate
                </label>
                <select
                  value={cameraSettings.frameRate}
                  onChange={(e) => setCameraSettings(prev => ({ ...prev, frameRate: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  <option value={15}>15 fps</option>
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Camera Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={isCameraOn ? stopCamera : startCamera}
                className={`btn-primary flex items-center justify-center space-x-2 ${
                  isCameraOn ? 'bg-error-500 hover:bg-error-600' : ''
                }`}
              >
                {isCameraOn ? (
                  <>
                    <CameraOff className="h-5 w-5" />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span>Start Camera</span>
                  </>
                )}
              </button>

              <button
                onClick={captureImage}
                disabled={!isCameraOn}
                className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-5 w-5" />
                <span>Capture</span>
              </button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isCameraOn}
                className={`btn-outline flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording ? 'border-error-500 text-error-500 hover:bg-error-500 hover:text-white' : ''
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Record</span>
                  </>
                )}
              </button>

              <button
                onClick={saveImage}
                disabled={!capturedImage}
                className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Capture Metadata */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Capture Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Analysis Type
                </label>
                <select
                  value={selectedAnalysisType}
                  onChange={(e) => setSelectedAnalysisType(e.target.value)}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="metallurgical">Metallurgical Analysis</option>
                  <option value="graphite">Graphite Analysis</option>
                  <option value="structural">Structural Analysis</option>
                  <option value="image_processing">Image Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={captureNotes}
                  onChange={(e) => setCaptureNotes(e.target.value)}
                  placeholder="Add notes about this capture..."
                  className="input-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={captureTags}
                  onChange={(e) => setCaptureTags(e.target.value)}
                  placeholder="Enter tags separated by commas..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Calibration */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Calibration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Pixel Size (μm)
                </label>
                <input
                  type="number"
                  value={calibration.pixelSize}
                  onChange={(e) => setCalibration(prev => ({ ...prev, pixelSize: parseFloat(e.target.value) }))}
                  step="0.01"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Magnification
                </label>
                <input
                  type="number"
                  value={calibration.magnification}
                  onChange={(e) => setCalibration(prev => ({ ...prev, magnification: parseInt(e.target.value) }))}
                  className="input-field"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className={`status-indicator ${calibration.calibrated ? 'status-success' : 'status-warning'}`}>
                  {calibration.calibrated ? 'Calibrated' : 'Not Calibrated'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Camera View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Camera */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Live Camera Feed</h3>
            <div className="image-canvas">
              {isCameraOn ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-contain rounded-lg"
                  screenshotFormat="image/png"
                />
              ) : (
                <div className="text-center text-secondary-500">
                  <CameraOff className="h-24 w-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Camera is not active</p>
                  <p className="text-sm">Click "Start Camera" to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Captured Image */}
          {capturedImage && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Captured Image</h3>
              <div className="image-canvas">
                <img
                  src={capturedImage}
                  alt="Captured microscopy image"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-secondary-600">
                  Resolution: {cameraSettings.resolution} | 
                  Pixel Size: {calibration.pixelSize} μm | 
                  Magnification: {calibration.magnification}x
                </div>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="btn-secondary"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Capture History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* History Header */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">Capture History</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-600">
                  {captures.length} capture(s) total
                </span>
                <button
                  onClick={clearAllCaptures}
                  className="btn-secondary text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Captures Grid */}
          {captures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {captures.map((capture) => (
                <div key={capture.id} className="card group">
                  <div className="relative">
                    <img
                      src={capture.imageData}
                      alt="Captured image"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <button
                      onClick={() => deleteCapture(capture.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500">
                        {formatTimestamp(capture.timestamp)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        capture.metadata.analysisType === 'general' ? 'bg-blue-100 text-blue-800' :
                        capture.metadata.analysisType === 'metallurgical' ? 'bg-green-100 text-green-800' :
                        capture.metadata.analysisType === 'graphite' ? 'bg-purple-100 text-purple-800' :
                        capture.metadata.analysisType === 'structural' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {capture.metadata.analysisType.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-secondary-700">
                      <p><strong>Resolution:</strong> {capture.metadata.resolution}</p>
                      <p><strong>Magnification:</strong> {capture.metadata.magnification}x</p>
                      {capture.metadata.notes && (
                        <p><strong>Notes:</strong> {capture.metadata.notes}</p>
                      )}
                    </div>
                    
                    {capture.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {capture.metadata.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                          >
                            <Tag className="h-3 w-3 inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center text-secondary-500">
              <Clock className="h-24 w-24 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No captures yet</p>
              <p className="text-sm">Start capturing images to see them here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
