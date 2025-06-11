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

// Show add category form
router.get('/add', (req: Request, res: Response) => {
  res.render('categories/add', {
    title: 'Add Category',
    path: '/categories'
  });
});

// Handle add category form submission
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    await sql`
      INSERT INTO categories (name)
      VALUES (${name})
    `;
    res.redirect('/categories');
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Error adding category');
  }
});

// Show edit category form
router.get('/:id/edit', async (req: Request, res: Response) => {
  try {
    const category = await sql`
      SELECT * FROM categories
      WHERE category_id = ${req.params.id}
    `;
    if (category.length === 0) {
      return res.status(404).send('Category not found');
    }
    res.render('categories/edit', {
      category: category[0],
      title: 'Edit Category',
      path: '/categories'
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).send('Error fetching category');
  }
});

// Handle edit category form submission
router.post('/:id', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    await sql`
      UPDATE categories
      SET name = ${name}
      WHERE category_id = ${req.params.id}
    `;
    res.redirect('/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).send('Error updating category');
  }
});

// Handle delete category
router.post('/:id/delete', async (req: Request, res: Response) => {
  try {
    await sql`
      DELETE FROM categories
      WHERE category_id = ${req.params.id}
    `;
    res.redirect('/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Error deleting category');
  }
});

export default router;
