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

// Find user by verification token
export const findByVerificationToken = async (token) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE verification_token = ?',
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by verification token:', error);
    throw error;
  }
};

// Find user by reset password token
export const findByResetToken = async (token) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE reset_password_token = ?',
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by reset token:', error);
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
    const { 
      email, 
      password, 
      role, 
      isVerified, 
      verificationToken, 
      verificationTokenExpires 
    } = userData;
    
    const [result] = await db.query(
      `INSERT INTO users (
        email, 
        password, 
        role, 
        is_verified, 
        verification_token, 
        verification_token_expires
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password, role, isVerified, verificationToken, verificationTokenExpires]
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
    const updates = [];
    const values = [];
    
    // Build dynamic update query
    Object.entries(userData).forEach(([key, value]) => {
      // Convert camelCase to snake_case for database columns
      const column = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updates.push(`${column} = ?`);
      values.push(value);
    });
    
    values.push(userId); // Add userId for WHERE clause
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `;
    
    await db.query(query, values);
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