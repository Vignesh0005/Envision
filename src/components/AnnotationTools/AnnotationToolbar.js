import React, { useState, useRef, useEffect } from 'react';
import { 
  Type, 
  Ruler, 
  ArrowRight, 
  Table, 
  Grid3X3, 
  Circle, 
  Cloud, 
  Settings,
  Save,
  Download,
  Undo,
  Redo,
  Layers,
  Palette
} from 'lucide-react';

const AnnotationToolbar = ({ 
  onToolSelect, 
  onAnnotationAdd, 
  onStyleChange,
  currentImage,
  isVisible = true 
}) => {
  const [activeTool, setActiveTool] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [annotationStyles, setAnnotationStyles] = useState({
    textSize: 12,
    textColor: '#000000',
    lineColor: '#FF0000',
    lineWidth: 2,
    arrowSize: 8,
    dimensionPrecision: 2
  });

  const toolbarRef = useRef(null);

  // Tool categories
  const toolCategories = {
    text: {
      name: 'Text Tools',
      icon: Type,
      tools: [
        { id: 'single-text', name: 'Single Line Text', icon: Type, shortcut: 'T' },
        { id: 'multiline-text', name: 'Multiline Text', icon: Type, shortcut: 'MT' },
        { id: 'field', name: 'Field', icon: Type, shortcut: 'F' }
      ]
    },
    dimensions: {
      name: 'Dimensions',
      icon: Ruler,
      tools: [
        { id: 'linear', name: 'Linear Dimension', icon: Ruler, shortcut: 'DIM' },
        { id: 'aligned', name: 'Aligned Dimension', icon: Ruler, shortcut: 'DAL' },
        { id: 'angular', name: 'Angular Dimension', icon: Ruler, shortcut: 'DAN' },
        { id: 'radius', name: 'Radius', icon: Circle, shortcut: 'DRA' },
        { id: 'diameter', name: 'Diameter', icon: Circle, shortcut: 'DDI' },
        { id: 'arc-length', name: 'Arc Length', icon: Ruler, shortcut: 'DAR' },
        { id: 'ordinate', name: 'Ordinate', icon: Ruler, shortcut: 'DOR' },
        { id: 'baseline', name: 'Baseline', icon: Ruler, shortcut: 'DBA' },
        { id: 'continue', name: 'Continue', icon: Ruler, shortcut: 'DCO' }
      ]
    },
    leaders: {
      name: 'Leaders',
      icon: ArrowRight,
      tools: [
        { id: 'leader', name: 'Leader', icon: ArrowRight, shortcut: 'LE' },
        { id: 'multileader', name: 'Multileader', icon: ArrowRight, shortcut: 'MLE' }
      ]
    },
    tables: {
      name: 'Tables',
      icon: Table,
      tools: [
        { id: 'table', name: 'Table', icon: Table, shortcut: 'TB' },
        { id: 'bom', name: 'BOM Table', icon: Table, shortcut: 'BOM' }
      ]
    },
    patterns: {
      name: 'Patterns',
      icon: Grid3X3,
      tools: [
        { id: 'hatch', name: 'Hatch Pattern', icon: Grid3X3, shortcut: 'H' },
        { id: 'gradient', name: 'Gradient', icon: Palette, shortcut: 'G' }
      ]
    },
    symbols: {
      name: 'Symbols',
      icon: Circle,
      tools: [
        { id: 'centerline', name: 'Centerline', icon: Circle, shortcut: 'CL' },
        { id: 'center-mark', name: 'Center Mark', icon: Circle, shortcut: 'CM' },
        { id: 'surface-texture', name: 'Surface Texture', icon: Circle, shortcut: 'ST' },
        { id: 'welding', name: 'Welding Symbol', icon: Circle, shortcut: 'WS' },
        { id: 'datum', name: 'Datum Identifier', icon: Circle, shortcut: 'DI' }
      ]
    },
    revision: {
      name: 'Revision',
      icon: Cloud,
      tools: [
        { id: 'revision-cloud', name: 'Revision Cloud', icon: Cloud, shortcut: 'RC' }
      ]
    }
  };

  // Handle toolbar dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.tool-button')) return;
    
    setIsDragging(true);
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setToolbarPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId);
    onToolSelect?.(toolId);
    
    // Handle text tools
    if (toolId.includes('text') || toolId === 'field') {
      setShowTextInput(true);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onAnnotationAdd?.({
        type: 'text',
        tool: activeTool,
        content: textInput,
        position: textPosition,
        styles: annotationStyles
      });
      setTextInput('');
      setShowTextInput(false);
    }
  };

  const handleStyleChange = (property, value) => {
    const newStyles = { ...annotationStyles, [property]: value };
    setAnnotationStyles(newStyles);
    onStyleChange?.(newStyles);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Annotation Toolbar */}
      <div
        ref={toolbarRef}
        className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg"
        style={{
          left: toolbarPosition.x,
          top: toolbarPosition.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Toolbar Header */}
        <div className="bg-primary text-white px-3 py-2 rounded-t-lg cursor-move">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Annotation Tools</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAnnotationAdd?.({ type: 'undo' })}
                className="p-1 hover:bg-primary-dark rounded"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={() => onAnnotationAdd?.({ type: 'redo' })}
                className="p-1 hover:bg-primary-dark rounded"
                title="Redo (Ctrl+Y)"
              >
                <Redo size={16} />
              </button>
              <button
                onClick={() => onAnnotationAdd?.({ type: 'save' })}
                className="p-1 hover:bg-primary-dark rounded"
                title="Save Annotations"
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => onAnnotationAdd?.({ type: 'export' })}
                className="p-1 hover:bg-primary-dark rounded"
                title="Export"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="p-3 space-y-3">
          {Object.entries(toolCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <category.icon size={16} />
                <span>{category.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {category.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={`tool-button p-2 text-xs rounded border transition-colors ${
                      activeTool === tool.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                    title={`${tool.name} (${tool.shortcut})`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <tool.icon size={14} />
                      <span className="text-xs">{tool.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Style Controls */}
        <div className="border-t border-gray-200 p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Text Size:</span>
              <input
                type="range"
                min="8"
                max="24"
                value={annotationStyles.textSize}
                onChange={(e) => handleStyleChange('textSize', parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-xs">{annotationStyles.textSize}px</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Line Width:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={annotationStyles.lineWidth}
                onChange={(e) => handleStyleChange('lineWidth', parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-xs">{annotationStyles.lineWidth}px</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={annotationStyles.textColor}
                onChange={(e) => handleStyleChange('textColor', e.target.value)}
                className="w-6 h-6 rounded border"
                title="Text Color"
              />
              <input
                type="color"
                value={annotationStyles.lineColor}
                onChange={(e) => handleStyleChange('lineColor', e.target.value)}
                className="w-6 h-6 rounded border"
                title="Line Color"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Text Annotation</h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowTextInput(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnotationToolbar;
