import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

// Show all orders
router.get('/', async (req: Request, res: Response) => {
  // Get all orders
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
  const ingredientMap = ingredients.reduce((map: any, ingredient: any) => {
    map[ingredient.ingredient_id] = ingredient;
    return map;
  }, {});

  // Process each order to calculate total price
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

    return {
      ...order,
      total_price: orderTotal
    };
  });

  res.render('orders/index', { 
    orders: processedOrders,
    title: 'Orders',
    path: '/orders'
  });
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
  
  // Process products to include ingredient names and calculate prices
  let orderTotal = 0;
  const processedProducts = products.map(product => {
    const processedProduct = { ...product };
    let productTotal = 0;
    
    // Process base
    if (product.base_id && ingredientMap[product.base_id]) {
      processedProduct.base_name = ingredientMap[product.base_id].name;
      productTotal += Number(ingredientMap[product.base_id].price) || 0;
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
        productTotal += Number(ingredientMap[toppingId].price) || 0;
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
        productTotal += Number(ingredientMap[extraId].price) || 0;
      }
    }
    
    // Add product total to order total
    orderTotal += productTotal;
    
    // Add the calculated total to the product object
    processedProduct.total = productTotal;
    
    return processedProduct;
  });
  
  // Update the order object with the calculated total
  order.total_price = orderTotal;
  
  res.render('orders/detail', { 
    order, 
    products: processedProducts,
    ingredientMap,
    title: 'Order Details',
    path: '/orders'
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