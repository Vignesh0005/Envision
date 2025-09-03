import React, { useState } from 'react';
import { Upload, Plus, Trash2, Save, ChevronRight, ChevronLeft, ZoomIn, MousePointer, Ruler } from 'lucide-react';

const Calibration = () => {
  const [activeTab, setActiveTab] = useState('existing');
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [magnification, setMagnification] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('microns');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [realLength, setRealLength] = useState('');
  const [calibrations, setCalibrations] = useState([
    { id: 1, magnification: '5X', xAxis: '21.0', yAxis: '21.0', name: '5X Calibration' },
    { id: 2, magnification: '10X', xAxis: '10.5', yAxis: '10.5', name: '10X Calibration' },
    { id: 3, magnification: '50X', xAxis: '2.1', yAxis: '2.1', name: '50X Calibration' },
    { id: 4, magnification: '100X', xAxis: '1.05', yAxis: '1.05', name: '100X Calibration' }
  ]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      magnification: ''
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePointSelection = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!startPoint) {
      setStartPoint({ x, y });
    } else if (!endPoint) {
      setEndPoint({ x, y });
    }
  };

  const calculatePixelDistance = () => {
    if (startPoint && endPoint) {
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return 0;
  };

  const calculateCalibrationRatio = () => {
    const pixelDistance = calculatePixelDistance();
    if (pixelDistance > 0 && realLength) {
      return (parseFloat(realLength) / pixelDistance).toFixed(3);
    }
    return 0;
  };

  const handleSaveCalibration = () => {
    const newCalibration = {
      id: Date.now(),
      magnification: `${magnification}X`,
      xAxis: calculateCalibrationRatio(),
      yAxis: calculateCalibrationRatio(),
      name: `${magnification}X Calibration`
    };
    setCalibrations([...calibrations, newCalibration]);
    setCurrentStep(1);
    setMagnification('');
    setStartPoint(null);
    setEndPoint(null);
    setRealLength('');
  };

  const handleDeleteCalibration = (id) => {
    setCalibrations(calibrations.filter(cal => cal.id !== id));
  };

  const renderExistingCalibrations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Existing Calibrations</h3>
        <button
          onClick={() => setActiveTab('new')}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Calibration</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Magnification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                X-axis µm/pixel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Y-axis µm/pixel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
             {calibrations.slice(-2).map((calibration) => (
               <tr key={calibration.id}>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                   {calibration.magnification}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {calibration.xAxis}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {calibration.yAxis}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {calibration.name}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                   <button
                     onClick={() => handleDeleteCalibration(calibration.id)}
                     className="text-red-600 hover:text-red-900"
                   >
                     <Trash2 size={16} />
                   </button>
                   <button className="text-blue-600 hover:text-blue-900">
                     <Save size={16} />
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );

  const renderNewCalibrationWizard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">New Calibration Wizard</h3>
        <button
          onClick={() => setActiveTab('existing')}
          className="text-purple-600 hover:text-purple-700"
        >
          Back to Existing Calibrations
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep 
                ? 'bg-purple-600 text-white' 
                : step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < 4 && (
              <ChevronRight className={`w-5 h-5 mx-2 ${
                step < currentStep ? 'text-green-500' : 'text-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
             {currentStep === 1 && (
         <div className="bg-white rounded-lg shadow p-6 space-y-6">
           <h4 className="text-lg font-medium text-gray-900">Step 1: Image Upload</h4>
           
           <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Upload scale images for different magnifications
                </p>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploaded Images
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                        <span className="text-xs text-gray-600">{image.magnification || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

             {currentStep === 2 && (
         <div className="bg-white rounded-lg shadow p-6 space-y-6">
           <h4 className="text-lg font-medium text-gray-900">Step 2: Select Magnification</h4>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Magnification Value <span className="text-red-500">*</span>
             </label>
             <div className="flex items-center space-x-2">
               <input
                 type="number"
                 value={magnification}
                 onChange={(e) => setMagnification(e.target.value)}
                 placeholder="e.g., 100"
                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
               />
               <span className="text-lg font-medium text-gray-700">X</span>
             </div>
             <p className="mt-1 text-sm text-gray-500">Add the character "X" automatically after the value</p>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Unit
             </label>
             <div className="flex space-x-4">
               {['microns', 'mm', 'cm', 'inch'].map((unit) => (
                 <label key={unit} className="flex items-center">
                   <input
                     type="radio"
                     name="unit"
                     value={unit}
                     checked={selectedUnit === unit}
                     onChange={(e) => setSelectedUnit(e.target.value)}
                     className="mr-2"
                   />
                   {unit}
                 </label>
               ))}
             </div>
           </div>
         </div>
       )}

      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h4 className="text-lg font-medium text-gray-900">Step 3: Point Selection</h4>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium">Image Canvas</h5>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ZoomIn size={16} />
                    <span>Hover/drag to magnify</span>
                  </div>
                </div>
                
                {uploadedImages.length > 0 ? (
                  <div className="relative">
                    <img
                      src={uploadedImages[0].url}
                      alt="Calibration Image"
                      className="w-full h-64 object-contain border border-gray-200 rounded cursor-crosshair"
                      onClick={handlePointSelection}
                    />
                    
                    {startPoint && (
                      <div
                        className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                        style={{ left: startPoint.x - 6, top: startPoint.y - 6 }}
                      />
                    )}
                    
                    {endPoint && (
                      <div
                        className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                        style={{ left: endPoint.x - 6, top: endPoint.y - 6 }}
                      />
                    )}
                    
                    {startPoint && endPoint && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line
                          x1={startPoint.x}
                          y1={startPoint.y}
                          x2={endPoint.x}
                          y2={endPoint.y}
                          stroke="red"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      </svg>
                    )}
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                    No image uploaded. Please go back to Step 1.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-medium mb-2">Instructions</h6>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MousePointer size={14} />
                    <span>Click to set start point</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MousePointer size={14} />
                    <span>Click to set end point</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h6 className="font-medium mb-2">Pixel Distance</h6>
                <div className="text-2xl font-bold text-blue-600">
                  {calculatePixelDistance().toFixed(2)} px
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h4 className="text-lg font-medium text-gray-900">Step 4: Enter Real Length</h4>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual length between points ({selectedUnit})
              </label>
              <input
                type="number"
                value={realLength}
                onChange={(e) => setRealLength(e.target.value)}
                placeholder={`e.g., 400 ${selectedUnit}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h6 className="font-medium mb-4">Computed Calibration Ratio</h6>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X-axis µm/pixel</label>
                  <div className="text-2xl font-bold text-green-600">
                    {calculateCalibrationRatio()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y-axis µm/pixel</label>
                  <div className="text-2xl font-bold text-green-600">
                    {calculateCalibrationRatio()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
            currentStep === 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

                 {currentStep < 4 ? (
           <button
             onClick={handleNextStep}
             className="px-4 py-2 rounded-md flex items-center space-x-2 bg-purple-600 text-white hover:bg-purple-700"
           >
             <span>Next</span>
             <ChevronRight size={16} />
           </button>
         ) : (
          <button
            onClick={handleSaveCalibration}
            disabled={!realLength || !magnification}
            className={`px-6 py-2 rounded-md flex items-center space-x-2 ${
              !realLength || !magnification
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Save size={16} />
            <span>Save Calibration</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calibration</h1>
          <p className="text-gray-600">Manage and create calibration settings for microscopy analysis</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('existing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'existing'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Existing Calibrations
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            New Calibration
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'existing' ? renderExistingCalibrations() : renderNewCalibrationWizard()}
    </div>
  );
};

export default Calibration;
