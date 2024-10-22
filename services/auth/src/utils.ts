import prisma from "@/prisma";
import { EMAIL_SERVICE_URL } from "./config";
import axios from "axios";

export const generateVerificationCode = () => {
    const timestamp = new Date().getTime().toString();
    const randomNum = Math.floor(10 + Math.random() * 90);

    let code = (timestamp + randomNum).slice(-5);

    return code;
};

export const verificationWithMailSend = async (
    email: string,
    code: string,
    id: string,
) => {
    const verificationCode = await prisma.verificationCode.create({
        data: {
            userId: id,
            code,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        },
    });
    console.log("🚀 ~ verificationCode:", verificationCode);

    // TODO: send token
    const emailResponse = await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
        recipient: email,
        subject: "Verify your email",
        body: `Your verification code is: ${code}`,
        source: "user registration",
    });

    return {
        emailResponse,
        verificationCode,
    };
};
