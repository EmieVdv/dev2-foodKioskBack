import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// Zeg tegen Express: “We gaan EJS gebruiken voor views/templates”
app.set('view engine', 'ejs');
// Zeg ook waar de .ejs bestanden zich bevinden
app.set('views', path.join(__dirname, 'views'));

// Maak de map `public` beschikbaar voor CSS, afbeeldingen, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Hiermee kan je formulierdata (POST requests) uitlezen
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

// Als iemand naar de hoofdpagina / gaat, doorsturen naar /ingredients
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Start de server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
