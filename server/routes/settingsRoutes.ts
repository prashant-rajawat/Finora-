import { Router, Response } from 'express';
import { database, UserPreferences } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';
import bcrypt from 'bcryptjs';

export const settingsRouter = Router();

// Protect all settings routes
settingsRouter.use(requireAuth);

// GET /api/settings/profile
settingsRouter.get('/profile', (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
  }
});

// PUT /api/settings/profile
settingsRouter.put('/profile', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fullName, email } = req.body;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, error: 'Full name cannot be empty.' });
      return;
    }

    const updatedUser = database.updateUserProfile(userId, {
      fullName: fullName.trim(),
      email: email ? email.trim() : undefined,
    });

    if (!updatedUser) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      },
      message: 'Profile updated successfully.',
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// GET /api/settings/preferences
settingsRouter.get('/preferences', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const preferences = database.getUserPreferences(userId);
    res.json({
      success: true,
      preferences,
    });
  } catch (err: any) {
    console.error('Get preferences error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve preferences.' });
  }
});

// PUT /api/settings/preferences
settingsRouter.put('/preferences', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updates = req.body;

    const updated = database.updateUserPreferences(userId, updates);
    res.json({
      success: true,
      preferences: updated,
      message: 'Preferences saved successfully.',
    });
  } catch (err: any) {
    console.error('Update preferences error:', err);
    res.status(500).json({ success: false, error: 'Failed to save preferences.' });
  }
});

// GET /api/settings/security
settingsRouter.get('/security', (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    res.json({
      success: true,
      security: {
        email: user.email,
        isEmailVerified: true,
        authType: 'JWT Bearer Token',
        mfaEnabled: false,
        lastPasswordUpdate: user.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('Security status error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve security status.' });
  }
});

// POST /api/settings/password
settingsRouter.post('/password', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ success: false, error: 'All password fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, error: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    database.updateUserPassword(user.id, newHash);

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, error: 'Failed to change password.' });
  }
});

// DELETE /api/settings/account
settingsRouter.delete('/account', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const success = database.deleteAccount(userId);
    if (!success) {
      res.status(404).json({ success: false, error: 'Account not found.' });
      return;
    }
    res.json({
      success: true,
      message: 'Account and associated records successfully deleted.',
    });
  } catch (err: any) {
    console.error('Delete account error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete account.' });
  }
});
