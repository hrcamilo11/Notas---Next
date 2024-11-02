// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// eslint-disable-next-line @typescript-eslint/no-require-imports
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cors = require('cors');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const connectDB = require('./config/database');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const userRoutes = require('./routes/userRoutes');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const publicationRoutes = require('./routes/publicationRoutes');

const app = express();
console.log('MongoDB URI:', process.env.MONGODB_URI);
// Connect to MongoDB
connectDB().then(r => (r));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/publications', publicationRoutes);


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});