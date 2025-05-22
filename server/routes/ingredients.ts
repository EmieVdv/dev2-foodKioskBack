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
  res.render('ingredients/index', { ingredients });
});

// Add new ingredient
router.get('/add', async (req: Request, res: Response) => {
  const categories = await sql`SELECT * FROM categories`;
  res.render('ingredients/add', { categories });
});

// Handle new ingredient creation
router.post('/', upload.single("image"), async (req: Request, res: Response) => {
  const { name, price, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const [category] = await sql`
      SELECT name FROM categories WHERE category_id = ${category_id}
    `;

    await sql`
      INSERT INTO ingredients (name, price, category_id, category, image_url)
      VALUES (${name}, ${price}, ${category_id}, ${category.name}, ${image})
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
router.post('/:id', upload.single("image"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, category_id } = req.body;
  
  const [category] = await sql`
    SELECT name FROM categories WHERE category_id = ${category_id}
  `;
   // Check if a new image was uploaded
    if (req.file) {
      await sql`
        UPDATE ingredients
        SET name = ${name}, price = ${price}, category_id = ${category_id}, 
            category = ${category.name}, image_url = ${req.file.filename}
        WHERE ingredient_id = ${id}
      `;
    } else {
      await sql`
        UPDATE ingredients
        SET name = ${name}, price = ${price}, category_id = ${category_id}, 
            category = ${category.name}
        WHERE ingredient_id = ${id}
      `;
    }
    
    res.redirect('/ingredients');
});

// Handle delete (via POST)
router.post('/:id/delete', async (req: Request, res: Response) => {
  const { id } = req.params;
  await sql`DELETE FROM ingredients WHERE ingredient_id = ${id}`;
  res.redirect('/ingredients');
});

export default router;
