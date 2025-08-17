import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Order, OrderItem, Product, Customer } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { JWTPayload } from '../lib/auth';

// Define the AuthRequest type
type AuthRequest = Request & {
  user?: JWTPayload;
};

// Extend the Express Request type globally
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Initialize Prisma client
const prisma = new PrismaClient();

// Helper function to ensure ID is a string
const ensureStringId = (id: string | number | undefined | null): string => {
  if (id === undefined || id === null) return '';
  return typeof id === 'string' ? id : id.toString();
};


// Extended types to include relations
type OrderWithRelations = Order & {
  customer: Customer | null;
  orderItems: Array<OrderItem & { product: Product }>;
  items?: any;
};

// Define types for the order response
interface OrderItemProduct {
  id: string;
  name: string;
  price: number;
  sku: string;
}

interface OrderItemResponse {
  id: string | number;
  productId: string;
  quantity: number;
  price: number;
  product: OrderItemProduct;
}

// Create a base order type that matches the Prisma Order model
type BaseOrder = Omit<Order, 'items' | 'orderItems' | 'customer'>;

interface OrderResponse extends BaseOrder {
  items: OrderItemResponse[];
  customer?: {
    id: string | number;
    name: string;
    email: string;
    phone: string | null;
    address: any;
  };
  totalAmount: number;
}

const router = express.Router();

// POST /api/orders
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, items, deliveryAddress, deliveryDate, notes, shippingMethod } = req.body;

    // Validate required fields
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one order item is required' });
    }

    // Validate and process order items
    const orderItems = [];
    let totalAmount = 0;

    // Process each item in the order
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ error: 'Each item must have a productId and quantity' });
      }

      console.log('Processing order item:', {
        productId: item.productId,
        productIdType: typeof item.productId,
        quantity: item.quantity
      });

      // Get product details to calculate price and check stock
      let product;
      try {
        product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { 
            id: true,
            name: true,
            price: true,
            stock: true,
            status: true,
            sku: true
          }
        });
        
        console.log('Found product:', product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          status: product.status,
          sku: product.sku
        } : 'Not found');
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        console.error('Error fetching product:', {
          productId: item.productId,
          error: errorMessage,
          stack: errorStack
        });
        return res.status(500).json({ 
          error: `Error checking product with ID ${item.productId}`,
          details: errorMessage
        });
      }

      if (!product) {
        // Try to find any product in the database to check if the issue is with the ID format
        const sampleProduct = await prisma.product.findFirst();
        return res.status(404).json({ 
          error: `Product with ID "${item.productId}" not found`,
          details: {
            providedId: item.productId,
            providedIdType: typeof item.productId,
            sampleProductId: sampleProduct?.id,
            sampleProductIdType: sampleProduct ? typeof sampleProduct.id : 'N/A'
          },
          suggestion: 'Please check if the product exists and the ID format is correct'
        });
      }

      // Check if there's enough stock
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal
      });

      // Calculate new stock quantity
      const newStock = product.stock - item.quantity;
      
      // Update product stock and status
      await prisma.product.update({
        where: { id: item.productId },
        data: { 
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' : 
                 (newStock <= 10 ? 'low_stock' : 'in_stock')
        }
      });
    }

    // Generate order number in format ORD-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const orderNumber = `ORD-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`; // Random 4-digit number

    // Prepare order data
    const orderData: any = {
      customerId: Number(customerId),
      status: 'pending',
      orderDate: now,
      orderNumber,  // Add the generated order number
      totalAmount,
      shippingMethod: shippingMethod || 'standard',
      orderItems: {
        create: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total
        }))
      },
      // For backward compatibility, also store items as JSON
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.total
      }))
    };

    // Add user ID and delivery address if they exist
    if (!req.user || !req.user.id) {
      console.error('No user found in request or missing user ID:', req.user);
      return res.status(401).json({ error: 'User not properly authenticated' });
    }

    const userId = Number(req.user.id);
    if (isNaN(userId)) {
      console.error('Invalid user ID in token:', req.user.id);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      console.error('User not found in database:', userId);
      return res.status(404).json({ error: 'User account not found' });
    }
    
    orderData.userId = userId;

    if (deliveryAddress) {
      orderData.deliveryAddress = deliveryAddress;
    }

    console.log('Creating order with data:', orderData);

    const order = await prisma.order.create({
      data: orderData,
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log('Order created successfully:', order);

    // Update product stock and status
    for (const item of orderItems) {
      console.log(`Updating stock for product ${item.productId}, quantity: -${item.quantity}`);
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          status: item.quantity === 0 ? 'out_of_stock' : undefined,
        },
      });
    }

    return res.status(201).json(order);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error in POST /api/orders:', {
      message: errorMessage,
      stack: errorStack,
      requestBody: req.body,
      headers: req.headers,
      user: req.user
    });
    
    // Check for common Prisma errors
    if (error instanceof Error && 'code' in error) {
      console.error('Prisma error details:', {
        code: (error as any).code,
        meta: (error as any).meta
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while processing your request'
    });
  }
});

