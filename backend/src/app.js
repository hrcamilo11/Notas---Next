import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import publicationRoutes from './routes/publicationRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/publications', publicationRoutes);

// Inicializar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
