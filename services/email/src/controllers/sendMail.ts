import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { EmailCreateDTOSchema } from "@/schemas";
import { defaultSender, transporter } from "@/config";

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

        const from = sender || defaultSender

        const emailOption = {
            from,
            to: recipient,
            subject,
            text: body,
        };
        console.log("🚀 ~ emailOption:", emailOption)

        const { rejected } = await transporter.sendMail(emailOption);
        console.log("🚀 ~ rejected:", rejected)

        if (rejected.length) {
            console.log("Email rejected", rejected);
            return res.status(500).json({ error: "Failed to send email", message: "Email rejected" });
        }

        await prisma.email.create({
            data: {
                sender: from,
                recipient,
                subject,
                body,
                source,
            },
        })

        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        next(error);
    }
};

export default sendMail;
