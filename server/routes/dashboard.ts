// server/routes/dashboard.ts
import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Get today's orders count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISOString = today.toISOString();
    
    const [todayOrdersCount] = await sql`
      SELECT COUNT(*) as count
      FROM orders
      WHERE created_at >= ${todayISOString}
    `;
    
    // Get total revenue
    const [totalRevenue] = await sql`
      SELECT SUM(total_price) as sum
      FROM orders
    `;
    
    // Get orders by month for the current year
    const currentYear = today.getFullYear();
    const ordersByMonth = await sql`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as count,
        SUM(total_price) as revenue
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    
    // Get recent orders
    const recentOrders = await sql`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    // Get orders by status
    const ordersByStatus = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders
      GROUP BY status
    `;
    
    res.render('dashboard', {
      title: 'Dashboard',
      path: '/dashboard',
      todayOrdersCount: todayOrdersCount?.count || 0,
      totalRevenue: totalRevenue?.sum || 0,
      ordersByMonth,
      recentOrders,
      ordersByStatus
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Error fetching dashboard data');
  }
});

export default router;
