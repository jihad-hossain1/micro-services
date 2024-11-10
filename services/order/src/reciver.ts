import ampq from 'amqplib';
import { QUEUE_URL } from './config';



const reciveFromQueue = async(queue: string, callback:(message: string) => void) => {
    const connection = await ampq.connect(QUEUE_URL);
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
})