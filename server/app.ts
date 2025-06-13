import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
dotenv.config();


const app = express();
const PORT : number = parseInt(<string>process.env.PORT, 10) || 3000;

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
app.use(express.json()); // Add this line to parse JSON request bodies

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

// Import and use API routes
import apiRoutes from './routes/api';
app.use('/api', apiRoutes);

// Als iemand naar de hoofdpagina / gaat, doorsturen naar /dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Start de server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
