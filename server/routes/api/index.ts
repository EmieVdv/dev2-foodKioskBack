import { Router } from 'express';
import categoriesRouter from './categories';
import productsRouter from './products';
import ordersRouter from './orders';

const router = Router();

router.use('/categories', categoriesRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);

export default router; 