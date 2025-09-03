import React, { useState, useRef } from 'react';
import { 
  Ruler, 
  Circle, 
  Square, 
  Type, 
  ArrowRight, 
  Minus, 
  Plus,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Trash2,
  Undo,
  Redo
} from 'lucide-react';

const MeasurementTools = ({ onMeasurementAdd, onMeasurementRemove, measurements = [] }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [measurementHistory, setMeasurementHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startPoint = useRef(null);

  const measurementTools = [
    { id: 'point', name: 'Point', icon: Circle, description: 'Single point measurement' },
    { id: 'line', name: 'Line', icon: Minus, description: 'Distance measurement' },
    { id: 'rectangle', name: 'Rectangle', icon: Square, description: 'Area and perimeter' },
    { id: 'circle', name: 'Circle', icon: Circle, description: 'Radius and area' },
    { id: 'angle', name: 'Angle', icon: ArrowRight, description: 'Three-point angle' },
    { id: 'curve', name: 'Curve', icon: RotateCw, description: 'Curve length' },
    { id: 'closed', name: 'Closed Area', icon: Square, description: 'Irregular area' }
  ];

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FF8000', '#8000FF', '#FF0080', '#80FF00', '#0080FF', '#FF8000'
  ];

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [lineThickness, setLineThickness] = useState(2);
  const [fontColor, setFontColor] = useState('#000000');

  const startMeasurement = (toolType) => {
    setActiveTool(toolType);
    setDrawingMode(true);
    setCurrentMeasurement({
      id: Date.now(),
      type: toolType,
      points: [],
      color: selectedColor,
      thickness: lineThickness,
      fontColor: fontColor,
      timestamp: new Date().toISOString()
    });
  };

  const handleMouseDown = (e) => {
    if (!drawingMode || !activeTool) return;
    
    isDrawing.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startPoint.current = { x, y };
    
    if (activeTool === 'point') {
      completeMeasurement([{ x, y }]);
    } else if (activeTool === 'line') {
      setCurrentMeasurement(prev => ({
        ...prev,
        points: [{ x, y }]
      }));
    } else if (activeTool === 'rectangle') {
      setCurrentMeasurement(prev => ({
        ...prev,
        points: [{ x, y }]
      }));
    } else if (activeTool === 'circle') {
      setCurrentMeasurement(prev => ({
        ...prev,
        points: [{ x, y }]
      }));
    }
  };

  const handleMouseMove = (e) => {
    if (!drawingMode || !activeTool || !isDrawing.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === 'line') {
      setCurrentMeasurement(prev => ({
        ...prev,
        points: [prev.points[0], { x, y }]
      }));
    } else if (activeTool === 'rectangle') {
      setCurrentMeasurement(prev => ({
        ...prev,
        points: [prev.points[0], { x, y }]
      }));
    } else if (activeTool === 'circle') {
      setCurrentMeasurement(prev => ({
        ...prev,
        points: [prev.points[0], { x, y }]
      }));
    }
  };

  const handleMouseUp = () => {
    if (!drawingMode || !activeTool) return;
    
    isDrawing.current = false;
    
    if (activeTool === 'line' || activeTool === 'rectangle' || activeTool === 'circle') {
      if (currentMeasurement && currentMeasurement.points.length >= 2) {
        completeMeasurement(currentMeasurement.points);
      }
    }
  };

  const completeMeasurement = (points) => {
    if (!currentMeasurement) return;
    
    const measurement = {
      ...currentMeasurement,
      points: points,
      completed: true
    };
    
    // Calculate measurements based on type
    const calculatedData = calculateMeasurements(measurement);
    const finalMeasurement = { ...measurement, ...calculatedData };
    
    onMeasurementAdd(finalMeasurement);
    addToHistory(finalMeasurement);
    
    // Reset
    setCurrentMeasurement(null);
    setActiveTool(null);
    setDrawingMode(false);
  };

  const calculateMeasurements = (measurement) => {
    const { type, points } = measurement;
    
    switch (type) {
      case 'point':
        return { x: points[0].x, y: points[0].y };
      
      case 'line':
        if (points.length >= 2) {
          const dx = points[1].x - points[0].x;
          const dy = points[1].y - points[0].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return { distance: distance.toFixed(2) };
        }
        break;
      
      case 'rectangle':
        if (points.length >= 2) {
          const width = Math.abs(points[1].x - points[0].x);
          const height = Math.abs(points[1].y - points[0].y);
          const area = width * height;
          const perimeter = 2 * (width + height);
          return { 
            width: width.toFixed(2), 
            height: height.toFixed(2), 
            area: area.toFixed(2), 
            perimeter: perimeter.toFixed(2) 
          };
        }
        break;
      
      case 'circle':
        if (points.length >= 2) {
          const dx = points[1].x - points[0].x;
          const dy = points[1].y - points[0].y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          const area = Math.PI * radius * radius;
          const circumference = 2 * Math.PI * radius;
          return { 
            radius: radius.toFixed(2), 
            area: area.toFixed(2), 
            circumference: circumference.toFixed(2) 
          };
        }
        break;
      
      default:
        return {};
    }
    
    return {};
  };

  const addToHistory = (measurement) => {
    const newHistory = measurementHistory.slice(0, historyIndex + 1);
    newHistory.push(measurement);
    setMeasurementHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      // In real implementation, this would restore the previous state
    }
  };

  const redo = () => {
    if (historyIndex < measurementHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      // In real implementation, this would restore the next state
    }
  };

  const removeMeasurement = (id) => {
    onMeasurementRemove(id);
  };

  const clearAllMeasurements = () => {
    if (confirm('Are you sure you want to clear all measurements?')) {
      measurements.forEach(m => onMeasurementRemove(m.id));
    }
  };

  return (
    <div className="measurement-tools">
      {/* Tool Selection */}
      <div className="toolbar bg-white border border-secondary-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Measurement Tools</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {measurementTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => startMeasurement(tool.id)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-secondary-200 hover:border-primary-300 text-secondary-600 hover:text-primary-500'
                }`}
                title={tool.description}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* Color and Style Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Line Color</label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-secondary-900' : 'border-secondary-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Line Thickness</label>
            <select
              value={lineThickness}
              onChange={(e) => setLineThickness(parseInt(e.target.value))}
              className="input-field"
            >
              <option value={1}>1px</option>
              <option value={2}>2px</option>
              <option value={3}>3px</option>
              <option value={4}>4px</option>
              <option value={5}>5px</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Font Color</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-full h-10 rounded border border-secondary-300"
            />
          </div>
        </div>
      </div>

      {/* History Controls */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="btn-secondary disabled:opacity-50"
        >
          <Undo className="h-4 w-4 mr-2" />
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= measurementHistory.length - 1}
          className="btn-secondary disabled:opacity-50"
        >
          <Redo className="h-4 w-4 mr-2" />
          Redo
        </button>
        <button
          onClick={clearAllMeasurements}
          className="btn-secondary"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </button>
      </div>

      {/* Canvas for Drawing */}
      <div className="canvas-container border border-secondary-200 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-96 bg-secondary-50 cursor-crosshair"
          style={{ cursor: drawingMode ? 'crosshair' : 'default' }}
        />
      </div>

      {/* Measurements List */}
      {measurements.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-secondary-900 mb-3">Measurements ({measurements.length})</h4>
          <div className="space-y-2">
            {measurements.map((measurement) => (
              <div
                key={measurement.id}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: measurement.color }}
                  />
                  <span className="font-medium text-secondary-800">
                    {measurement.type.charAt(0).toUpperCase() + measurement.type.slice(1)}
                  </span>
                  {measurement.distance && (
                    <span className="text-sm text-secondary-600">
                      {measurement.distance}px
                    </span>
                  )}
                  {measurement.area && (
                    <span className="text-sm text-secondary-600">
                      Area: {measurement.area}px²
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeMeasurement(measurement.id)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementTools;
