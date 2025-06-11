import { Router, Request, Response } from 'express';
import sql from '../../services/db';
import { Order, OrderItem, ApiResponse } from '../../types/api';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_name, items } = req.body as Order;

    // Validate input
    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid order data. Customer name and items array are required.'
      };
      return res.status(400).json(response);
    }

    // Validate each item
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid item data. Each item must have a product_id and positive quantity.'
        };
        return res.status(400).json(response);
      }
    }

    // Start a transaction
    const result = await sql.begin(async (sql) => {
      // Create the order
      const [order] = await sql<Order[]>`
        INSERT INTO orders (customer_name, status)
        VALUES (${customer_name}, 'pending')
        RETURNING *
      `;

      // Insert order items
      for (const item of items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity)
          VALUES (${order.order_id}, ${item.product_id}, ${item.quantity})
        `;
      }

      return order;
    });

    const response: ApiResponse<Order> = {
      success: true,
      data: result
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating order:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create order'
    };
    res.status(500).json(response);
  }
});

export default router; 