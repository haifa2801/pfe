import db from '../config/database.js';

// Find user by email
export const findByEmail = async (email) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

// Find user by ID
export const findById = async (id) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
};

// Create a new user
export const create = async (userData) => {
  try {
    const { email, password, role, isVerified } = userData;
    const [result] = await db.query(
      'INSERT INTO users (email, password, role, is_verified) VALUES (?, ?, ?, ?)',
      [email, password, role, isVerified]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Store temporary 2FA secret
export const storeTempSecret = async (userId, secret) => {
  try {
    await db.query(
      'UPDATE users SET temp_two_factor_secret = ? WHERE id = ?',
      [secret, userId]
    );
    return true;
  } catch (error) {
    console.error('Error storing temp 2FA secret:', error);
    throw error;
  }
};

// Enable 2FA for user
export const enable2FA = async (userId, secret) => {
  try {
    await db.query(
      'UPDATE users SET two_factor_secret = ? WHERE id = ?',
      [secret, userId]
    );
    return true;
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    throw error;
  }
};

// Update user information
export const update = async (userId, userData) => {
  try {
    const { email, password, role, isVerified, twoFactorSecret } = userData;
    
    let query = 'UPDATE users SET ';
    const params = [];
    
    if (email) {
      query += 'email = ?, ';
      params.push(email);
    }
    
    if (password) {
      query += 'password = ?, ';
      params.push(password);
    }
    
    if (role) {
      query += 'role = ?, ';
      params.push(role);
    }
    
    if (isVerified !== undefined) {
      query += 'is_verified = ?, ';
      params.push(isVerified);
    }
    
    if (twoFactorSecret) {
      query += 'two_factor_secret = ?, ';
      params.push(twoFactorSecret);
    }
    
    // Remove trailing comma and space
    query = query.slice(0, -2);
    
    // Add WHERE clause
    query += ' WHERE id = ?';
    params.push(userId);
    
    await db.query(query, params);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Find or create user from OAuth (Google)
export const findOrCreateFromOAuth = async (profile) => {
  try {
    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [profile.email]
    );
    
    if (existingUsers.length > 0) {
      // User exists, update login info if needed
      return existingUsers[0];
    }
    
    // User doesn't exist, create new user
    const [result] = await db.query(
      'INSERT INTO users (email, password, role, is_verified, oauth_provider, oauth_id) VALUES (?, NULL, ?, 1, ?, ?)',
      [profile.email, 'reader', 'google', profile.id]
    );
    
    const [newUser] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );
    
    return newUser[0];
  } catch (error) {
    console.error('Error finding or creating OAuth user:', error);
    throw error;
  }
};