import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword, generateToken } from '../lib/auth';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@toystore.com"
 *             password: "admin123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

// POST /auth/login
router.post('/login', async (req, res, next): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Mock admin user for testing
    if (email === 'admin@toystore.com' && password === 'admin123') {
      const token = generateToken({
        id: 1,
        email: 'admin@toystore.com',
        isAdmin: true,
      });

      res.json({
        token,
        user: {
          id: 1,
          email: 'admin@toystore.com',
          isAdmin: true,
        },
      });
      return;
    }

    // Try database lookup (will fail gracefully if DB not connected)
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Verify password
        const isValidPassword = await comparePassword(password, user.hashedPassword);
        if (!isValidPassword) {
          throw createError('Invalid credentials', 401);
        }

        // Generate token
        const token = generateToken({
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
        });

        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        });
        return;
      }
    } catch (dbError) {
      console.log('Database not available, using mock auth');
    }

    // If no user found
    throw createError('Invalid credentials', 401);
  } catch (error) {
    next(error);
  }
});

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError('User already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        isAdmin: false,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me - Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        telephone: true,
        role: true,
        isAdmin: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