// GET /api/orders
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10', status } = req.query as { 
      page?: string; 
      limit?: string; 
      status?: string;
    };
    
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: { name: true, email: true },
          },
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/new - Get new order form data
router.get('/new', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Return any data needed for a new order form
    const customers = await prisma.customer.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    });
    
    const products = await prisma.product.findMany({
      where: { status: { not: 'out_of_stock' } },
      select: { id: true, name: true, price: true, stock: true },
      orderBy: { name: 'asc' }
    });

    return res.json({ customers, products });
  } catch (error) {
    console.error('Error getting new order data:', error);
    return res.status(500).json({ error: 'Failed to get new order data' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      throw createError('Invalid order ID', 400);
    }
    
    // First try to find the order with all its items and product details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Process order items
    let itemsWithProducts: OrderItemResponse[] = [];
    
    // Type assertion to include orderItems in the order object
    const orderWithItems = order as unknown as OrderWithRelations;
    
    if (orderWithItems.orderItems && orderWithItems.orderItems.length > 0) {
      // Use orderItems relation if available
      itemsWithProducts = orderWithItems.orderItems.map((item: OrderItem & { product: Product }) => ({
        id: ensureStringId(item.id),
        productId: ensureStringId(item.productId),
        quantity: item.quantity,
        price: item.unitPrice,
        product: {
          id: ensureStringId(item.product?.id) || ensureStringId(item.productId),
          name: item.product?.name || 'Product not found',
          price: item.product?.price || item.unitPrice,
          sku: item.product?.sku || 'N/A',
        },
      }));
    } else if (order.items) {
      // Fall back to items JSON if orderItems is empty
      try {
        const orderItems = Array.isArray(order.items) 
          ? order.items 
          : (typeof order.items === 'string' ? JSON.parse(order.items) : []);
          
        // Type for the parsed order item
        interface ParsedOrderItem {
          id?: string | number;
          productId: string;
          quantity?: number;
          price?: number;
        }
        
        // Fetch product details for each item
        itemsWithProducts = await Promise.all(
          (orderItems as ParsedOrderItem[]).map(async (item) => {
            try {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: {
                  id: true,
                  name: true,
                  price: true,
                  sku: true,
                },
              });

              return {
                id: ensureStringId(item.id),
                productId: ensureStringId(item.productId),
                quantity: item.quantity || 1,
                price: item.price || 0,
                product: product || {
                  id: item.productId,
                  name: 'Product not found',
                  price: item.price || 0,
                  sku: 'N/A',
                },
              };
            } catch (e) {
              console.error('Error fetching product:', e);
              return {
                id: item.id || 0,
                productId: item.productId,
                quantity: item.quantity || 1,
                price: item.price || 0,
                product: {
                  id: item.productId,
                  name: 'Error loading product',
                  price: item.price || 0,
                  sku: 'ERROR',
                },
              };
            }
          })
        );
      } catch (e) {
        console.error('Error parsing order items:', e);
        itemsWithProducts = [];
      }
    }

    // Calculate the total amount if not already set
    let totalAmount = order.totalAmount ? Number(order.totalAmount) : 0;
    
    if (itemsWithProducts.length > 0 && totalAmount <= 0) {
      totalAmount = itemsWithProducts.reduce((sum, item) => {
        const price = item.price || (item.product?.price || 0);
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
      }, 0);
    }

    // Create a response object that matches the OrderResponse type
    const response: OrderResponse = {
      ...order,
      items: itemsWithProducts,
      totalAmount,
    };
    
    // Remove orderItems from the response as it's not part of the OrderResponse type
    delete (response as any).orderItems;

    res.json(response);
  } catch (error) {
    console.error('Error in GET /api/orders/:id:', error);
    next(error);
  }
});

// PUT /api/orders/:id
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      throw createError('Invalid order ID', 400);
    }
    const updateData = req.body;

    // Validate the order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw createError('Order not found', 404);
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
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
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      throw createError('Invalid order ID', 400);
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, items]
 *             properties:
 *               customerId:
 *                 type: number
 *               items:
 *                 type: object
 *               deliveryAddress:
 *                 type: object
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Order created successfully
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order deleted successfully
 */
