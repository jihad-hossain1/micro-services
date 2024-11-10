import dotenv from "dotenv";
dotenv.config();

import ampq from "amqplib";
import { defaultSender, transporter } from "./config";
import prisma from "./prisma";

const reciveFromQueue = async (
    queue: string,
    callback: (message: string) => void,
) => {
    const connection = await ampq.connect(`${process.env.QUEUE_URL}`);
    const channel = await connection.createChannel();

    const exchange = "order";
    await channel.assertExchange(exchange, "direct", { durable: true });

    const q = await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(
        q.queue,
        (message) => {
            if (message) {
                callback(message.content.toString());
            }
        },
        { noAck: true },
    );
};

reciveFromQueue("send-email", async (message) => {
    console.log(`Received send-email: ${message}`);
    const parsedBody = JSON.parse(message);

    const { userEmail, grandTotal, id } = parsedBody;
    const from = defaultSender;
    const subject = "Order Confirmation";
    const body = `Thank you for your order. Your order id is ${id} and grand total is ${grandTotal}.`;
    
    const emailOption = {
        from,
        to: userEmail,
        subject,
        text: body,
    };

    const { rejected } = await transporter.sendMail(emailOption);
    // console.log("🚀 ~ rejected:", rejected)

    if (rejected.length) {
        console.log("Email rejected", rejected);
        return;
    }

    await prisma.email.create({
        data: {
            sender: from,
            recipient: userEmail,
            subject,
            body,
            source: "order confirmation",
        },
    });
});
