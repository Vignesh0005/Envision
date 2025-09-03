import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Image, 
  Microscope, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState([
    {
      id: 1,
      name: 'Steel Sample A-001',
      type: 'Metallurgical Analysis',
      status: 'completed',
      date: '2024-01-15',
      results: 'Porosity: 2.3%, Phase A: 45%, Phase B: 55%'
    },
    {
      id: 2,
      name: 'Cast Iron B-002',
      type: 'Graphite Analysis',
      status: 'in_progress',
      date: '2024-01-15',
      results: 'Nodularity: 85%, Flake Type: A'
    },
    {
      id: 3,
      name: 'Aluminum C-003',
      type: 'Structural Analysis',
      status: 'completed',
      date: '2024-01-14',
      results: 'Grain Size: 15μm, Dendritic Spacing: 25μm'
    }
  ]);

  const [systemStatus, setSystemStatus] = useState({
    camera: 'online',
    processing: 'online',
    database: 'online',
    calibration: 'warning'
  });

  const quickActions = [
    {
      name: 'Camera Capture',
      description: 'Start real-time microscopy capture',
      icon: Camera,
      path: '/camera',
      color: 'primary'
    },
    {
      name: 'Image Processing',
      description: 'Enhance and filter images',
      icon: Image,
      path: '/processing',
      color: 'secondary'
    },
    {
      name: 'Metallurgical Analysis',
      description: 'Analyze porosity and phases',
      icon: Microscope,
      path: '/metallurgical',
      color: 'success'
    },
    {
      name: 'Graphite Analysis',
      description: 'Assess nodularity and flakes',
      icon: Layers,
      path: '/graphite',
      color: 'warning'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error-500" />;
      default:
        return <Info className="h-5 w-5 text-secondary-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success-600';
      case 'warning':
        return 'text-warning-600';
      case 'error':
        return 'text-error-600';
      default:
        return 'text-secondary-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-2">
          Welcome to ENVISION
        </h1>
        <p className="text-secondary-600 text-lg">
          Advanced Microscopy Image Analysis System for Materials Science
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.name}
              onClick={() => navigate(action.path)}
              className="card hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                  <Icon className={`h-8 w-8 text-${action.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-secondary-500">{action.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status and Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
            System Status
          </h3>
          <div className="space-y-3">
            {Object.entries(systemStatus).map(([component, status]) => (
              <div key={component} className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700 capitalize">
                  {component}
                </span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-500" />
            Recent Analyses
          </h3>
          <div className="space-y-4">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-900">{analysis.name}</h4>
                    <p className="text-sm text-secondary-600">{analysis.type}</p>
                    <p className="text-sm text-secondary-500 mt-1">{analysis.results}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`status-indicator ${
                      analysis.status === 'completed' ? 'status-success' : 'status-warning'
                    }`}>
                      {analysis.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="text-xs text-secondary-400">{analysis.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">156</div>
          <div className="text-secondary-600">Total Analyses</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-success-600 mb-2">98.7%</div>
          <div className="text-secondary-600">Success Rate</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-warning-600 mb-2">2.3s</div>
          <div className="text-secondary-600">Avg. Processing Time</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
