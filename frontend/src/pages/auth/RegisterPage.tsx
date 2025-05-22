import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from '../../components/auth/AuthForm';
import FormInput from '../../components/auth/FormInput';
import SocialLoginButton from '../../components/auth/SocialLoginButton';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('reader');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const validatePassword = (password: string): boolean => {
    // Password requirements: at least 8 characters, with at least one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const isValid = passwordRegex.test(password);
    
    if (!isValid) {
      setPasswordError(
        'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
      );
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await register(email, password, role);
      
      if (result.success) {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // Google OAuth registration would be implemented here
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <AuthForm title="Create your account" error={error}>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <FormInput
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          
          <FormInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            error={passwordError}
            required
          />
          
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a: <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="role"
                  value="reader"
                  checked={role === 'reader'}
                  onChange={() => setRole('reader')}
                />
                <span className="ml-2">Reader</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="role"
                  value="author"
                  checked={role === 'author'}
                  onChange={() => setRole('author')}
                />
                <span className="ml-2">Author</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Sign up'
            )}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <SocialLoginButton
            provider="google"
            onClick={handleGoogleRegister}
            isLoading={isLoading}
          />
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthForm>
  );
};

export default RegisterPage;