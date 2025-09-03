import React, { useState } from 'react';
import { Menu, Bell, User, Search, Settings as SettingsIcon } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Analysis completed successfully', type: 'success', time: '2 min ago' },
    { id: 2, message: 'New calibration data available', type: 'info', time: '1 hour ago' }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-secondary-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden lg:block ml-4">
            {/* Header text removed */}
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search analyses, samples, or tools..."
              className="input-field pl-10 w-full"
            />
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 relative">
              <Bell className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error-500"></span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button className="p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100">
            <SettingsIcon className="h-6 w-6" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-secondary-700">User</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
