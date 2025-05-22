import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from '../../components/auth/AuthForm';
import FormInput from '../../components/auth/FormInput';

const TwoFactorSetupPage: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setup2FA, verify2FASetup } = useAuth();

  useEffect(() => {
    const initSetup = async () => {
      try {
        const result = await setup2FA();
        setQrCodeUrl(result.qrCodeUrl);
        setSecret(result.secret);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to setup 2FA:', err);
        setError('Failed to initialize 2FA setup. Please try again later.');
        setIsLoading(false);
      }
    };

    initSetup();
  }, [setup2FA]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await verify2FASetup(secret, verificationCode);
      
      if (result.success) {
        navigate('/dashboard', { 
          state: { message: 'Two-factor authentication has been enabled successfully!' } 
        });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthForm title="Set Up Two-Factor Authentication" error={error}>
      <div className="mt-6 space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Scan the QR code below with your authenticator app (like Google Authenticator)
            or enter the secret key manually.
          </p>
          
          <div className="flex justify-center mb-4">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code for 2FA" 
                className="border border-gray-200 rounded-md"
              />
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Secret Key:</p>
            <div className="bg-gray-100 p-2 rounded-md font-mono text-sm break-all">
              {secret}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <FormInput
            id="verificationCode"
            label="Verification Code"
            type="text"
            placeholder="Enter the 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            pattern="[0-9]{6}"
          />
          
          <div className="mt-6 flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Skip for now
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify & Enable'
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthForm>
  );
};

export default TwoFactorSetupPage;