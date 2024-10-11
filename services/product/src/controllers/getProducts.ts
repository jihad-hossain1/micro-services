import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";


const getProducts: any = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                inventoryId: true,
                status: true,
            },
        });
        return res.status(200).json({ products });
    } catch (error) {
        next(error);
    }
};

export default getProducts;