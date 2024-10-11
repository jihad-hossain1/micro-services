import express, { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { InventoryCreateDTOSchema } from "@/schemas";

const createInventory: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
):Promise<Response<any, Record<string, any>> | undefined> => {
    try {
        const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const inventory = await prisma.inventory.create({
            data: {
                ...parsedBody.data,
                histories: {
                    create: {
                        actionType: "IN",
                        quantityChanged: parsedBody.data.quantity,
                        lastQuantity: 0,
                        newQuantity: parsedBody.data.quantity,
                    },
                },
            },
            select: {
                id: true,
                quantity: true,
            },
        });

         res.status(201).json({ inventory: inventory });
    } catch (error) {
        next(error);
    }
};

export default createInventory;
