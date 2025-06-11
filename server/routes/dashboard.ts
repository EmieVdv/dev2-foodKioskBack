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
    
    // Get all orders for total revenue calculation
    const orders = await sql`
      SELECT * FROM orders
      ORDER BY created_at DESC
    `;

    // Get all products
    const products = await sql`
      SELECT * FROM products
    `;

    // Get all ingredients
    const ingredients = await sql`
      SELECT * FROM ingredients
    `;

    // Create a map of ingredient_id to ingredient for easy lookup
    const ingredientMap = ingredients.reduce((map: Record<number, any>, ingredient: any) => {
      map[ingredient.ingredient_id] = ingredient;
      return map;
    }, {});

    // Calculate total revenue and process recent orders
    let totalRevenue = 0;
    const processedOrders = orders.map((order: any) => {
      const orderProducts = products.filter((p: any) => p.order_id === order.order_id);
      let orderTotal = 0;

      orderProducts.forEach((product: any) => {
        let productTotal = 0;

        // Add base price
        if (product.base_id && ingredientMap[product.base_id]) {
          productTotal += Number(ingredientMap[product.base_id].price) || 0;
        }

        // Add toppings prices
        for (let i = 1; i <= 5; i++) {
          const toppingId = product[`topping${i}_id`];
          if (toppingId && ingredientMap[toppingId]) {
            productTotal += Number(ingredientMap[toppingId].price) || 0;
          }
        }

        // Add extras prices
        for (let i = 1; i <= 5; i++) {
          const extraId = product[`extra${i}_id`];
          if (extraId && ingredientMap[extraId]) {
            productTotal += Number(ingredientMap[extraId].price) || 0;
          }
        }

        orderTotal += productTotal;
      });

      // Round order total to 2 decimal places
      orderTotal = Number(orderTotal.toFixed(2));
      totalRevenue += orderTotal;

      return {
        ...order,
        total_price: orderTotal
      };
    });

    // Round total revenue to 2 decimal places
    totalRevenue = Number(totalRevenue.toFixed(2));

    // Calculate monthly data
    const currentYear = today.getFullYear();
    const monthlyData = Array.from({ length: 12 }, () => ({ count: 0, revenue: 0 }));

    processedOrders.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth(); // 0-11
        monthlyData[monthIndex].count += 1;
        monthlyData[monthIndex].revenue += order.total_price;
      }
    });

    // Format orders by month data
    const formattedOrdersByMonth = monthlyData.map((data, index) => ({
      month: index + 1,
      count: data.count,
      revenue: Number(data.revenue.toFixed(2))
    }));
    
    // Get orders by status
    const ordersByStatus = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders
      GROUP BY status
    `;

    // Format orders by status data
    const formattedOrdersByStatus = ordersByStatus.map((item: any) => ({
      status: item.status || 'Unknown',
      count: parseInt(item.count)
    }));
    
    res.render('dashboard', {
      title: 'Dashboard',
      path: '/dashboard',
      scriptPath: 'dashboard/scripts',
      todayOrdersCount: todayOrdersCount?.count || 0,
      totalRevenue,
      ordersByMonth: formattedOrdersByMonth,
      recentOrders: processedOrders.slice(0, 5), // Get only the 5 most recent orders
      ordersByStatus: formattedOrdersByStatus
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Error fetching dashboard data');
  }
});

export default router;
