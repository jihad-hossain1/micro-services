import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { AccessTokenSchema } from "@/schemas";
import jwt from "jsonwebtoken";


const verifyToken: any = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsedBody = AccessTokenSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const { accessToken } = parsedBody.data;

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        const user = await prisma.user.findUnique({
            where: {
                id: (decoded as any).id
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        })


      return  res.status(200).json({ user, message: "Authorized" })
    } catch (error) {
        next(error);
    }


}

export default verifyToken

