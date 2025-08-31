import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Toolbar from './components/Toolbar'
import ControlBox from './components/ControlBox'
import Display from './components/Display'
import ImageList from './components/ImageList'
import NodularityAnalysis from './components/NodularityAnalysis'
import PhaseSegmentation from './components/PhaseSegmentation'
import InclusionAnalysis from './components/InclusionAnalysis'
import PorosityAnalysis from './components/PorosityAnalysis'
import ShapeTracker from './components/ShapeTracker'

const SIDEBAR_WIDTH = '320px';
const VIEWER_MAX_WIDTH = 'calc(100vw - 340px)';
const VIEWER_MAX_HEIGHT = 'calc(100vh - 120px - 300px)'; // minus top bars and gallery

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [imagePath, setImagePath] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [selectedTool, setSelectedTool] = useState('pointer');
  const [measurementData, setMeasurementData] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [currentFolderPath, setCurrentFolderPath] = useState('C:\\Users\\Public\\MicroScope_Images');
  const [currentColor, setCurrentColor] = useState('#00ff00');
  const [currentFontColor, setCurrentFontColor] = useState('#ffffff');
  const [currentThickness, setCurrentThickness] = useState(2);
  const [currentCalibration, setCurrentCalibration] = useState(null);
  const [showNodularity, setShowNodularity] = useState(false);
  const [showPhaseSegmentation, setShowPhaseSegmentation] = useState(false);
  const [showInclusion, setShowInclusion] = useState(false);
  const [showPorosity, setShowPorosity] = useState(false);

  useEffect(() => {
    const loadCalibration = () => {
      const savedCalibration = localStorage.getItem('currentCalibration');
      if (savedCalibration) {
        setCurrentCalibration(JSON.parse(savedCalibration));
      }
    };
    loadCalibration();
    window.addEventListener('storage', loadCalibration);
    return () => window.removeEventListener('storage', loadCalibration);
  }, []);

  const handleImageLoad = (url) => setCurrentImageUrl(url);
  const handleSelectTool = (toolId) => setSelectedTool(toolId);
  const handleMeasurement = (data) => setMeasurementData(data);
  const handleShapesUpdate = (newShapes) => setShapes(newShapes);
  const handleShapeSelect = (shape) => setSelectedShape(shape);
  const handleClearShapes = () => {
    if (window.confirm('Are you sure you want to clear all measurements?')) {
      setShapes([]);
    }
  };
  const handleImageSelect = (imagePath) => setImagePath(imagePath);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Menu Bars */}
      <div className="flex flex-col w-full z-50">
        <Navbar imagePath={imagePath} setImagePath={setImagePath} />
        {!(showNodularity || showPhaseSegmentation || showInclusion || showPorosity) && (
          <Toolbar 
            onSelectTool={handleSelectTool}
            selectedTool={selectedTool}
            measurementData={measurementData}
            onClearShapes={handleClearShapes}
            onColorChange={setCurrentColor}
            onFontColorChange={setCurrentFontColor}
            onThicknessChange={setCurrentThickness}
            currentColor={currentColor}
            currentFontColor={currentFontColor}
            currentThickness={currentThickness}
            currentCalibration={currentCalibration}
          />
        )}
      </div>
      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex flex-col h-full" style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}>
          {/* Drawn Shapes Panel - fill sidebar up to ControlBox */}
          <div className="flex-1 min-h-0 w-full">
            <ShapeTracker
              shapes={shapes}
              selectedShape={selectedShape}
              onShapeSelect={handleShapeSelect}
              onColorChange={setCurrentColor}
              currentColor={currentColor}
              currentFontColor={currentFontColor}
              onFontColorChange={setCurrentFontColor}
              onShapesUpdate={handleShapesUpdate}
            />
          </div>
          {/* ControlBox at the bottom of the sidebar */}
          <div className="w-full">
            <ControlBox
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              setImagePath={setImagePath}
              onFolderChange={setCurrentFolderPath}
            />
          </div>
        </div>
        {/* Main Image Viewer Centered */}
        <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
          <div className="relative bg-white flex items-center justify-center w-full h-full">
            <Display
              isRecording={isRecording}
              imagePath={imagePath}
              onImageLoad={handleImageLoad}
              selectedTool={selectedTool}
              shapes={shapes}
              onShapesUpdate={handleShapesUpdate}
              currentColor={currentColor}
              currentFontColor={currentFontColor}
              currentThickness={currentThickness}
              onColorChange={setCurrentColor}
              onFontColorChange={setCurrentFontColor}
            />
          </div>
        </div>
      </div>
      {/* Bottom Gallery as Footer/Tray */}
      <div className="w-full flex justify-center items-end z-40">
        <ImageList
          currentPath={currentFolderPath}
          onSelectImage={handleImageSelect}
        />
      </div>
      {/* Analysis Modals */}
      {showNodularity && (
        <NodularityAnalysis
          onClose={() => setShowNodularity(false)}
          imagePath={imagePath}
          imageUrl={`http://localhost:5000/api/get-image?path=${encodeURIComponent(imagePath)}`}
        />
      )}
      {showPhaseSegmentation && (
        <PhaseSegmentation
          onClose={() => setShowPhaseSegmentation(false)}
          imagePath={imagePath}
          imageUrl={`http://localhost:5000/api/get-image?path=${encodeURIComponent(imagePath)}`}
        />
      )}
      {showInclusion && (
        <InclusionAnalysis
          onClose={() => setShowInclusion(false)}
          imagePath={imagePath}
          imageUrl={`http://localhost:5000/api/get-image?path=${encodeURIComponent(imagePath)}`}
        />
      )}
      {showPorosity && (
        <PorosityAnalysis
          onClose={() => setShowPorosity(false)}
          imagePath={imagePath}
          imageUrl={`http://localhost:5000/api/get-image?path=${encodeURIComponent(imagePath)}`}
        />
      )}
    </div>
  );
};

export default App;