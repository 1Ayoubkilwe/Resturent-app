const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const port = process.env.PORT || 5000;

connectDB();

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/external', require('./routes/externalRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/dine-in', require('./routes/dineInRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
    res.send('Restaurant App Backend is Running');
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

