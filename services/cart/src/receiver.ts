import ampq from 'amqplib';
import redis from './redis';



const reciveFromQueue = async(queue: string, callback:(message: string) => void) => {
    const connection = await ampq.connect(`amqp://localhost`);
    const channel = await connection.createChannel();

    const exchange = 'order';
    await channel.assertExchange(exchange,'direct', { durable: true });

    const q = await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(q.queue, (message) => {
        if (message) {
            callback(message.content.toString());
        }
    }, { noAck: true });
}

reciveFromQueue('clear-cart', (message) => {
    console.log(`Received clear-cart: ${message}`);
    const parsedMessage = JSON.parse(message);

    const cartsessionId = parsedMessage.cartSessionId;
    redis.del(`sessions:${cartsessionId}`);
    redis.del(`cart:${cartsessionId}`);

    console.log('cart cleared');
})