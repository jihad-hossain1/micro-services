import amqp from "amqplib";

import {QUEUE_URL} from './config';


const sendToQueue = async(queue: string,message: string) => {
    const connection = await amqp.connect(QUEUE_URL);

    const channel = await connection.createChannel();

    const exchange = 'order';
    await channel.assertExchange(exchange,'direct', { durable: true });

    channel.publish(exchange,queue,Buffer.from(message));

    setTimeout(() => {
        connection.close();
    }, 500);
}


export default sendToQueue