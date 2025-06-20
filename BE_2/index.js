require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const courseRoutes = require('./routes/courseRoutes');
const { setupKafkaConsumer } = require('./kafka/consumer');
const { setupRedisClient } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Kafka consumer
setupKafkaConsumer();

// Initialize Redis
setupRedisClient();

// Routes
app.use('/api/courses', courseRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Course Service running on port ${PORT}`);
});