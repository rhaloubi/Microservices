const Redis = require('redis');

let redisClient;

const setupRedisClient = async () => {
  redisClient = Redis.createClient({
    url: process.env.REDIS_URI || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Connected to Redis'));

  await redisClient.connect();
};

const getRedisClient = () => redisClient;

module.exports = { setupRedisClient, getRedisClient };