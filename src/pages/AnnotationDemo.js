import React, { useState } from 'react';

const AnnotationDemo = () => {
  const [demoImage, setDemoImage] = useState('/sample-microscopy.jpg');
  const [showInstructions, setShowInstructions] = useState(true);

  const sampleAnnotations = [
    {
      id: 1,
      type: 'text',
      tool: 'single-text',
      content: 'Sample Analysis',
      position: { x: 100, y: 100 },
      styles: { textSize: 16, textColor: '#000000' }
    },
    {
      id: 2,
      type: 'dimension',
      tool: 'linear',
      data: { start: { x: 50, y: 50 }, end: { x: 200, y: 50 }, distance: 150 },
      styles: { lineColor: '#FF0000', lineWidth: 2 }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ENVISION Annotation Tools Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional-grade annotation tools for microscopy analysis, featuring CAD-style precision, 
            comprehensive measurement tools, and advanced annotation management.
          </p>
        </div>

        {/* Instructions Panel */}
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-blue-900">Getting Started</h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-blue-800">
              <div>
                                 <h3 className="font-semibold mb-2">🎯 Available Tools:</h3>
                 <ul className="space-y-1 text-sm">
                   <li>• <strong>Text Tools:</strong> Single line, multiline, and auto-updating fields</li>
                   <li>• <strong>Dimensions:</strong> Linear, aligned, angular, radius, diameter, arc length</li>
                   <li>• <strong>Leaders:</strong> Arrows with text annotations</li>
                   <li>• <strong>Patterns:</strong> Hatch patterns and gradients</li>
                   <li>• <strong>Symbols:</strong> Centerlines, surface texture, welding symbols</li>
                   <li>• <strong>Revision:</strong> Revision clouds for change tracking</li>
                 </ul>
              </div>
              <div>
                                 <h3 className="font-semibold mb-2">🚀 How to Use:</h3>
                 <ul className="space-y-1 text-sm">
                   <li>• <strong>Minimal Header:</strong> Click "Annotation Tools" button at the top to expand</li>
                   <li>• <strong>Full Functionality:</strong> All professional tools available in organized tabs</li>
                   <li>• <strong>Tab Navigation:</strong> Home, Insert, Annotate, and View with comprehensive tools</li>
                   <li>• <strong>Tool Selection:</strong> Click any tool to activate it with visible names</li>
                   <li>• <strong>Style Controls:</strong> Adjust text size, colors, and line width</li>
                 </ul>
              </div>
            </div>
          </div>
        )}

        {/* Demo Image Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Demo Image</h2>
          <div className="text-center">
            <img
              src={demoImage}
              alt="Sample Microscopy Image"
              className="max-w-full h-auto rounded-lg border border-gray-200"
              style={{ maxHeight: '400px' }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1pY3Jvc2NvcHkgSW1hZ2UgRGVtbzwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIyMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2xpY2sgdG8gYWRkIGltYWdlIG9yIHVzZSBzYW1wbGUgYW5ub3RhdGlvbnM8L3RleHQ+Cjwvc3ZnPgo=';
              }}
            />
            <p className="text-gray-600 mt-2 text-sm">
              Sample microscopy image for annotation demonstration
            </p>
          </div>
          
                     {/* Header System Note */}
           <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
             <div className="flex items-center space-x-3">
               <div className="text-primary-600 text-2xl">💡</div>
               <div>
                 <h3 className="font-semibold text-primary-900">Complete Annotation System</h3>
                 <p className="text-primary-700 text-sm">
                   The annotation tools are now available as a <strong>clean, minimal header at the top of every page</strong>. 
                   Click the "Annotation Tools" button to expand a comprehensive toolbar with all professional tools while maintaining the clean design.
                 </p>
               </div>
             </div>
           </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-primary text-4xl mb-4">📏</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Precision Dimensions</h3>
            <p className="text-gray-600">
              Professional measurement tools with customizable precision, units, and styling.
              Perfect for quality control and research documentation.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-primary text-4xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Annotations</h3>
            <p className="text-gray-600">
              Intelligent text tools with auto-updating fields, multiline support, and 
              professional typography options.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-primary text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Elements</h3>
            <p className="text-gray-600">
              Hatch patterns, gradients, centerlines, and revision clouds for comprehensive 
              technical documentation.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-primary text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Tools</h3>
            <p className="text-gray-600">
              Industry-standard symbols for surface texture, welding, GD&T, and other 
              manufacturing specifications.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-primary text-4xl mb-4">💾</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Management</h3>
            <p className="text-gray-600">
              Save, load, and export annotations in multiple formats. Layer management 
              and version control for complex projects.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-primary text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance</h3>
            <p className="text-gray-600">
              Optimized rendering with Fabric.js, smooth interactions, and real-time 
              updates for professional workflow.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🔬 Materials Science</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Microstructure analysis and documentation</li>
                <li>• Grain size measurements and statistics</li>
                <li>• Phase identification and quantification</li>
                <li>• Defect analysis and reporting</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🏭 Quality Control</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Inspection reports and documentation</li>
                <li>• Dimensional measurements and tolerances</li>
                <li>• Surface finish specifications</li>
                <li>• Non-conformance documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📚 Research & Education</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Publication-ready figures and diagrams</li>
                <li>• Educational material creation</li>
                <li>• Collaborative analysis projects</li>
                <li>• Data presentation and visualization</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">⚙️ Manufacturing</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Technical drawing annotations</li>
                <li>• Assembly instructions and BOMs</li>
                <li>• Process documentation</li>
                <li>• Quality assurance procedures</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Specifications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Supported Formats</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• <strong>Import:</strong> PNG, JPG, JPEG, BMP, TIFF</li>
                <li>• <strong>Export:</strong> PNG, JPG, PDF, SVG</li>
                <li>• <strong>Annotations:</strong> JSON, XML</li>
                <li>• <strong>Projects:</strong> ENVISION native format</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Features</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• <strong>Rendering:</strong> HTML5 Canvas with Fabric.js</li>
                <li>• <strong>Memory:</strong> Optimized for large images</li>
                <li>• <strong>Undo/Redo:</strong> Unlimited history with memory management</li>
                <li>• <strong>Layers:</strong> Multi-layer annotation support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Annotation System is now handled by the Layout component */}
    </div>
  );
};

export default AnnotationDemo;
