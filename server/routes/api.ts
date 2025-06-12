import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

// GET /api/categories - Get all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET /api/ingredients/:categoryId - Get ingredients from a certain category
router.get('/ingredients/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const ingredients = await sql`SELECT * FROM ingredients WHERE category_id = ${categoryId} ORDER BY name ASC`;
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients by category:', error);
    res.status(500).json({ message: 'Error fetching ingredients' });
  }
});

// POST /api/orders - Post an order
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const { kiosk_name, customer_name, products } = req.body;

    // Basic validation
    if (!kiosk_name || !customer_name || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Missing required order details or products' });
    }

    // Insert order
    const [newOrder] = await sql`
      INSERT INTO orders (kiosk_name, customer_name, status)
      VALUES (${kiosk_name}, ${customer_name}, 'pending')
      RETURNING order_id
    `;

    if (!newOrder) {
      throw new Error('Failed to create order');
    }

    const orderId = newOrder.order_id;

    // Insert products
    for (const product of products) {
      const { base_id, topping1_id, topping2_id, topping3_id, topping4_id, topping5_id, extra1_id, extra2_id, extra3_id, extra4_id, extra5_id } = product;

      await sql`
        INSERT INTO products (
          order_id, base_id,
          topping1_id, topping2_id, topping3_id, topping4_id, topping5_id,
          extra1_id, extra2_id, extra3_id, extra4_id, extra5_id
        )
        VALUES (
          ${orderId}, ${base_id},
          ${topping1_id || null}, ${topping2_id || null}, ${topping3_id || null}, ${topping4_id || null}, ${topping5_id || null},
          ${extra1_id || null}, ${extra2_id || null}, ${extra3_id || null}, ${extra4_id || null}, ${extra5_id || null}
        )
      `;
    }

    res.status(201).json({ message: 'Order created successfully', order_id: orderId });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

export default router;