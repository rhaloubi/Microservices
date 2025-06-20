const { Kafka } = require('kafkajs');
const User = require('../models/userModel');

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'user-service-group' });
const producer = kafka.producer();

const initConsumer = async () => {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'teacher-requests', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const request = JSON.parse(message.value.toString());
      
      if (request.type === 'get_teacher_by_name') {
        try {
          const teacher = await User.findOne({
            name: new RegExp(request.teacherName, 'i'),
            role: 'teacher'
          }).select('-password');

          // Send response back
          await producer.send({
            topic: 'teacher-responses',
            messages: [{
              value: JSON.stringify({
                correlationId: request.correlationId,
                teacher: teacher || null
              })
            }]
          });
        } catch (error) {
          console.error('Error processing teacher request:', error);
        }
      }
    }
  });
};

module.exports = { initConsumer };