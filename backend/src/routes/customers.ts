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
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  // Also allow direct fields for backward compatibility
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
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
        id: parseInt(id) || 0,
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
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    const updateData = updateCustomerSchema.parse(req.body);
    console.log('Parsed update data:', JSON.stringify(updateData, null, 2));

    // Check if customer exists first
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCustomer) {
      console.error('Customer not found:', id);
      return next(createError('Customer not found', 404));
    }

    // Define type-safe update payload
    type UpdatePayload = {
      name?: string;
      email?: string;
      phone?: string | null;
      address?: any; // JSON field for address
      country?: string | null;
      status?: string;
    };

    const updatePayload: UpdatePayload = {};

    // Add basic fields if they exist in the request
    if (updateData.name !== undefined) updatePayload.name = updateData.name;
    if (updateData.email !== undefined) updatePayload.email = updateData.email;
    if (updateData.phone !== undefined) updatePayload.phone = updateData.phone;
    if (updateData.country !== undefined) updatePayload.country = updateData.country;
    // Status field is not part of the Customer model, so we don't include it

    // Handle address fields - combine into a single address JSON object
    const addressFields = {
      street: updateData.street,
      city: updateData.city,
      state: updateData.state,
      postalCode: updateData.postalCode,
      country: updateData.country
    };
    
    // Check if any address fields are present
    const hasAddressFields = Object.values(addressFields).some(field => field !== undefined);
    
    if (hasAddressFields) {
      updatePayload.address = {
        ...(updatePayload.address || {}),
        ...(addressFields.street !== undefined && { street: addressFields.street }),
        ...(addressFields.city !== undefined && { city: addressFields.city }),
        ...(addressFields.state !== undefined && { state: addressFields.state }),
        ...(addressFields.postalCode !== undefined && { postalCode: addressFields.postalCode }),
        ...(addressFields.country !== undefined && { country: addressFields.country })
      };
    }

    console.log('Final update payload:', JSON.stringify(updatePayload, null, 2));

    if (Object.keys(updatePayload).length === 0) {
      return next(createError('No valid fields provided for update', 400));
    }

    // Perform the update
    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updatePayload,
    });

    const { hashedPassword: _, ...customerResponse } = customer;
    res.json(customerResponse);
  } catch (error: unknown) {
    console.error('Error in customer update route:');
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('Request params:', JSON.stringify(req.params, null, 2));
    
    if (error instanceof Error) {
      // Log the complete error object with all properties
      const errorDetails: any = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
      
      // Include all properties from the error object
      Object.getOwnPropertyNames(error).forEach(key => {
        errorDetails[key] = (error as any)[key];
      });
      
      // Log Prisma-specific errors if available
      if ('code' in error) {
        const prismaError = error as any;
        console.error('Prisma error code:', prismaError.code);
        console.error('Prisma error meta:', JSON.stringify(prismaError.meta, null, 2));
      }
      
      console.error('Complete error details:', JSON.stringify(errorDetails, null, 2));
      
      // Log the full error object for debugging
      console.error('Raw error object:', error);
      
      // Handle Prisma errors
      if ('code' in error) {
        const prismaError = error as any;
        errorDetails.code = prismaError.code;
        errorDetails.meta = prismaError.meta;
        
        // Log Prisma error details
        console.error('Prisma error code:', prismaError.code);
        console.error('Prisma error meta:', JSON.stringify(prismaError.meta, null, 2));
        
        // Handle specific Prisma error codes
        if (prismaError.code === 'P2002') {
          // Unique constraint violation
          const target = prismaError.meta?.target || [];
          const field = target[0] || 'field';
          return next(createError(`A customer with this ${field} already exists`, 400));
        } else if (prismaError.code === 'P2025') {
          // Record not found
          return next(createError('Customer not found', 404));
        } else if (prismaError.code === 'P2003') {
          // Foreign key constraint failed
          return next(createError('Invalid reference in customer data', 400));
        }
      }
      
      console.error('Error details:', errorDetails);
      
      // Pass the error to the error handling middleware with more context
      if (!res.headersSent) {
        return next(createError(`Failed to update customer: ${error.message}`, 500));
      }
    } else {
      console.error('Unknown error type:', error);
      if (!res.headersSent) {
        return next(createError('An unknown error occurred while updating customer', 500));
      }
    }
  }
});


// DELETE /api/customers/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id: parseInt(id) || 0 },
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
      where: { customerId: parseInt(id) || 0 },
      orderBy: { orderDate: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          include: {
            product: {
              select: { price: true }
            }
          }
        }
      },
    });

    // Calculate total amount for each order
    const ordersWithTotal = orders.map(order => {
      const total = order.items && typeof order.items === 'object' && Array.isArray(order.items)
        ? (order.items as any[]).reduce((sum: number, item: any) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (price * quantity);
          }, 0)
        : 0;

      return {
        ...order,
        totalAmount: parseFloat(total.toFixed(2))
      };
    });

    res.json(ordersWithTotal);
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
        orderItems: {
          include: {
            product: {
              select: {
                price: true
              }
            }
          }
        }
      },
    });

    // Calculate total for each order
    const ordersWithTotal = orders.map(order => {
      const total = order.orderItems?.reduce((sum, item) => {
        const price = Number(item.unitPrice) || Number(item.product?.price) || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
      }, 0) || 0;

      return {
        ...order,
        totalAmount: parseFloat(total.toFixed(2)) // Ensure 2 decimal places
      };
    });

    res.json(ordersWithTotal);
  } catch (error) {
    next(error);
  }
});

export default router;
