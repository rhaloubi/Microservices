const { Kafka } = require('kafkajs');
const { getRedisClient } = require('../config/redis');

const kafka = new Kafka({
  clientId: 'course-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

const initProducer = async () => {
  await producer.connect();
};

const getTeacherByName = async (teacherName) => {
  const redisClient = getRedisClient();
  const teacher = await redisClient.get(`teacher:${teacherName}`);
  return JSON.parse(teacher);
};

module.exports = {
  initProducer,
  getTeacherByName,
  sendMessage: async (topic, message) => {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });
  }
};
