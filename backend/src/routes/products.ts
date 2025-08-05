import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `product-${uuidv4()}${ext}`);
    },
  }),
});

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  description: z.string().optional(),
  sku: z.string().min(1),
  gender: z.enum(['boys', 'girls', 'unisex']).optional().default('unisex'),
  ageRange: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).default('in_stock')
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  description: z.string().optional(),
  sku: z.string().min(1).optional(),
  gender: z.enum(['boys', 'girls', 'unisex']).optional(),
  ageRange: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).optional(),
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
router.post('/', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res, next) => {
  try {
    const { name, category, price, stock, description, sku, gender, ageRange } = createProductSchema.parse({
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock ? parseInt(req.body.stock, 10) : undefined,
    });

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      // If there was a file uploaded but the product already exists, delete it
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      throw createError('Product with this SKU already exists', 409);
    }

    // Determine status based on stock
    let status = 'in_stock';
    if (stock === 0) {
      status = 'out_of_stock';
    } else if (stock <= 10) {
      status = 'low_stock';
    }

    // Handle file upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${path.basename(req.file.path)}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
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
        gender,
        ageRange,
        imageUrl,
        userId: req.user!.id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Parse and validate the request body
    const updateData = updateProductSchema.parse({
      ...req.body,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : undefined,
    });
    
    // If a new image was uploaded, update the image URL
    if (req.file) {
      updateData.imageUrl = `/uploads/${path.basename(req.file.path)}`;
      
      // Delete the old image if it exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { imageUrl: true }
      });
      
      if (existingProduct?.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', existingProduct.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, () => {});
        }
      }
    }

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
    
    // Get the product first to check for an image
    const product = await prisma.product.findUnique({
      where: { id },
      select: { imageUrl: true }
    });
    
    // Delete the product
    await prisma.product.delete({
      where: { id },
    });
    
    // If the product had an image, delete it
    if (product?.imageUrl) {
      const imagePath = path.join(__dirname, '../../', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting image:', err);
        });
      }
    }

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
