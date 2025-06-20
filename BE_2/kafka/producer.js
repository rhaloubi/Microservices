const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'course-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

const initProducer = async () => {
  await producer.connect();
};

const getTeacherByName = async (teacherName) => {
  const correlationId = Date.now().toString();
  

  await producer.send({
    topic: 'teacher-requests',
    messages: [{
      key: correlationId,
      value: JSON.stringify({
        type: 'get_teacher_by_name',
        teacherName,
        correlationId
      })
    }]
  });

  return new Promise((resolve, reject) => {
    const consumer = kafka.consumer({ groupId: `course-service-${correlationId}` });
    const timeout = setTimeout(() => {
      consumer.disconnect();
      reject(new Error('Teacher request timeout'));
    }, 5000);

    consumer.connect()
      .then(() => consumer.subscribe({ topic: 'teacher-responses', fromBeginning: false }))
      .then(() => {
        consumer.run({
          eachMessage: async ({ message }) => {
            const response = JSON.parse(message.value.toString());
            if (response.correlationId === correlationId) {
              clearTimeout(timeout);
              await consumer.disconnect();
              resolve(response.teacher);
            }
          }
        });
      });
  });
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
