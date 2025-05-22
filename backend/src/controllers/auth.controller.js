import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import passport from 'passport';
import * as userModel from '../models/user.model.js';
import * as emailService from '../services/email.service.js';

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const userId = await userModel.create({
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    // Return success without sending JWT (require email verification first)
    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      userId
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await userModel.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    if (user.verificationTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Update user verification status
    await userModel.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await userModel.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordTokenExpires: resetTokenExpires
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      message: 'Password reset instructions have been sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userModel.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (user.resetPasswordTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    await userModel.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpires: null
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorSecret) {
      // Generate a temporary token for 2FA verification
      const tempToken = jwt.sign(
        { id: user.id, email: user.email, twoFactorPending: true },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.status(200).json({
        needs2FA: true,
        tempToken
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user and token
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: !!user.twoFactorSecret
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
    await userModel.update(user.id, {
      verificationToken,
      verificationTokenExpires
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      message: 'Verification email has been resent'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: !!user.twoFactorSecret
      }
    });
  } catch (error) {
    next(error);
  }
};

// Enable 2FA
export const enable2FA = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a secret
    const secret = authenticator.generateSecret();
    
    // Generate QR code
    const appName = 'Digital Book Platform';
    const otpauth = authenticator.keyuri(user.email, appName, secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Store the secret temporarily (will be saved after verification)
    await userModel.storeTempSecret(user.id, secret);

    res.status(200).json({ 
      qrCodeUrl, 
      secret
    });
  } catch (error) {
    next(error);
  }
};

// Verify 2FA setup
export const verify2FASetup = async (req, res, next) => {
  try {
    const { secret, code } = req.body;
    
    // Verify the token
    const isValid = authenticator.verify({ 
      token: code, 
      secret 
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Save the secret to user's profile
    await userModel.enable2FA(req.user.id, secret);

    res.status(200).json({ 
      message: '2FA enabled successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Verify 2FA during login
export const verify2FA = async (req, res, next) => {
  try {
    const { token, code } = req.body;
    
    // Decode temporary token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if token is for 2FA
    if (!decodedToken.twoFactorPending) {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Get user
    const user = await userModel.findById(decodedToken.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'User not found or 2FA not enabled' });
    }

    // Verify the 2FA code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Generate full JWT token
    const fullToken = generateToken(user);

    // Return user and token
    res.status(200).json({
      token: fullToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth login
export const googleAuth = (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

// Google OAuth callback
export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
      }

      // Generate token
      const token = generateToken(user);

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};