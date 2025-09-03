import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Camera, 
  Database, 
  Monitor, 
  User,
  Save,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      theme: 'light',
      autoSave: true,
      notifications: true
    },
    camera: {
      defaultResolution: '1920x1080',
      frameRate: 30,
      autoExposure: true,
      autoGain: true,
      whiteBalance: 'auto'
    },
    analysis: {
      defaultMagnification: 100,
      pixelSize: 0.1,
      autoCalibration: true,
      batchProcessing: false
    },
    database: {
      autoBackup: true,
      backupInterval: 24,
      maxStorage: 10,
      compression: true
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'camera', name: 'Camera', icon: Camera },
    { id: 'analysis', name: 'Analysis', icon: Monitor },
    { id: 'database', name: 'Database', icon: Database }
  ];

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = () => {
    // In real implementation, this would save to backend/localStorage
    localStorage.setItem('envision-settings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      setSettings({
        general: {
          language: 'en',
          theme: 'light',
          autoSave: true,
          notifications: true
        },
        camera: {
          defaultResolution: '1920x1080',
          frameRate: 30,
          autoExposure: true,
          autoGain: true,
          whiteBalance: 'auto'
        },
        analysis: {
          defaultMagnification: 100,
          pixelSize: 0.1,
          autoCalibration: true,
          batchProcessing: false
        },
        database: {
          autoBackup: true,
          backupInterval: 24,
          maxStorage: 10,
          compression: true
        }
      });
      toast.success('Settings reset to default');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
          <p className="text-secondary-600">Configure system preferences and analysis parameters</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={resetSettings} className="btn-secondary">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button onClick={saveSettings} className="btn-primary">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 hover:bg-secondary-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side - Settings Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-secondary-900">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => updateSetting('general', 'language', e.target.value)}
                      className="input-field"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.general.theme}
                      onChange={(e) => updateSetting('general', 'theme', e.target.value)}
                      className="input-field"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoSave"
                      checked={settings.general.autoSave}
                      onChange={(e) => updateSetting('general', 'autoSave', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="autoSave" className="text-sm font-medium text-secondary-700">
                      Auto-save analysis results
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={settings.general.notifications}
                      onChange={(e) => updateSetting('general', 'notifications', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="notifications" className="text-sm font-medium text-secondary-700">
                      Enable notifications
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-secondary-900">Camera Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Default Resolution
                    </label>
                    <select
                      value={settings.camera.defaultResolution}
                      onChange={(e) => updateSetting('camera', 'defaultResolution', e.target.value)}
                      className="input-field"
                    >
                      <option value="640x480">640x480</option>
                      <option value="1280x720">1280x720</option>
                      <option value="1920x1080">1920x1080</option>
                      <option value="3840x2160">3840x2160</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Frame Rate
                    </label>
                    <select
                      value={settings.camera.frameRate}
                      onChange={(e) => updateSetting('camera', 'frameRate', parseInt(e.target.value))}
                      className="input-field"
                    >
                      <option value={15}>15 fps</option>
                      <option value={30}>30 fps</option>
                      <option value={60}>60 fps</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      White Balance
                    </label>
                    <select
                      value={settings.camera.whiteBalance}
                      onChange={(e) => updateSetting('camera', 'whiteBalance', e.target.value)}
                      className="input-field"
                    >
                      <option value="auto">Auto</option>
                      <option value="daylight">Daylight</option>
                      <option value="tungsten">Tungsten</option>
                      <option value="fluorescent">Fluorescent</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoExposure"
                        checked={settings.camera.autoExposure}
                        onChange={(e) => updateSetting('camera', 'autoExposure', e.target.checked)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="autoExposure" className="text-sm font-medium text-secondary-700">
                        Auto Exposure
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoGain"
                        checked={settings.camera.autoGain}
                        onChange={(e) => updateSetting('camera', 'autoGain', e.target.checked)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="autoGain" className="text-sm font-medium text-secondary-700">
                        Auto Gain
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-secondary-900">Analysis Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Default Magnification
                    </label>
                    <input
                      type="number"
                      value={settings.analysis.defaultMagnification}
                      onChange={(e) => updateSetting('analysis', 'defaultMagnification', parseInt(e.target.value))}
                      className="input-field"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Pixel Size (μm)
                    </label>
                    <input
                      type="number"
                      value={settings.analysis.pixelSize}
                      onChange={(e) => updateSetting('analysis', 'pixelSize', parseFloat(e.target.value))}
                      className="input-field"
                      step="0.01"
                      min="0.001"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoCalibration"
                      checked={settings.analysis.autoCalibration}
                      onChange={(e) => updateSetting('analysis', 'autoCalibration', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="autoCalibration" className="text-sm font-medium text-secondary-700">
                      Auto Calibration
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="batchProcessing"
                      checked={settings.analysis.batchProcessing}
                      onChange={(e) => updateSetting('analysis', 'batchProcessing', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="batchProcessing" className="text-sm font-medium text-secondary-700">
                      Enable Batch Processing
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-secondary-900">Database Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoBackup"
                      checked={settings.database.autoBackup}
                      onChange={(e) => updateSetting('database', 'autoBackup', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="autoBackup" className="text-sm font-medium text-secondary-700">
                      Auto Backup
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Backup Interval (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.database.backupInterval}
                      onChange={(e) => updateSetting('database', 'backupInterval', parseInt(e.target.value))}
                      className="input-field"
                      min="1"
                      max="168"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Max Storage (GB)
                    </label>
                    <input
                      type="number"
                      value={settings.database.maxStorage}
                      onChange={(e) => updateSetting('database', 'maxStorage', parseInt(e.target.value))}
                      className="input-field"
                      min="1"
                      max="1000"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="compression"
                      checked={settings.database.compression}
                      onChange={(e) => updateSetting('database', 'compression', e.target.checked)}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="compression" className="text-sm font-medium text-secondary-700">
                      Enable Compression
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
