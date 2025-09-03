import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  Layers, 
  Settings,
  FileText,
  Image as ImageIcon,
  FileDown
} from 'lucide-react';

const AnnotationManager = ({
  annotations = [],
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationsSave,
  onAnnotationsExport,
  currentImage
}) => {
  const [visibleAnnotations, setVisibleAnnotations] = useState(new Set());
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [annotationLayers, setAnnotationLayers] = useState([]);
  const [showLayerManager, setShowLayerManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(0.9);

  // Initialize visible annotations
  useEffect(() => {
    const initialVisible = new Set(annotations.map(ann => ann.id));
    setVisibleAnnotations(initialVisible);
  }, [annotations]);

  // Group annotations by type for better organization
  const groupedAnnotations = annotations.reduce((groups, annotation) => {
    const type = annotation.type || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(annotation);
    return groups;
  }, {});

  // Handle annotation visibility toggle
  const toggleAnnotationVisibility = useCallback((annotationId) => {
    setVisibleAnnotations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(annotationId)) {
        newSet.delete(annotationId);
      } else {
        newSet.add(annotationId);
      }
      return newSet;
    });
  }, []);

  // Handle annotation selection
  const selectAnnotation = useCallback((annotation) => {
    setSelectedAnnotation(annotation);
  }, []);

  // Handle annotation deletion
  const deleteAnnotation = useCallback((annotationId) => {
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      onAnnotationDelete?.(annotationId);
      if (selectedAnnotation?.id === annotationId) {
        setSelectedAnnotation(null);
      }
    }
  }, [onAnnotationDelete, selectedAnnotation]);

  // Handle bulk operations
  const deleteAllAnnotations = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all annotations?')) {
      annotations.forEach(ann => onAnnotationDelete?.(ann.id));
      setSelectedAnnotation(null);
    }
  }, [annotations, onAnnotationDelete]);

  const toggleAllAnnotations = useCallback((visible) => {
    if (visible) {
      setVisibleAnnotations(new Set(annotations.map(ann => ann.id)));
    } else {
      setVisibleAnnotations(new Set());
    }
  }, [annotations]);

  // Handle annotation export
  const handleExport = useCallback(async () => {
    if (!currentImage) {
      alert('No image loaded for export');
      return;
    }

    try {
      await onAnnotationsExport?.({
        format: exportFormat,
        quality: exportQuality,
        includeAnnotations: true,
        visibleOnly: true
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [currentImage, exportFormat, exportQuality, onAnnotationsExport]);

  // Handle annotation save
  const handleSave = useCallback(async () => {
    try {
      await onAnnotationsSave?.(annotations);
      alert('Annotations saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed. Please try again.');
    }
  }, [annotations, onAnnotationsSave]);

  // Create annotation summary
  const getAnnotationSummary = useCallback(() => {
    const summary = {
      total: annotations.length,
      byType: {},
      byTool: {}
    };

    annotations.forEach(ann => {
      // Count by type
      summary.byType[ann.type] = (summary.byType[ann.type] || 0) + 1;
      
      // Count by tool
      summary.byTool[ann.tool] = (summary.byTool[ann.tool] || 0) + 1;
    });

    return summary;
  }, [annotations]);

  const summary = getAnnotationSummary();

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Annotation Manager</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLayerManager(!showLayerManager)}
              className="p-2 hover:bg-primary-dark rounded"
              title="Layer Manager"
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-primary-dark rounded"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{summary.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{Object.keys(summary.byType).length}</div>
            <div className="text-sm text-gray-600">Types</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{Object.keys(summary.byTool).length}</div>
            <div className="text-sm text-gray-600">Tools</div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => toggleAllAnnotations(true)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Show All
            </button>
            <button
              onClick={() => toggleAllAnnotations(false)}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Hide All
            </button>
          </div>
          <button
            onClick={deleteAllAnnotations}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Annotations List */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(groupedAnnotations).map(([type, typeAnnotations]) => (
          <div key={type} className="border-b border-gray-100">
            <div className="px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
              {type.charAt(0).toUpperCase() + type.slice(1)} ({typeAnnotations.length})
            </div>
            {typeAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer border-l-4 ${
                  selectedAnnotation?.id === annotation.id
                    ? 'border-primary bg-primary-50'
                    : 'border-transparent'
                }`}
                onClick={() => selectAnnotation(annotation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAnnotationVisibility(annotation.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {visibleAnnotations.has(annotation.id) ? (
                        <Eye size={16} className="text-green-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </button>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {annotation.tool || 'Unknown Tool'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {annotation.id} | {new Date(annotation.id).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnnotation(annotation.id);
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Layer Manager Modal */}
      {showLayerManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Layer Manager</h3>
            <div className="space-y-3">
              {annotationLayers.map((layer, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{layer.name}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => {/* Toggle layer visibility */}}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity}
                      onChange={() => {/* Change layer opacity */}}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLayerManager(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="pdf">PDF</option>
                  <option value="svg">SVG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {Math.round(exportQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={exportQuality}
                  onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationManager;
