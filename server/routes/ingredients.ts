import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

// INDEX - Show all ingredients
router.get('/', async (req: Request, res: Response) => {
  const ingredients = await sql`SELECT * FROM ingredients`;
  res.render('ingredients/index', { ingredients });
});

// FORM to add new ingredient
router.get('/add', (req: Request, res: Response) => {
  res.render('ingredients/add');
});

// Handle new ingredient creation
router.post('/', async (req: Request, res: Response) => {
  const { name, price, category } = req.body;
  await sql`
    INSERT INTO ingredients (name, price, category)
    VALUES (${name}, ${price}, ${category})
  `;
  res.redirect('/ingredients');
});

// FORM to edit an existing ingredient
router.get('/:id/edit', async (req: Request, res: Response) => {
  const { id } = req.params;
  const [ingredient] = await sql`
    SELECT * FROM ingredients WHERE ingredient_id = ${id}
  `;
  res.render('ingredients/edit', { ingredient });
});

// Handle update of an ingredient
router.post('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  await sql`
    UPDATE ingredients
    SET name = ${name}, price = ${price}, category = ${category}
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
