import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";

const getOrders : any = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await prisma.order.findMany();
        return res.status(200).json(orders);
    } catch (error) {
        next(error)
    }
}


export default getOrders