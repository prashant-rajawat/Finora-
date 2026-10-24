import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { database } from '../db.js';
import { generateToken, requireAuth, AuthRequest } from '../auth.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, error: 'Passwords do not match.' });
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      return;
    }

    // Check existing
    const existing = database.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = database.createUser(fullName.trim(), email.trim(), passwordHash);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Please enter your email and password.' });
      return;
    }

    const user = database.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'An unexpected error occurred during sign in.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

// PUT /api/auth/profile
authRouter.put('/profile', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email } = req.body;
    const user = req.user!;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, error: 'Name cannot be empty.' });
      return;
    }

    // If changing email, check uniqueness
    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = database.findUserByEmail(email);
      if (existing) {
        res.status(409).json({ success: false, error: 'This email is already in use by another account.' });
        return;
      }
    }

    const updated = database.updateUserProfile(user.id, {
      fullName: fullName.trim(),
      email: email ? email.trim() : undefined,
    });

    res.json({
      success: true,
      user: {
        id: updated!.id,
        fullName: updated!.fullName,
        email: updated!.email,
        createdAt: updated!.createdAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      res.status(400).json({ success: false, error: 'Please enter your registered email address.' });
      return;
    }

    const token = database.createPasswordResetToken(email.trim());
    if (!token) {
      // Security standard: don't reveal if email exists, but give guidance
      res.status(404).json({
        success: false,
        error: 'No account found with this email address.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Password reset code generated. Use this code to reset your password.',
      resetCode: token,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, error: 'Failed to process password reset request.' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', (req, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, error: 'Reset code and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({ success: false, error: 'Passwords do not match.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const newPasswordHash = bcrypt.hashSync(newPassword, salt);

    const user = database.resetPasswordWithToken(token.trim(), newPasswordHash);
    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset code. Please request a new code.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
