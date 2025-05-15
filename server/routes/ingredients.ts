import express from 'express';
import sql from '../services/db';

const router = express.Router();

router.get('/', async (req, res) => {
  const ingredients = await sql`SELECT * FROM ingredients`;
  res.render('index', { ingredients });
});


router.get('/add', (req, res) => {
  res.render('edit');
});


router.post('/add', async (req, res) => {
  const { name, price, category_id } = req.body;
  await sql`
    INSERT INTO ingredients (name, price, category_id)
    VALUES (${name}, ${price}, ${category_id})
  `;
  res.redirect('/ingredients');
});

export default router;