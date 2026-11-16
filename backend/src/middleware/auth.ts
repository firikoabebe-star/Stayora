import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError, asyncHandler } from '@/middleware/errorHandler';
import { prisma } from '@/lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new CustomError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new CustomError('No user found with this token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new CustomError('Not authorized to access this route', 401);
  }
});

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError(`User role ${req.user.role} is not authorized to access this route`, 403);
    }

    next();
  };
};