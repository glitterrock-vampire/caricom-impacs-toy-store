import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// GET /api/orders
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
        include: {
          customer: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.order.count(),
    ]);

    res.json({
      orders,
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

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate the order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingOrder) {
      throw createError('Order not found', 404);
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: updateData.status,
        items: updateData.items,
        deliveryAddress: updateData.deliveryAddress,
        deliveryDate: updateData.deliveryDate ? new Date(updateData.deliveryDate) : undefined,
        notes: updateData.notes,
        totalAmount: updateData.totalAmount,
        shippingMethod: updateData.shippingMethod,
        trackingNumber: updateData.trackingNumber,
      },
      include: {
        customer: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
