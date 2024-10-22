import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    
    // auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD
    // }
})

export const defaultSender = process.env.DEFAULT_SENDER_EMAIL  || "jihadkhan4191@example.com"
console.log("🚀 ~ defaultSender:", defaultSender)

