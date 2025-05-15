import { Router, Request, Response } from 'express';
import sql from '../services/db';

const router = Router();

// INDEX - Show all ingredients
router.get('/', async (req: Request, res: Response) => {
  const categories = await sql`SELECT * FROM categories`;
  res.render('categories/index', { categories });
});


export default router;
