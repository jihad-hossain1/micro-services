import { Request, Response, NextFunction } from "express";
import { UserCreateDTOSchema } from "../schemas";
import  prisma  from "@/prisma";


const createUser: any = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedBody = UserCreateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        // TODO: Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                authUserId: parsedBody.data.authUserId
            }
        })

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // TODO: Create user

        const user = await prisma.user.create({
            data: parsedBody.data
            
        })

        res.status(200).json({ user });

    } catch (error) {
        next(error);
    }
}


export default createUser