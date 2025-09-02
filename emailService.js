const pool = require('./db');
const nodemailer = require('nodemailer');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
require('dotenv').config();

class EmailService {
  constructor() {
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      // Initialize Mailgun
      const mailgun = new Mailgun(formData);
      this.mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY
      });
      this.domain = process.env.MAILGUN_DOMAIN;
      console.log('Email service initialized with Mailgun');
    } else {
      // Fallback to Ethereal for development
    this.createDevTransporter();
    }
  }

  async createDevTransporter() {
    // Create a test account at Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a transporter using Ethereal credentials
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('Email service initialized with Ethereal SMTP (Development Mode)');
    console.log('Ethereal Email credentials:', {
      user: testAccount.user,
      pass: testAccount.pass
    });
  }

  async sendVerificationEmail(email, token) {
    try {
      console.log('\n[DEBUG] Starting sendVerificationEmail');
      console.log('[DEBUG] Email:', email);
      console.log('[DEBUG] Token:', token);

      const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
      
      if (this.mg) {
        // Send email using Mailgun
        const data = {
          from: 'TradeTalent <verification@tradetalent.com>',
          to: email,
          subject: 'Verify your TradeTalent Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Welcome to TradeTalent! 🎉</h2>
              <p>Thank you for signing up. Please verify your email address to get started.</p>
              <div style="margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #3498db; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 5px;
                          display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="color: #7f8c8d; word-break: break-all;">${verificationLink}</p>
              <p style="color: #95a5a6; font-size: 0.9em; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          `
        };

        await this.mg.messages.create(this.domain, data);
        console.log('[DEBUG] Email sent successfully via Mailgun');
      } else {
        // Fallback to Ethereal
      const info = await this.transporter.sendMail({
        from: '"TradeTalent" <no-reply@tradetalent.com>',
        to: email,
        subject: 'Verify your TradeTalent Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Welcome to TradeTalent! 🎉</h2>
            <p>Thank you for signing up. Please verify your email address to get started.</p>
            <div style="margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #3498db; 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #7f8c8d; word-break: break-all;">${verificationLink}</p>
            <p style="color: #95a5a6; font-size: 0.9em; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        `
      });

        console.log('\n[DEBUG] Email sent successfully via Ethereal');
      console.log('[DEBUG] Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      // Store token in database with timestamp
      const storeTokenQuery = `
        UPDATE users 
        SET verification_token = ?,
            token_created_at = NOW()
        WHERE email = ? AND is_verified = FALSE`;

      return new Promise((resolve, reject) => {
        pool.query(storeTokenQuery, [token, email], (err) => {
          if (err) {
            console.error('[DEBUG] Error storing verification token:', err);
            reject(err);
            return;
          }
          console.log('[DEBUG] Verification token stored successfully');
          resolve(true);
        });
      });
    } catch (error) {
      console.error('[DEBUG] Error in sendVerificationEmail:', error);
      throw error;
    }
  }

  async verifyEmail(token) {
    return new Promise((resolve, reject) => {
      console.log('\n[DEBUG] Starting verifyEmail');
      console.log('[DEBUG] Token:', token);

      // Query to check both current verification status and history
      const verifyQuery = `
        SELECT 
          u.id,
          u.email,
          u.username,
          u.role,
          u.is_verified,
          u.token_created_at,
          vh.verified_at
        FROM users u
        LEFT JOIN users_verification_history vh ON vh.token = ? AND vh.user_id = u.id
        WHERE u.verification_token = ? OR vh.id IS NOT NULL
        LIMIT 1`;

      pool.query(verifyQuery, [token, token], async (err, results) => {
        if (err) {
          console.error('[DEBUG] Database error during verification:', err);
          return reject({ status: 500, message: 'Internal server error during verification.' });
        }

        console.log('[DEBUG] Query results:', JSON.stringify(results, null, 2));

        if (!results || results.length === 0) {
          console.log('[DEBUG] No user found with this token');
          return reject({ status: 400, message: 'Invalid verification token. Please request a new verification email.' });
        }

        const user = results[0];
        console.log('[DEBUG] Found user:', user.email);

        // If we found a verification history record, the email was already verified
        if (user.verified_at) {
          console.log('[DEBUG] Token was previously used for verification at:', user.verified_at);
          return resolve({
            status: 200,
            message: 'Email already verified successfully! Please proceed to login.',
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        }

        // Check if user is already verified (but through a different token)
        if (user.is_verified) {
          console.log('[DEBUG] User is already verified:', user.email);
          return resolve({
            status: 200,
            message: 'Email already verified. You can now login.',
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        }

        // Check token expiration (24 hours)
        if (user.token_created_at) {
          const tokenCreatedAt = new Date(user.token_created_at);
          const now = new Date();
          const tokenAge = now - tokenCreatedAt;
          const tokenExpired = tokenAge > 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          if (tokenExpired) {
            console.log('[DEBUG] Token has expired');
            return reject({ status: 400, message: 'Verification link has expired. Please request a new one.' });
          }
        }

        // Begin transaction to update user and store verification history
        pool.getConnection((connErr, connection) => {
          if (connErr) {
            console.error('[DEBUG] Error getting connection:', connErr);
            return reject({ status: 500, message: 'Database connection error.' });
          }

          connection.beginTransaction(async (transErr) => {
            if (transErr) {
              connection.release();
              return reject({ status: 500, message: 'Transaction error.' });
            }

            try {
              console.log('[DEBUG] Starting verification transaction');
              
              // 1. Update user verification status
              await new Promise((resolve, reject) => {
                connection.query(
                  'UPDATE users SET is_verified = TRUE, verification_token = NULL, token_created_at = NULL WHERE id = ?',
                  [user.id],
                  (err) => err ? reject(err) : resolve()
                );
              });
              console.log('[DEBUG] User verification status updated');

              // 2. Store verification history
              await new Promise((resolve, reject) => {
                connection.query(
                  'INSERT INTO users_verification_history (user_id, token, verified_at) VALUES (?, ?, NOW())',
                  [user.id, token],
                  (err) => err ? reject(err) : resolve()
                );
              });
              console.log('[DEBUG] Verification history stored');

              // Commit transaction
              await new Promise((resolve, reject) => {
                connection.commit((err) => err ? reject(err) : resolve());
              });

              console.log('[DEBUG] Successfully verified user:', user.email);
              console.log('[DEBUG] Transaction committed');

              resolve({
                status: 200,
                message: 'Email verified successfully!',
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  role: user.role
                }
              });

            } catch (error) {
              console.error('[DEBUG] Transaction failed:', error);
              connection.rollback(() => {
                reject({ status: 500, message: 'Failed to verify email.' });
              });
            } finally {
              connection.release();
            }
          });
        });
      });
    });
  }

  async sendPasswordResetEmail(email, token) {
    try {
      console.log('\n[DEBUG] Starting sendPasswordResetEmail');
      console.log('[DEBUG] Email:', email);
      console.log('[DEBUG] Token:', token);

      const resetLink = `http://localhost:3000/reset-password?token=${token}`;
      
      if (this.mg) {
        // Send email using Mailgun
        const data = {
          from: 'TradeTalent <noreply@tradetalent.com>',
          to: email,
          subject: 'Reset Your TradeTalent Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Reset Your Password</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <div style="margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #3498db; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 5px;
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="color: #7f8c8d; word-break: break-all;">${resetLink}</p>
              <p style="color: #95a5a6; font-size: 0.9em; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          `
        };

        await this.mg.messages.create(this.domain, data);
        console.log('[DEBUG] Password reset email sent successfully via Mailgun');
      } else {
        // Fallback to Ethereal
        const info = await this.transporter.sendMail({
          from: '"TradeTalent" <no-reply@tradetalent.com>',
          to: email,
          subject: 'Reset Your TradeTalent Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Reset Your Password</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <div style="margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #3498db; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 5px;
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="color: #7f8c8d; word-break: break-all;">${resetLink}</p>
              <p style="color: #95a5a6; font-size: 0.9em; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          `
        });

        console.log('\n[DEBUG] Password reset email sent successfully via Ethereal');
        console.log('[DEBUG] Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('[DEBUG] Error in sendPasswordResetEmail:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 