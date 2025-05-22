import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Digital Book Platform</h1>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Signed in as <span className="font-medium">{user?.email}</span>
            </div>
            
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">User Dashboard</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Welcome to your dashboard! Here's your account information.
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-sm font-medium text-blue-800">Account Type</h3>
                </div>
                <p className="mt-2 text-sm text-blue-700 capitalize">
                  {user?.role}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-sm font-medium text-green-800">Two-Factor Authentication</h3>
                </div>
                <p className="mt-2 text-sm text-green-700">
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
                {!user?.twoFactorEnabled && (
                  <a
                    href="/2fa/setup"
                    className="mt-2 inline-flex items-center text-xs text-green-600 hover:text-green-500"
                  >
                    Enable now
                  </a>
                )}
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="text-sm font-medium text-purple-800">Account Settings</h3>
                </div>
                <p className="mt-2 text-sm text-purple-700">
                  Manage your profile and preferences
                </p>
                <a
                  href="#"
                  className="mt-2 inline-flex items-center text-xs text-purple-600 hover:text-purple-500"
                >
                  Edit settings
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">
              {user?.role === 'author' ? 'Author Dashboard' : 
               user?.role === 'admin' ? 'Admin Dashboard' : 'Reader Dashboard'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {user?.role === 'author' 
                ? 'Manage your books and track their performance' 
                : user?.role === 'admin'
                ? 'Manage users, books, and platform settings'
                : 'Discover books and manage your reading list'}
            </p>
            
            <div className="mt-4 p-6 bg-gray-50 rounded-lg">
              <p className="text-center text-gray-500">
                Role-specific content will be displayed here in future sprints
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;