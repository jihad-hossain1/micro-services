import { Request, Response, NextFunction } from "express";
import  prisma  from "@/prisma";


 const getUsers: any = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany();
        return res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}


export default getUsers