import { Router, Request, Response } from 'express';
import sql from '../services/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadDir = path.resolve(process.cwd(), 'public', 'images');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Configuratie voor image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Show all ingredients
router.get('/', async (req: Request, res: Response) => {
  const ingredients = await sql`
    SELECT * FROM ingredients
    ORDER BY category_id, name
  `;
  res.render('ingredients/index', { 
    ingredients,
    title: 'Ingredients',
    path: '/ingredients'
  });
});

// Add new ingredient
router.get('/add', async (req: Request, res: Response) => {
  const categories = await sql`SELECT * FROM categories`;
  res.render('ingredients/add', { 
    categories,
    title: 'Add Ingredient',
    path: '/ingredients'
  });
});

// Handle new ingredient creation
router.post('/', upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { name, price, category_id } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !category_id || !price) {
      throw new Error('Name, price and category are required');
    }

    const [category] = await sql`
      SELECT name FROM categories WHERE category_id = ${category_id}
    `;

    if (!category) {
      throw new Error('Invalid category');
    }

    await sql`
      INSERT INTO ingredients (name, price, category_id, category, image_url)
      VALUES (${name}, ${parseFloat(price)}, ${category_id}, ${category.name}, ${image})
    `;
    res.redirect('/ingredients');
  } catch (error) {
    console.error('Error adding ingredient:', error);
    const categories = await sql`SELECT * FROM categories`;
    res.render('ingredients/add', { 
      categories,
      error: 'Failed to add ingredient. Please try again.',
      values: req.body,
      title: 'Add Ingredient',
      path: '/ingredients'
    });
  }
});

// Edit an existing ingredient
router.get('/:id/edit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [ingredient] = await sql`
      SELECT * FROM ingredients WHERE ingredient_id = ${id}
    `;
    
    if (!ingredient) {
      return res.status(404).send('Ingredient not found');
    }

    const categories = await sql`SELECT * FROM categories`;
    res.render('ingredients/edit', { 
      ingredient, 
      categories,
      title: 'Edit Ingredient',
      path: '/ingredients'
    });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).send('Error fetching ingredient');
  }
});

// Handle update of an ingredient
router.post('/:id', upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    
    if (!name || !category_id || !price) {
      throw new Error('Name, price and category are required');
    }

    const [category] = await sql`
      SELECT name FROM categories WHERE category_id = ${category_id}
    `;

    if (!category) {
      throw new Error('Invalid category');
    }

    // Check if a new image was uploaded
    if (req.file) {
      await sql`
        UPDATE ingredients
        SET name = ${name}, 
            price = ${parseFloat(price)},
            category_id = ${category_id}, 
            category = ${category.name}, 
            image_url = ${req.file.filename}
        WHERE ingredient_id = ${id}
      `;
    } else {
      await sql`
        UPDATE ingredients
        SET name = ${name}, 
            price = ${parseFloat(price)},
            category_id = ${category_id}, 
            category = ${category.name}
        WHERE ingredient_id = ${id}
      `;
    }
    
    res.redirect('/ingredients');
  } catch (error) {
    console.error('Error updating ingredient:', error);
    const categories = await sql`SELECT * FROM categories`;
    const [ingredient] = await sql`
      SELECT * FROM ingredients WHERE ingredient_id = ${req.params.id}
    `;
    res.render('ingredients/edit', { 
      ingredient,
      categories,
      error: 'Failed to update ingredient. Please try again.',
      values: req.body,
      title: 'Edit Ingredient',
      path: '/ingredients'
    });
  }
});

// Handle delete (via POST)
router.post('/:id/delete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM ingredients WHERE ingredient_id = ${id}`;
    res.redirect('/ingredients');
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).send('Error deleting ingredient');
  }
});

export default router;
