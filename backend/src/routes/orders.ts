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
