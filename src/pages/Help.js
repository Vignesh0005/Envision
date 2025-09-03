import React from 'react';
import { HelpCircle, BookOpen, Video, MessageCircle } from 'lucide-react';

const Help = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">Help & Documentation</h1>
        <p className="text-secondary-600 text-lg">Get started with ENVISION and learn advanced analysis techniques</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary-600" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">User Manual</h3>
          <p className="text-secondary-600 mb-4">Comprehensive guide to using ENVISION for microscopy analysis</p>
          <button className="btn-primary">View Manual</button>
        </div>

        <div className="card text-center">
          <Video className="h-12 w-12 mx-auto mb-4 text-primary-600" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Video Tutorials</h3>
          <p className="text-secondary-600 mb-4">Step-by-step video guides for all analysis modules</p>
          <button className="btn-primary">Watch Videos</button>
        </div>

        <div className="card text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary-600" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Support</h3>
          <p className="text-secondary-600 mb-4">Get help from our technical support team</p>
          <button className="btn-primary">Contact Support</button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Start Guide</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-medium text-secondary-900">1. Load an Image</h4>
            <p className="text-secondary-600">Upload a microscopy image or capture one using the camera system</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-medium text-secondary-900">2. Choose Analysis Type</h4>
            <p className="text-secondary-600">Select from metallurgical, graphite, or structural analysis</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-medium text-secondary-900">3. Run Analysis</h4>
            <p className="text-secondary-600">Execute the analysis and review results</p>
          </div>
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-medium text-secondary-900">4. Export Results</h4>
            <p className="text-secondary-600">Generate reports and export data for further analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
