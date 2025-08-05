import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword, generateToken } from '../lib/auth';
import { createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';

const router = express.Router();

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

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  isAdmin: z.boolean().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  telephone: z.string().optional(),
  isAdmin: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// POST /auth/login
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
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
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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

    // Try database lookup
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        const isValidPassword = await comparePassword(password, user.hashedPassword);
        if (!isValidPassword) {
          throw createError('Invalid credentials', 401);
        }

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

    throw createError('Invalid credentials', 401);
  } catch (error) {
    next(error);
  }
});

// POST /auth/register
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError('User already exists', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        isAdmin: false,
      },
    });

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

// GET /auth/profile
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const userId = req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          telephone: true,
          isAdmin: true,
          role: true,
          createdAt: true,
          lastLogin: true
        }
      });

      if (user) {
        res.json({ user });
        return;
      }
    } catch (dbError) {
      console.log('Database not available, using token data');
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
        name: 'Admin User'
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/users - Get all users (Admin only)
/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        telephone: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// POST /auth/users - Create new user (Admin only)
router.post('/users', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { email, password, name, isAdmin = false } = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError('User already exists', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        isAdmin,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /auth/users/:id - Update user
router.put('/users/:id', authenticate, async (req: AuthRequest, res, next): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = updateUserSchema.parse(req.body);

    // Check if user can update (self or admin)
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      res.status(403).json({ error: 'Unauthorized to update this user' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        telephone: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /auth/users/:id - Delete user (Admin only)
router.delete('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (req.user?.id === userId) {
      throw createError('Cannot delete your own account', 400);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
