import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { EmailCreateDTOSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { transporter } from "@/config";

const sendMail: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = EmailCreateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const { recipient, subject, body, source, sender } = parsedBody.data;

        const emailOption = {
            from: sender || process.env.DEFAULT_SENDER_EMAIL,
            to: recipient,
            subject,
            text: body,
        };

        const {rejected} = await transporter.sendMail(emailOption);

        if(rejected.length){
            return res.status(400).json({error:rejected});
        }

        


    } catch (error) {
        next(error);
    }
};

export default sendMail;
