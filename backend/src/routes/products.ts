import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  description: z.string().optional(),
  sku: z.string().min(1),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  description: z.string().optional(),
  sku: z.string().min(1).optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
});

// GET /api/products
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
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

// GET /api/products/:id
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw createError('Product not found', 404);
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { name, category, price, stock, description, sku } = createProductSchema.parse(req.body);

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw createError('Product with this SKU already exists', 409);
    }

    // Determine status based on stock
    let status = 'in_stock';
    if (stock === 0) {
      status = 'out_of_stock';
    } else if (stock <= 10) {
      status = 'low_stock';
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price,
        stock,
        description,
        sku,
        status,
        userId: req.user!.id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = updateProductSchema.parse(req.body);

    // If stock is being updated, recalculate status
    if (updateData.stock !== undefined) {
      if (updateData.stock === 0) {
        updateData.status = 'out_of_stock';
      } else if (updateData.stock <= 10) {
        updateData.status = 'low_stock';
      } else {
        updateData.status = 'in_stock';
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/products/categories
router.get('/meta/categories', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.json(categories.map((c: { category: string }) => c.category));
  } catch (error) {
    next(error);
  }
});

// GET /api/products/stats
router.get('/meta/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const [
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalValue
    ] = await Promise.all([
      prisma.product.count({ where: { userId: req.user!.id } }),
      prisma.product.count({ where: { status: 'in_stock', userId: req.user!.id } }),
      prisma.product.count({ where: { status: 'low_stock', userId: req.user!.id } }),
      prisma.product.count({ where: { status: 'out_of_stock', userId: req.user!.id } }),
      prisma.product.aggregate({
        where: { userId: req.user!.id },
        _sum: {
          stock: true,
        },
      }),
    ]);

    // Calculate total inventory value
    const products = await prisma.product.findMany({
      where: { userId: req.user!.id },
      select: { price: true, stock: true },
    });
    const inventoryValue = products.reduce((sum: number, product: any) => sum + (product.price * product.stock), 0);

    res.json({
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalStock: totalValue._sum.stock || 0,
      inventoryValue,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
