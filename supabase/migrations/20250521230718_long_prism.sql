-- Database schema for Digital Book Platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role ENUM('author', 'reader', 'admin') NOT NULL DEFAULT 'reader',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  temp_two_factor_secret VARCHAR(255),
  oauth_provider ENUM('google') DEFAULT NULL,
  oauth_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Add constraints
ALTER TABLE users
  ADD CONSTRAINT unique_oauth_user UNIQUE (oauth_provider, oauth_id);