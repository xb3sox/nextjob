import { Request, Response, NextFunction } from 'express';
import { validateSession } from '../auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        email: string;
        role: string;
      };
    }
  }
}

// ============================================================================
// Authentication Middleware
// ============================================================================

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get session token from cookie or header
    const sessionToken =
      req.cookies?.session ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate session
    const session = await validateSession(sessionToken);

    if (!session) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ error: 'Account is not active' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// ============================================================================
// Optional Authentication (doesn't fail if not authenticated)
// ============================================================================

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionToken =
      req.cookies?.session ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      next();
      return;
    }

    const session = await validateSession(sessionToken);

    if (!session) {
      next();
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if auth fails
  }
}
