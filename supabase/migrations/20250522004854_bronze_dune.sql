-- Add new columns for email verification and password reset
ALTER TABLE users
ADD COLUMN verification_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN verification_token_expires TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN reset_password_token_expires TIMESTAMP NULL DEFAULT NULL;

-- Add indexes for tokens
CREATE INDEX idx_verification_token ON users(verification_token);
CREATE INDEX idx_reset_password_token ON users(reset_password_token);