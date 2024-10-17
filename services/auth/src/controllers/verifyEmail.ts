import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import jwt from "jsonwebtoken";
import { EmailVerificationSchema } from "@/schemas";
import axios from "axios";

const verifyEmail: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = EmailVerificationSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const { email, code } = parsedBody.data;

        // check if user exists

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const emailVerification = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code: code,
            },
        });

        // if code are expired
        if ((emailVerification as any).expiresAt < new Date()) {
            return res.status(400).json({ error: "Code expired" });
        }

        // update user status

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                status: "ACTIVE",
            },
        });

        await prisma.verificationCode.update({
            where: {
                id: (emailVerification as any).id,
            },
            data: {
                status: "USED",
            },
        });

        await axios.post(`${process.env.EMAIL_SERVICE_URL}/emails/send`,{
            recipient: user?.email,
            subject: "Email verifiyed",
            body: "Email verifiyed successfully",
            source: "verify-email",
        });

        return res.status(200).json({ message: "Email verifiyed successfully" });
    } catch (error) {
        next(error);
    }
};

export default verifyEmail;
