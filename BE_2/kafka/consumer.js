const kafka = require('kafka-node');

const setupKafkaConsumer = () => {
  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092'
  });

  const consumer = new kafka.Consumer(
    client,
    [{ topic: 'user_updates' }],
    {
      autoCommit: true
    }
  );

  consumer.on('message', async (message) => {
    try {
      const userData = JSON.parse(message.value);
      console.log('Received user update:', userData);
      // Handle user updates (e.g., teacher information changes)
    } catch (error) {
      console.error('Error processing Kafka message:', error);
    }
  });

  consumer.on('error', (err) => {
    console.error('Kafka consumer error:', err);
  });
};

module.exports = { setupKafkaConsumer };