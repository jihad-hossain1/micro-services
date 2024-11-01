
import { Request, Response, NextFunction } from "express"
import prisma from "@/prisma";



const getOrderDetails : any = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                orderItmes: true
            }
        })

        if(!order) return res.status(404).json({error: "Order not found"});

        return res.status(200).json(order)
    } catch (error) {
        next(error)
    }
}


export default getOrderDetails;