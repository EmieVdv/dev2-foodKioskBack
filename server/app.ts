import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
dotenv.config();

const app = express();
const port = 3000;

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // Set the default layout
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Make the `public` directory available for CSS, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data (POST requests)
app.use(express.urlencoded({ extended: true }));

// Routes importeren (bijvoorbeeld ingrediëntenlijst)
import dashboardRoutes from './routes/dashboard';
app.use('/dashboard', dashboardRoutes);

import ingredientsRoutes from './routes/ingredients';
app.use('/ingredients', ingredientsRoutes);           // Route beschikbaar maken op /ingredients

app.use('/images', express.static(path.resolve(process.cwd(), 'public', 'images')));

import categoryRoutes from './routes/categories';
app.use('/categories', categoryRoutes);

import ordersRoutes from './routes/orders';
app.use('/orders', ordersRoutes);

// Als iemand naar de hoofdpagina / gaat, doorsturen naar /dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Start de server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
