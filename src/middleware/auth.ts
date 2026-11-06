import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  isApiKeyClient?: boolean;
}

const N8N_API_KEY = process.env.N8N_API_KEY || '9oi?9JFo7"K£33:zwiE6Y(}9<[+|Ta=X&';

/**
 * Enforces mandatory Firebase ID token verification
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
};

/**
 * Optional token verification: attaches user if token is present and valid
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      req.user = decoded;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};

/**
 * Accepts either Firebase Token OR n8n X-API-Key (ideal for automated n8n pipeline triggers)
 */
export const requireApiKeyOrAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === N8N_API_KEY) {
    req.isApiKeyClient = true;
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (err) {
      console.error('Invalid token in requireApiKeyOrAuth:', err);
    }
  }

  res.status(401).json({
    error: 'Unauthorized: Request requires either a valid Firebase Bearer token or n8n X-API-Key header.',
  });
};
