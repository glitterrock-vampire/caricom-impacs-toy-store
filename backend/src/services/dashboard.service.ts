// src/services/dashboard.service.ts
import { PrismaClient } from '@prisma/client';
const { getCountryCode } = require('../utils/location-utils');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

interface OrderStats {
  date: Date;
  count: number;
}

interface MonthlyStats {
  month: string;
  count: number;
}

export class DashboardService {
  async getDashboardStats(userId: number) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      weeklyOrders,
      monthlyOrders,
      customers
    ] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.aggregate({ 
        _sum: { totalAmount: true },
        where: { userId }
      }),
      prisma.customer.count({ where: { userId } }),
      this.getWeeklyOrderStats(userId),
      this.getMonthlyOrderStats(userId),
      prisma.customer.findMany({
        where: { userId },
        select: { country: true }
      })
    ]);

    // Process customer locations
    const countryData: Record<string, number> = {};
    customers.forEach(customer => {
      if (customer.country) {
        const code = getCountryCode(customer.country);
        if (code) {
          countryData[code] = (countryData[code] || 0) + 1;
        }
      }
    });

    return {
      total_orders: totalOrders,
      total_revenue: totalRevenue._sum.totalAmount || 0,
      total_customers: totalCustomers,
      avg_order_value: totalOrders > 0 
        ? (totalRevenue._sum.totalAmount || 0) / totalOrders 
        : 0,
      weekly_orders: weeklyOrders,
      monthly_orders: monthlyOrders,
      customer_locations: Object.entries(countryData).map(([code, count]) => ({
        code,
        count
      })),
      top_shipping_countries: await this.getTopShippingCountries(userId)
    };
  }

  private async getWeeklyOrderStats(userId: number): Promise<Array<{ day: string; count: number }>> {
    const result = await prisma.$queryRaw<OrderStats[]>`
      SELECT 
        DATE_TRUNC('day', "order_date") as date,
        COUNT(*)::int as count
      FROM "Order"
      WHERE 
        "user_id" = ${userId}
        AND "order_date" >= NOW() - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date
    `;
    return result.map((row: OrderStats) => ({
      day: new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' }),
      count: row.count
    }));
  }

  private async getMonthlyOrderStats(userId: number): Promise<MonthlyStats[]> {
    const result = await prisma.$queryRaw<MonthlyStats[]>`
      SELECT 
        TO_CHAR("order_date", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM "Order"
      WHERE "user_id" = ${userId}
      GROUP BY month
      ORDER BY month
    `;
    return result;
  }

  private async getTopShippingCountries(userId: number) {
    return prisma.$queryRaw`
      SELECT 
        delivery_address->>'country' as country,
        COUNT(*) as orders
      FROM "Order"
      WHERE 
        "user_id" = ${userId}
        AND delivery_address->>'country' IS NOT NULL
      GROUP BY delivery_address->>'country'
      ORDER BY orders DESC
      LIMIT 10
    `;
  }
}