import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { hashPassword } from '../lib/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// GET /api/customers
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          orders: {
            select: { id: true, status: true },
          },
        },
      }),
      prisma.customer.count(),
    ]);

    res.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        orders: {
          orderBy: {
            orderDate: 'desc',
          },
        },
      },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }

    // Remove password from response
    const { hashedPassword: _, ...customerResponse } = customer;
    res.json(customerResponse);
  } catch (error) {
    next(error);
  }
});

// POST /api/customers
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { name, email, phone, password } = createCustomerSchema.parse(req.body);

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw createError('Customer with this email already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        hashedPassword,
        owner: {
          connect: { id: req.user!.id }
        }
      },
    });

    // Remove password from response
    const { hashedPassword: _, ...customerResponse } = customer;
    res.status(201).json(customerResponse);
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = updateCustomerSchema.parse(req.body);

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Remove password from response
    const { hashedPassword: _, ...customerResponse } = customer;
    res.json(customerResponse);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customers/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id/orders
router.get('/:id/orders', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const orders = await prisma.order.findMany({
      where: { customerId: parseInt(id) },
      orderBy: { orderDate: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/orders (get all orders)
router.get('/orders', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

export default router;
