const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to DB
connectDB();

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const movies = require('./routes/movies');

const app = express();

// Init Middleware
app.use(express.json());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/movies', movies);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
