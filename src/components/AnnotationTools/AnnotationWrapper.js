import React, { useState, useEffect, useCallback } from 'react';
import AnnotationToolbar from './AnnotationToolbar';
import AnnotationCanvas from './AnnotationCanvas';
import AnnotationManager from './AnnotationManager';
import { 
  Maximize2, 
  Minimize2, 
  X,
  Settings,
  Layers,
  FileText
} from 'lucide-react';

const AnnotationWrapper = ({
  imageUrl,
  initialAnnotations = [],
  onAnnotationsChange,
  onExport,
  onSave,
  isVisible = true,
  position = 'right'
}) => {
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [activeTool, setActiveTool] = useState(null);
  const [currentStyles, setCurrentStyles] = useState({
    textSize: 12,
    textColor: '#000000',
    lineColor: '#FF0000',
    lineWidth: 2,
    arrowSize: 8,
    dimensionPrecision: 2
  });
  const [showManager, setShowManager] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [annotationHistory, setAnnotationHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize history
  useEffect(() => {
    if (initialAnnotations.length > 0) {
      setAnnotationHistory([initialAnnotations]);
      setHistoryIndex(0);
    }
  }, [initialAnnotations]);

  // Handle annotation addition
  const handleAnnotationAdd = useCallback((annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    
    // Add to history
    const newHistory = annotationHistory.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setAnnotationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onAnnotationsChange?.(newAnnotations);
  }, [annotations, annotationHistory, historyIndex, onAnnotationsChange]);

  // Handle annotation update
  const handleAnnotationUpdate = useCallback((annotationId, updatedAnnotation) => {
    const newAnnotations = annotations.map(ann => 
      ann.id === annotationId ? updatedAnnotation : ann
    );
    setAnnotations(newAnnotations);
    
    // Add to history
    const newHistory = annotationHistory.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setAnnotationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onAnnotationsChange?.(newAnnotations);
  }, [annotations, annotationHistory, historyIndex, onAnnotationsChange]);

  // Handle annotation deletion
  const handleAnnotationDelete = useCallback((annotationId) => {
    const newAnnotations = annotations.filter(ann => ann.id !== annotationId);
    setAnnotations(newAnnotations);
    
    // Add to history
    const newHistory = annotationHistory.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setAnnotationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onAnnotationsChange?.(newAnnotations);
  }, [annotations, annotationHistory, historyIndex, onAnnotationsChange]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAnnotations(annotationHistory[newIndex]);
      onAnnotationsChange?.(annotationHistory[newIndex]);
    }
  }, [historyIndex, annotationHistory, onAnnotationsChange]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (historyIndex < annotationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAnnotations(annotationHistory[newIndex]);
      onAnnotationsChange?.(annotationHistory[newIndex]);
    }
  }, [historyIndex, annotationHistory, onAnnotationsChange]);

  // Handle annotation save
  const handleAnnotationsSave = useCallback(async (annotationsToSave) => {
    try {
      await onSave?.(annotationsToSave);
      return Promise.resolve();
    } catch (error) {
      console.error('Save failed:', error);
      return Promise.reject(error);
    }
  }, [onSave]);

  // Handle annotation export
  const handleAnnotationsExport = useCallback(async (exportOptions) => {
    try {
      await onExport?.({
        annotations,
        imageUrl,
        ...exportOptions
      });
      return Promise.resolve();
    } catch (error) {
      console.error('Export failed:', error);
      return Promise.reject(error);
    }
  }, [annotations, imageUrl, onExport]);

  // Handle tool selection
  const handleToolSelect = useCallback((toolId) => {
    setActiveTool(toolId);
  }, []);

  // Handle style changes
  const handleStyleChange = useCallback((newStyles) => {
    setCurrentStyles(newStyles);
  }, []);

  // Handle annotation actions from toolbar
  const handleToolbarAction = useCallback((action) => {
    switch (action.type) {
      case 'undo':
        handleUndo();
        break;
      case 'redo':
        handleRedo();
        break;
      case 'save':
        handleAnnotationsSave(annotations);
        break;
      case 'export':
        handleAnnotationsExport({
          format: 'png',
          quality: 0.9,
          includeAnnotations: true,
          visibleOnly: true
        });
        break;
      default:
        break;
    }
  }, [handleUndo, handleRedo, handleAnnotationsSave, handleAnnotationsExport, annotations]);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Annotation Toolbar */}
      {showToolbar && (
        <AnnotationToolbar
          onToolSelect={handleToolSelect}
          onAnnotationAdd={handleToolbarAction}
          onStyleChange={handleStyleChange}
          currentImage={imageUrl}
          isVisible={!isMinimized}
        />
      )}

      {/* Main Annotation Interface */}
      <div className={`fixed ${position === 'right' ? 'right-4' : 'left-4'} top-20 bottom-4 w-96 z-40 transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-auto'
      }`}>
        {/* Header */}
        <div className="bg-white border border-gray-300 rounded-t-lg shadow-lg">
          <div className="bg-primary text-white px-4 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Annotation Tools</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowToolbar(!showToolbar)}
                  className="p-1 hover:bg-primary-dark rounded"
                  title={showToolbar ? 'Hide Toolbar' : 'Show Toolbar'}
                >
                  <Layers size={18} />
                </button>
                <button
                  onClick={() => setShowManager(!showManager)}
                  className="p-1 hover:bg-primary-dark rounded"
                  title={showManager ? 'Hide Manager' : 'Show Manager'}
                >
                  <FileText size={18} />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-primary-dark rounded"
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="bg-white border-l border-r border-b border-gray-300 rounded-b-lg shadow-lg">
            {/* Annotation Canvas */}
            <div className="p-4 border-b border-gray-200">
              <AnnotationCanvas
                imageUrl={imageUrl}
                annotations={annotations}
                activeTool={activeTool}
                onAnnotationAdd={handleAnnotationAdd}
                onAnnotationUpdate={handleAnnotationUpdate}
                onAnnotationDelete={handleAnnotationDelete}
                styles={currentStyles}
                isReadOnly={false}
              />
            </div>

            {/* Annotation Manager */}
            {showManager && (
              <div className="p-4">
                <AnnotationManager
                  annotations={annotations}
                  onAnnotationAdd={handleAnnotationAdd}
                  onAnnotationUpdate={handleAnnotationUpdate}
                  onAnnotationDelete={handleAnnotationDelete}
                  onAnnotationsSave={handleAnnotationsSave}
                  onAnnotationsExport={handleAnnotationsExport}
                  currentImage={imageUrl}
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= annotationHistory.length - 1}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Redo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm z-50">
        <div className="font-medium mb-1">Keyboard Shortcuts:</div>
        <div className="space-y-1 text-xs">
          <div>Ctrl+Z: Undo</div>
          <div>Ctrl+Y: Redo</div>
          <div>Delete: Remove selected</div>
          <div>Esc: Cancel tool</div>
        </div>
      </div>
    </>
  );
};

export default AnnotationWrapper;
