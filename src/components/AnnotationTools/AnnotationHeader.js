import React, { useState, useCallback } from 'react';
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
  Palette,
  ChevronDown,
  ChevronUp,
  Edit3
} from 'lucide-react';

const AnnotationHeader = ({ 
  onToolSelect, 
  onAnnotationAdd, 
  onStyleChange,
  currentImage,
  isExpanded = false,
  onToggleExpand,
  showHeader = true
}) => {
  const [activeTool, setActiveTool] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [annotationStyles, setAnnotationStyles] = useState({
    textSize: 12,
    textColor: '#000000',
    lineColor: '#FF0000',
    lineWidth: 2,
    arrowSize: 8,
    dimensionPrecision: 2
  });

  // Full tab definitions with all previous functionalities
  const tabs = {
    home: {
      name: 'Home',
      sections: [
        {
          name: 'Clipboard',
          tools: [
            { id: 'undo', name: 'Undo', icon: Undo, shortcut: 'Ctrl+Z' },
            { id: 'redo', name: 'Redo', icon: Redo, shortcut: 'Ctrl+Y' },
            { id: 'save', name: 'Save', icon: Save, shortcut: 'Ctrl+S' },
            { id: 'export', name: 'Export', icon: Download, shortcut: 'Ctrl+E' }
          ]
        },
        {
          name: 'Quick Tools',
          tools: [
            { id: 'single-text', name: 'Text', icon: Type, shortcut: 'T' },
            { id: 'linear', name: 'Dimension', icon: Ruler, shortcut: 'D' },
            { id: 'leader', name: 'Leader', icon: ArrowRight, shortcut: 'L' }
          ]
        }
      ]
    },
    insert: {
      name: 'Insert',
      sections: [
        {
          name: 'Text',
          tools: [
            { id: 'single-text', name: 'Single Line', icon: Type, shortcut: 'T' },
            { id: 'multiline-text', name: 'Multiline', icon: Type, shortcut: 'MT' },
            { id: 'field', name: 'Field', icon: Type, shortcut: 'F' }
          ]
        },
        {
          name: 'Dimensions',
          tools: [
            { id: 'linear', name: 'Linear', icon: Ruler, shortcut: 'DIM' },
            { id: 'aligned', name: 'Aligned', icon: Ruler, shortcut: 'DAL' },
            { id: 'angular', name: 'Angular', icon: Ruler, shortcut: 'DAN' },
            { id: 'radius', name: 'Radius', icon: Circle, shortcut: 'DRA' },
            { id: 'diameter', name: 'Diameter', icon: Circle, shortcut: 'DDI' },
            { id: 'arc-length', name: 'Arc Length', icon: Ruler, shortcut: 'DAR' },
            { id: 'ordinate', name: 'Ordinate', icon: Ruler, shortcut: 'DOR' },
            { id: 'baseline', name: 'Baseline', icon: Ruler, shortcut: 'DBA' },
            { id: 'continue', name: 'Continue', icon: Ruler, shortcut: 'DCO' }
          ]
        },
        {
          name: 'Leaders',
          tools: [
            { id: 'leader', name: 'Leader', icon: ArrowRight, shortcut: 'LE' },
            { id: 'multileader', name: 'Multileader', icon: ArrowRight, shortcut: 'MLE' }
          ]
        },
        {
          name: 'Tables',
          tools: [
            { id: 'table', name: 'Table', icon: Table, shortcut: 'TB' },
            { id: 'bom', name: 'BOM Table', icon: Table, shortcut: 'BOM' }
          ]
        }
      ]
    },
    annotate: {
      name: 'Annotate',
      sections: [
        {
          name: 'Patterns',
          tools: [
            { id: 'hatch', name: 'Hatch', icon: Grid3X3, shortcut: 'H' },
            { id: 'gradient', name: 'Gradient', icon: Palette, shortcut: 'G' }
          ]
        },
        {
          name: 'Symbols',
          tools: [
            { id: 'centerline', name: 'Centerline', icon: Circle, shortcut: 'CL' },
            { id: 'center-mark', name: 'Center Mark', icon: Circle, shortcut: 'CM' },
            { id: 'surface-texture', name: 'Surface', icon: Circle, shortcut: 'ST' },
            { id: 'welding', name: 'Welding', icon: Circle, shortcut: 'WS' },
            { id: 'datum', name: 'Datum', icon: Circle, shortcut: 'DI' }
          ]
        },
        {
          name: 'Revision',
          tools: [
            { id: 'revision-cloud', name: 'Revision Cloud', icon: Cloud, shortcut: 'RC' }
          ]
        }
      ]
    },
    view: {
      name: 'View',
      sections: [
        {
          name: 'Layers',
          tools: [
            { id: 'layers', name: 'Layer Manager', icon: Layers, shortcut: 'LM' },
            { id: 'visibility', name: 'Show/Hide', icon: Layers, shortcut: 'V' }
          ]
        },
        {
          name: 'Settings',
          tools: [
            { id: 'settings', name: 'Preferences', icon: Settings, shortcut: 'P' },
            { id: 'styles', name: 'Style Manager', icon: Settings, shortcut: 'SM' }
          ]
        }
      ]
    }
  };

  // Handle tool selection
  const handleToolSelect = useCallback((toolId) => {
    setActiveTool(toolId);
    onToolSelect?.(toolId);
    
    // Handle special actions
    switch (toolId) {
      case 'undo':
        onAnnotationAdd?.({ type: 'undo' });
        break;
      case 'redo':
        onAnnotationAdd?.({ type: 'redo' });
        break;
      case 'save':
        onAnnotationAdd?.({ type: 'save' });
        break;
      case 'export':
        onAnnotationAdd?.({ type: 'export' });
        break;
      default:
        break;
    }
  }, [onToolSelect, onAnnotationAdd]);

  // Handle style changes
  const handleStyleChange = useCallback((property, value) => {
    const newStyles = { ...annotationStyles, [property]: value };
    setAnnotationStyles(newStyles);
    onStyleChange?.(newStyles);
  }, [annotationStyles, onStyleChange]);

  return (
    <div className={`${showHeader ? 'fixed top-0 left-0 right-0 z-50' : ''} bg-white border-b border-gray-300 shadow-lg`}>
      {/* Minimal Header Bar */}
      {showHeader && (
        <div className="bg-primary text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onToggleExpand}
                className="flex items-center space-x-2 px-3 py-1 bg-primary-dark hover:bg-primary-darker rounded transition-colors"
              >
                <Edit3 size={14} />
                <span className="text-sm font-medium">Annotation Tools</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs opacity-90">Professional Tools</span>
              {currentImage && (
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  Image Loaded
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Toolbar */}
      {isExpanded && (
        <div className="bg-white border-b border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {Object.entries(tabs).map(([tabKey, tab]) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tabKey
                    ? 'border-primary text-primary bg-primary-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="px-4 py-3 bg-gray-50">
            {tabs[activeTab] && (
              <div className="flex flex-wrap gap-6">
                {tabs[activeTab].sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="flex-shrink-0">
                    <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      {section.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {section.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleToolSelect(tool.id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded text-left transition-colors ${
                              activeTool === tool.id
                                ? 'bg-purple-100 text-purple-900 shadow-sm border border-purple-300'
                                : 'text-gray-700 hover:bg-white hover:shadow-sm'
                            }`}
                            title={`${tool.name} (${tool.shortcut})`}
                          >
                            <ToolIcon size={12} />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">{tool.name}</span>
                              <span className="text-xs opacity-60">{tool.shortcut}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compact Style Controls */}
          <div className="px-4 py-2 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-700">Text:</span>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={annotationStyles.textSize}
                  onChange={(e) => handleStyleChange('textSize', parseInt(e.target.value))}
                  className="w-16"
                />
                <span className="text-xs text-gray-600 w-6">{annotationStyles.textSize}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-700">Line:</span>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={annotationStyles.lineWidth}
                  onChange={(e) => handleStyleChange('lineWidth', parseInt(e.target.value))}
                  className="w-16"
                />
                <span className="text-xs text-gray-600 w-6">{annotationStyles.lineWidth}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-700">Text:</span>
                <input
                  type="color"
                  value={annotationStyles.textColor}
                  onChange={(e) => handleStyleChange('textColor', e.target.value)}
                  className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                  title="Text Color"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-700">Line:</span>
                <input
                  type="color"
                  value={annotationStyles.lineColor}
                  onChange={(e) => handleStyleChange('lineColor', e.target.value)}
                  className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                  title="Line Color"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationHeader;
