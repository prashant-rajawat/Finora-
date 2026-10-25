import { Router, Response } from 'express';
import { database } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const notificationRouter = Router();

// Protect all notification endpoints
notificationRouter.use(requireAuth);

// GET /api/notifications - List user's notifications
notificationRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { unreadOnly, category, search } = req.query;

    const result = database.getNotifications(userId, {
      unreadOnly: unreadOnly === 'true',
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
    });

    res.json({
      success: true,
      unreadCount: result.unreadCount,
      notifications: result.notifications,
    });
  } catch (err: any) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count - Fast lookup for header badge
notificationRouter.get('/unread-count', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const unreadCount = database.getUnreadNotificationCount(userId);
    res.json({ success: true, unreadCount });
  } catch (err: any) {
    console.error('Failed to fetch unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// PATCH /api/notifications/:id/read - Mark single notification read
notificationRouter.patch('/:id/read', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifId = req.params.id;

    const notif = database.markNotificationAsRead(userId, notifId);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const unreadCount = database.getUnreadNotificationCount(userId);

    res.json({
      success: true,
      notification: notif,
      unreadCount,
      message: 'Notification marked as read',
    });
  } catch (err: any) {
    console.error('Failed to mark notification read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// POST /api/notifications/mark-all-read - Mark all user notifications read
notificationRouter.post('/mark-all-read', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updatedCount = database.markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      updatedCount,
      unreadCount: 0,
      message: 'All notifications marked as read',
    });
  } catch (err: any) {
    console.error('Failed to mark all notifications read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// DELETE /api/notifications/:id - Dismiss notification
notificationRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifId = req.params.id;

    const deleted = database.deleteNotification(userId, notifId);
    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const unreadCount = database.getUnreadNotificationCount(userId);

    res.json({
      success: true,
      unreadCount,
      message: 'Notification dismissed',
    });
  } catch (err: any) {
    console.error('Failed to delete notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// POST /api/notifications/process-events - Trigger automated event detector
notificationRouter.post('/process-events', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = database.generateFinancialNotifications(userId);

    const updatedNotifications = database.getNotifications(userId);

    res.json({
      success: true,
      createdCount: result.createdCount,
      unreadCount: updatedNotifications.unreadCount,
      details: result.details,
    });
  } catch (err: any) {
    console.error('Failed to process financial notification events:', err);
    res.status(500).json({ error: 'Failed to process financial events' });
  }
});
