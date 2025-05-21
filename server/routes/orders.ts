import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

// Show all orders
router.get('/', async (req: Request, res: Response) => {
  const orders = await sql`
    SELECT * FROM orders
    ORDER BY created_at DESC
  `;
  res.render('orders/index', { orders });
});

//  Show a single order with its products
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Get order details
  const [order] = await sql`
    SELECT * FROM orders
    WHERE order_id = ${id}
  `;
  
  if (!order) {
    return res.status(404).send('Order not found');
  }
  
  // Get products for this order
  const products = await sql`
    SELECT * FROM products
    WHERE order_id = ${id}
  `;
  
  // Get all ingredients to resolve IDs to names
  const ingredients = await sql`
    SELECT * FROM ingredients
  `;
  
  // Create a map of ingredient_id to ingredient for easy lookup
  const ingredientMap = ingredients.reduce((map, ingredient) => {
    map[ingredient.ingredient_id] = ingredient;
    return map;
  }, {});
  
  // Process products to include ingredient names
  const processedProducts = products.map(product => {
    const processedProduct = { ...product };
    
    // Process base
    if (product.base_id && ingredientMap[product.base_id]) {
      processedProduct.base_name = ingredientMap[product.base_id].name;
    }
    
    // Process toppings
    processedProduct.toppings = [];
    for (let i = 1; i <= 5; i++) {
      const toppingId = product[`topping${i}_id`];
      if (toppingId && ingredientMap[toppingId]) {
        processedProduct.toppings.push({
          id: toppingId,
          name: ingredientMap[toppingId].name
        });
      }
    }
    
    // Process extras
    processedProduct.extras = [];
    for (let i = 1; i <= 5; i++) {
      const extraId = product[`extra${i}_id`];
      if (extraId && ingredientMap[extraId]) {
        processedProduct.extras.push({
          id: extraId,
          name: ingredientMap[extraId].name
        });
      }
    }
    
    return processedProduct;
  });
  
  res.render('orders/detail', { 
    order, 
    products: processedProducts 
  });
});

// Update order status
router.post('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
await sql`
  UPDATE orders
  SET status = ${status}
  WHERE order_id = ${id}
`;

  
  res.redirect(`/orders/${id}`);
});

export default router;