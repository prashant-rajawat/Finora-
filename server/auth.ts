import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { database, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'finora_production_jwt_super_secret_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    res.status(401).json({ success: false, error: 'Invalid or expired session. Please sign in again.' });
    return;
  }

  const user = database.findUserById(decoded.id);
  if (!user) {
    res.status(401).json({ success: false, error: 'User account not found.' });
    return;
  }

  req.user = user;
  next();
}
