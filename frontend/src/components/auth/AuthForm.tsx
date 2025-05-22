import React from 'react';
import { BookOpenText, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  title: string;
  children: React.ReactNode;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, children, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpenText className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">{title}</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default AuthForm;