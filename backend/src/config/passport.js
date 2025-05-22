import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as userModel from '../models/user.model.js';

export const configurePassport = (passport) => {
  // JWT Strategy
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key'
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        // Check if token has 2FA pending flag
        if (payload.twoFactorPending) {
          return done(null, false, { message: '2FA verification required' });
        }

        // Find user by ID
        const user = await userModel.findById(payload.id);
        
        if (user) {
          return done(null, user);
        }
        
        return done(null, false, { message: 'User not found' });
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.API_URL}/auth/google/callback`,
          scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Extract profile information
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            
            if (!email) {
              return done(new Error('Email not available from Google profile'), null);
            }
            
            // Create user object from profile
            const oauthProfile = {
              id: profile.id,
              email: email,
              displayName: profile.displayName
            };
            
            // Find or create user
            const user = await userModel.findOrCreateFromOAuth(oauthProfile);
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
};