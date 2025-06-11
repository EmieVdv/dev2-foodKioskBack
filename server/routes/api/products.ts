import { Router, Request, Response } from 'express';
import sql from '../../services/db';
import { Product, ApiResponse } from '../../types/api';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Category ID is required'
      };
      return res.status(400).json(response);
    }

    const categoryId = parseInt(category as string);
    if (isNaN(categoryId)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid category ID'
      };
      return res.status(400).json(response);
    }

    const products = await sql<Product[]>`
      SELECT * FROM products
      WHERE category_id = ${categoryId}
      ORDER BY name
    `;

    const response: ApiResponse<Product[]> = {
      success: true,
      data: products
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch products'
    };
    res.status(500).json(response);
  }
});

export default router; 