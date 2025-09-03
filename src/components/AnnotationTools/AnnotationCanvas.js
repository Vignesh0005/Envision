import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';

const AnnotationCanvas = ({
  imageUrl,
  annotations = [],
  activeTool,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  styles = {},
  isReadOnly = false
}) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [dimensionStart, setDimensionStart] = useState(null);
  const [dimensionEnd, setDimensionEnd] = useState(null);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8f9fa',
        selection: !isReadOnly,
        preserveObjectStacking: true
      });

      // Set up event listeners
      fabricCanvasRef.current.on('mouse:down', handleCanvasMouseDown);
      fabricCanvasRef.current.on('mouse:move', handleCanvasMouseMove);
      fabricCanvasRef.current.on('mouse:up', handleCanvasMouseUp);
      fabricCanvasRef.current.on('object:modified', handleObjectModified);
      fabricCanvasRef.current.on('object:removed', handleObjectRemoved);

      // Load background image if provided
      if (imageUrl) {
        loadBackgroundImage(imageUrl);
      }
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [imageUrl]);

  // Load background image
  const loadBackgroundImage = useCallback((url) => {
    fabric.Image.fromURL(url, (img) => {
      // Scale image to fit canvas
      const canvas = fabricCanvasRef.current;
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.min(scaleX, scaleY);
      
      img.set({
        left: (canvas.width - img.width * scale) / 2,
        top: (canvas.height - img.height * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false
      });
      
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  }, []);

  // Handle canvas mouse events
  const handleCanvasMouseDown = useCallback((e) => {
    if (isReadOnly || !activeTool) return;

    const pointer = fabricCanvasRef.current.getPointer(e.e);
    const point = { x: pointer.x, y: pointer.y };

    switch (activeTool) {
      case 'linear':
      case 'aligned':
      case 'angular':
        if (!dimensionStart) {
          setDimensionStart(point);
        } else {
          setDimensionEnd(point);
          createDimension(point);
        }
        break;
      
      case 'radius':
      case 'diameter':
        createCircleDimension(point);
        break;
      
      case 'leader':
      case 'multileader':
        createLeader(point);
        break;
      
      case 'centerline':
        if (!dimensionStart) {
          setDimensionStart(point);
        } else {
          createCenterline(point);
        }
        break;
      
      case 'revision-cloud':
        setIsDrawing(true);
        setDrawingPoints([point]);
        break;
      
      case 'hatch':
        createHatchPattern(point);
        break;
      
      default:
        break;
    }
  }, [activeTool, dimensionStart, dimensionEnd, isReadOnly]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDrawing || !activeTool) return;

    const pointer = fabricCanvasRef.current.getPointer(e.e);
    const point = { x: pointer.x, y: pointer.y };

    if (activeTool === 'revision-cloud') {
      setDrawingPoints(prev => [...prev, point]);
      drawRevisionCloud();
    }
  }, [isDrawing, activeTool]);

  const handleCanvasMouseUp = useCallback(() => {
    if (activeTool === 'revision-cloud') {
      setIsDrawing(false);
      finalizeRevisionCloud();
    }
  }, [activeTool]);

  // Create dimension annotations
  const createDimension = useCallback((endPoint) => {
    if (!dimensionStart) return;

    const start = dimensionStart;
    const end = endPoint;
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    
    // Create dimension line
    const dimensionLine = new fabric.Line([start.x, start.y, end.x, end.y], {
      stroke: styles.lineColor || '#FF0000',
      strokeWidth: styles.lineWidth || 2,
      selectable: true,
      evented: true
    });

    // Create dimension text
    const text = new fabric.Text(`${distance.toFixed(styles.dimensionPrecision || 2)}px`, {
      left: (start.x + end.x) / 2,
      top: (start.y + end.y) / 2 - 10,
      fontSize: styles.textSize || 12,
      fill: styles.textColor || '#000000',
      selectable: true,
      evented: true
    });

    // Add to canvas
    fabricCanvasRef.current.add(dimensionLine);
    fabricCanvasRef.current.add(text);

    // Create annotation object
    const annotation = {
      id: Date.now(),
      type: 'dimension',
      tool: activeTool,
      objects: [dimensionLine, text],
      data: { start, end, distance },
      styles: { ...styles }
    };

    onAnnotationAdd?.(annotation);
    setCurrentAnnotation(annotation);

    // Reset dimension points
    setDimensionStart(null);
    setDimensionEnd(null);
  }, [dimensionStart, activeTool, styles, onAnnotationAdd]);

  // Create circle dimensions
  const createCircleDimension = useCallback((point) => {
    const radius = 50; // Default radius, could be made interactive
    
    const circle = new fabric.Circle({
      left: point.x - radius,
      top: point.y - radius,
      radius: radius,
      stroke: styles.lineColor || '#FF0000',
      strokeWidth: styles.lineWidth || 2,
      fill: 'transparent',
      selectable: true,
      evented: true
    });

    const text = new fabric.Text(`${radius}px`, {
      left: point.x + radius + 10,
      top: point.y - 10,
      fontSize: styles.textSize || 12,
      fill: styles.textColor || '#000000',
      selectable: true,
      evented: true
    });

    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.add(text);

    const annotation = {
      id: Date.now(),
      type: 'circle',
      tool: activeTool,
      objects: [circle, text],
      data: { center: point, radius },
      styles: { ...styles }
    };

    onAnnotationAdd?.(annotation);
    setCurrentAnnotation(annotation);
  }, [activeTool, styles, onAnnotationAdd]);

  // Create leader annotations
  const createLeader = useCallback((point) => {
    const leaderLine = new fabric.Line([point.x - 50, point.y, point.x, point.y], {
      stroke: styles.lineColor || '#FF0000',
      strokeWidth: styles.lineWidth || 2,
      selectable: true,
      evented: true
    });

    const arrow = new fabric.Triangle({
      left: point.x - 5,
      top: point.y - 5,
      width: 10,
      height: 10,
      fill: styles.lineColor || '#FF0000',
      angle: 0,
      selectable: true,
      evented: true
    });

    fabricCanvasRef.current.add(leaderLine);
    fabricCanvasRef.current.add(arrow);

    const annotation = {
      id: Date.now(),
      type: 'leader',
      tool: activeTool,
      objects: [leaderLine, arrow],
      data: { point },
      styles: { ...styles }
    };

    onAnnotationAdd?.(annotation);
    setCurrentAnnotation(annotation);
  }, [activeTool, styles, onAnnotationAdd]);

  // Create centerline
  const createCenterline = useCallback((endPoint) => {
    if (!dimensionStart) return;

    const start = dimensionStart;
    const end = endPoint;

    const centerline = new fabric.Line([start.x, start.y, end.x, end.y], {
      stroke: styles.lineColor || '#0000FF',
      strokeWidth: styles.lineWidth || 2,
      strokeDashArray: [5, 5],
      selectable: true,
      evented: true
    });

    fabricCanvasRef.current.add(centerline);

    const annotation = {
      id: Date.now(),
      type: 'centerline',
      tool: activeTool,
      objects: [centerline],
      data: { start, end },
      styles: { ...styles }
    };

    onAnnotationAdd?.(annotation);
    setCurrentAnnotation(annotation);

    setDimensionStart(null);
  }, [dimensionStart, activeTool, styles, onAnnotationAdd]);

  // Draw revision cloud
  const drawRevisionCloud = useCallback(() => {
    if (drawingPoints.length < 2) return;

    // Remove previous cloud if exists
    if (currentAnnotation?.objects?.[0]) {
      fabricCanvasRef.current.remove(currentAnnotation.objects[0]);
    }

    // Create cloud path
    const path = new fabric.Path('M ' + drawingPoints.map(p => `${p.x} ${p.y}`).join(' L '), {
      stroke: styles.lineColor || '#FF0000',
      strokeWidth: styles.lineWidth || 2,
      fill: 'transparent',
      selectable: true,
      evented: true
    });

    fabricCanvasRef.current.add(path);
    fabricCanvasRef.current.renderAll();
  }, [drawingPoints, currentAnnotation, styles]);

  // Finalize revision cloud
  const finalizeRevisionCloud = useCallback(() => {
    if (drawingPoints.length < 3) return;

    const path = fabricCanvasRef.current.getObjects().pop();
    
    const annotation = {
      id: Date.now(),
      type: 'revision-cloud',
      tool: activeTool,
      objects: [path],
      data: { points: drawingPoints },
      styles: { ...styles }
    };

    onAnnotationAdd?.(annotation);
    setCurrentAnnotation(annotation);
    setDrawingPoints([]);
  }, [drawingPoints, activeTool, styles, onAnnotationAdd]);

  // Create hatch pattern
  const createHatchPattern = useCallback((point) => {
    const size = 50;
    const lines = [];
    
    // Create horizontal lines
    for (let i = 0; i < size; i += 5) {
      const line = new fabric.Line([
        point.x, point.y + i,
        point.x + size, point.y + i
      ], {
        stroke: styles.lineColor || '#000000',
        strokeWidth: 1,
        selectable: true,
        evented: true
      });
      lines.push(line);
      fabricCanvasRef.current.add(line);
    }

    // Create vertical lines
    for (let i = 0; i < size; i += 5) {
      const line = new fabric.Line([
        point.x + i, point.y,
        point.x + i, point.y + size
      ], {
        stroke: styles.lineColor || '#000000',
        strokeWidth: 1,
        selectable: true,
        evented: true
      });
      lines.push(line);
      fabricCanvasRef.current.add(line);
    }

    const annotation = {
      id: Date.now(),
      type: 'hatch',
      tool: activeTool,
      objects: lines,
      data: { point, size },
      styles: { ...styles }
    };

    onAnnotationAdd?.(annotation);
    setCurrentAnnotation(annotation);
  }, [activeTool, styles, onAnnotationAdd]);

  // Handle object modifications
  const handleObjectModified = useCallback((e) => {
    const modifiedObject = e.target;
    // Find annotation containing this object and update it
    if (currentAnnotation?.objects?.includes(modifiedObject)) {
      onAnnotationUpdate?.(currentAnnotation.id, {
        ...currentAnnotation,
        objects: currentAnnotation.objects.map(obj => 
          obj === modifiedObject ? modifiedObject : obj
        )
      });
    }
  }, [currentAnnotation, onAnnotationUpdate]);

  // Handle object removal
  const handleObjectRemoved = useCallback((e) => {
    const removedObject = e.target;
    if (currentAnnotation?.objects?.includes(removedObject)) {
      onAnnotationDelete?.(currentAnnotation.id);
    }
  }, [currentAnnotation, onAnnotationDelete]);

  // Load existing annotations
  useEffect(() => {
    if (fabricCanvasRef.current && annotations.length > 0) {
      annotations.forEach(annotation => {
        annotation.objects?.forEach(obj => {
          if (obj.type) {
            // Recreate fabric objects from serialized data
            const fabricObj = fabric.util.object.clone(obj);
            fabricCanvasRef.current.add(fabricObj);
          }
        });
      });
      fabricCanvasRef.current.renderAll();
    }
  }, [annotations]);

  // Update canvas when styles change
  useEffect(() => {
    if (fabricCanvasRef.current && currentAnnotation) {
      currentAnnotation.objects?.forEach(obj => {
        if (obj.stroke) obj.set('stroke', styles.lineColor);
        if (obj.strokeWidth) obj.set('strokeWidth', styles.lineWidth);
        if (obj.fill && obj.type !== 'circle') obj.set('fill', styles.textColor);
        if (obj.fontSize) obj.set('fontSize', styles.textSize);
      });
      fabricCanvasRef.current.renderAll();
    }
  }, [styles, currentAnnotation]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg shadow-sm"
      />
      
      {/* Tool status indicator */}
      {activeTool && (
        <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
          Active: {activeTool}
        </div>
      )}
      
      {/* Drawing status */}
      {isDrawing && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Drawing...
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;
