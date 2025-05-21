import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

// Show all ingredients
router.get('/', async (req: Request, res: Response) => {
  const ingredients = await sql`
    SELECT * FROM ingredients
    ORDER BY category_id, name
  `;
  res.render('ingredients/index', { ingredients });
});

// Add new ingredient
router.get('/add', async (req: Request, res: Response) => {
  const categories = await sql`SELECT * FROM categories`;
  res.render('ingredients/add', { categories });
});

// Handle new ingredient creation
router.post('/', async (req: Request, res: Response) => {
  const { name, price, category_id } = req.body;
  try {
    const [category] = await sql`
      SELECT name FROM categories WHERE category_id = ${category_id}
    `;

    await sql`
      INSERT INTO ingredients (name, price, category_id, category)
      VALUES (${name}, ${price}, ${category_id}, ${category.name})
    `;
    res.redirect('/ingredients');
  } catch (error) {
    console.error('Error adding ingredient:', error);
    const categories = await sql`SELECT * FROM categories`;
    res.render('ingredients/add', { 
      categories,
      error: 'Failed to add ingredient. Please try again.',
      values: { name, price, category_id }
    });
  }
});


// Edit an existing ingredient
router.get('/:id/edit', async (req: Request, res: Response) => {
  const { id } = req.params;
  const [ingredient] = await sql`
    SELECT * FROM ingredients WHERE ingredient_id = ${id}
  `;
  const categories = await sql`SELECT * FROM categories`;
  res.render('ingredients/edit', { ingredient, categories });
});

// Handle update of an ingredient
router.post('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, category_id } = req.body;
  
  const [category] = await sql`
    SELECT name FROM categories WHERE category_id = ${category_id}
  `;
  await sql`
    UPDATE ingredients
    SET name = ${name}, price = ${price}, category_id = ${category_id}, category = ${category.name}
    WHERE ingredient_id = ${id}
  `;
  res.redirect('/ingredients');
});

// Handle delete (via POST)
router.post('/:id/delete', async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`DELETE FROM ingredients WHERE ingredient_id = ${id}`;
  res.redirect('/ingredients');
});

export default router;
