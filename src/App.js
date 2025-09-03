import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import CameraCapture from './pages/CameraCapture';
import ImageProcessing from './pages/ImageProcessing';
import MetallurgicalAnalysis from './pages/MetallurgicalAnalysis';
import GraphiteAnalysis from './pages/GraphiteAnalysis';
import StructuralAnalysis from './pages/StructuralAnalysis';
import Calibration from './pages/Calibration';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AnnotationDemo from './pages/AnnotationDemo';
import './index.css';

function App() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(window.electronAPI !== undefined);
    
    if (window.electronAPI) {
      // Setup Electron menu event listeners
      const cleanupFunctions = [];
      
      const setupListener = (eventName, callback) => {
        window.electronAPI[eventName](callback);
        cleanupFunctions.push(() => 
          window.electronAPI.removeAllListeners(eventName)
        );
      };
      
      setupListener('onMenuOpenImage', () => {
        // Handle menu open image
        console.log('Menu: Open Image');
      });
      
      setupListener('onMenuSaveAnalysis', () => {
        // Handle menu save analysis
        console.log('Menu: Save Analysis');
      });
      
      setupListener('onMenuCameraCapture', () => {
        // Handle menu camera capture
        console.log('Menu: Camera Capture');
      });
      
      setupListener('onMenuImageProcessing', () => {
        // Handle menu image processing
        console.log('Menu: Image Processing');
      });
      
      setupListener('onMenuMetallurgicalAnalysis', () => {
        // Handle menu metallurgical analysis
        console.log('Menu: Metallurgical Analysis');
      });
      
      // Cleanup function
      return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
      };
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/camera" element={<CameraCapture />} />
            <Route path="/image-processing" element={<ImageProcessing />} />
            <Route path="/metallurgical-analysis" element={<MetallurgicalAnalysis />} />
            <Route path="/graphite-analysis" element={<GraphiteAnalysis />} />
            <Route path="/structural-analysis" element={<StructuralAnalysis />} />
            <Route path="/calibration" element={<Calibration />} />
            <Route path="/annotation-demo" element={<AnnotationDemo />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
