import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

// Show all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await sql`
      SELECT * FROM categories
      ORDER BY category_id
    `;
    res.render('categories/index', { 
      categories,
      title: 'Categories',
      path: '/categories'
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Error fetching categories');
  }
});

// edit an existing category
router.get('/:id/edit', async (req: Request, res: Response) => {
  const { id } = req.params;
  const [category] = await sql`
    SELECT * FROM categories WHERE category_id = ${id}
  `;
  res.render('categories/edit', { category });
});

// Handle update of a category
router.post('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  await sql`
    UPDATE categories SET name = ${name} WHERE category_id = ${id}
  `;
  res.redirect('/categories');
});

// add new category
router.get('/add', (_req: Request, res: Response) => {
  res.render('categories/add');
});

// handle new category
router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body;
  await sql`INSERT INTO categories (name) VALUES (${name})`;
  res.redirect('/categories');
});

// Handle delete
router.post('/:id/delete', async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`DELETE FROM categories WHERE category_id = ${id}`;
  res.redirect('/categories');
});

export default router;
