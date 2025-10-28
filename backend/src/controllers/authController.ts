import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET as jwt.Secret;
  if (!jwtSecret) {
    logger.error('JWT_SECRET is not set');
    throw new AppError('Internal server error', 500);
  }

  const token = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  } as jwt.SignOptions);

  return token;
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      email, 
      password, 
      firstName = null, 
      lastName = null, 
      institution = null, 
      researchFields = null 
    } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return next(new AppError('Email already registered', 400));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, institution, research_fields)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, institution, research_fields, created_at`,
      [email, passwordHash, firstName, lastName, institution, researchFields]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    logger.info('User registered:', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        institution: user.institution,
        researchFields: user.research_fields,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, institution, 
              research_fields, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Invalid credentials', 401));
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return next(new AppError('Account is deactivated', 401));
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    const token = generateToken(user.id);

    logger.info('User logged in:', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        institution: user.institution,
        researchFields: user.research_fields,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(
      `SELECT id, email, first_name, last_name, institution, research_fields, 
              is_verified, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        institution: user.institution,
        researchFields: user.research_fields,
        isVerified: user.is_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In a stateless JWT setup, logout is handled client-side
    // Here you could implement token blacklisting if needed

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};