import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { UserCreateDTOSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { EMAIL_SERVICE_URL, USER_SERVICE_URL } from "@/config";


const generateVerificationCode = () => {
    const timestamp = new Date().getTime().toString();
    const randomNum = Math.floor(10 + Math.random() * 90);

    let code = (timestamp + randomNum).slice(-5);

    return code;
};

const userRegistration: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        //
        const parsedBody = UserCreateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const { email, password, name } = parsedBody.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hasedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                email,
                password: hasedPassword,
                name,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                verified: true,
            },
        });

        // create the user profile by user service

        await axios.post(`${USER_SERVICE_URL}/users`, {
            authorId: user.id,
            name,
            email,
        });

        // TODO: generate verify token
        const code = generateVerificationCode();
        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
            }
        })
        // TODO: send token
        await axios.post(`${EMAIL_SERVICE_URL}/emails`, {
            recipient: user.email,
            subject: "Verify your email",
            body: `Your verification code is: ${code}`,
            source: "user registration",
        })

        return res.status(201).json({ user , message: "User created successfully" });
    } catch (error) {
        next(error);
    }
};

export default userRegistration;
