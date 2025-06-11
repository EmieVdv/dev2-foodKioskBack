import { Router, Request, Response } from 'express';
import sql from '../../services/db';
import { Category, ApiResponse } from '../../types/api';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await sql<Category[]>`
      SELECT * FROM categories
      ORDER BY name
    `;

    const response: ApiResponse<Category[]> = {
      success: true,
      data: categories
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch categories'
    };
    res.status(500).json(response);
  }
});

export default router; 