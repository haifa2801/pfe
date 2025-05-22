import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from '../../components/auth/AuthForm';
import FormInput from '../../components/auth/FormInput';

const TwoFactorVerifyPage: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { verify2FA, tempToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempToken) {
      setError('Authentication session expired. Please log in again.');
      navigate('/login');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      const result = await verify2FA(tempToken, verificationCode);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm title="Two-Factor Authentication" error={error}>
      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-6">
          Enter the 6-digit verification code from your authenticator app to continue.
        </p>
        
        <form onSubmit={handleSubmit}>
          <FormInput
            id="verificationCode"
            label="Verification Code"
            type="text"
            placeholder="Enter the 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            autoFocus
            pattern="[0-9]{6}"
          />
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify'
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </AuthForm>
  );
};

export default TwoFactorVerifyPage;