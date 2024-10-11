import express, { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { InventoryUpdateDTOSchema } from "@/schemas";

const updateInventory: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: {
                id,
            },
        });

        if (!inventory) {
            return res.status(404).json({ error: "Inventory not found" });
        }

        const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const lastHistory = await prisma.history.findFirst({
            where: {
                inventoryId: id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        let newQuantity = inventory.quantity;

        if (parsedBody.data.actionType === "IN") {
            newQuantity += parsedBody.data.quantity;
        } else {
            newQuantity -= parsedBody.data.quantity;
        }

        const updatedInventory = await prisma.inventory.update({
            where: {
                id,
            },
            data: {
                quantity: newQuantity,
                histories: {
                    create: {
                        actionType: parsedBody.data.actionType,
                        quantityChanged: parsedBody.data.quantity,
                        lastQuantity: lastHistory?.newQuantity || 0,
                        newQuantity,
                    },
                },
            },
            select: {
                id: true,
                quantity: true,
            },
        });

        return res.status(200).json(updatedInventory);
    } catch (error) {
        next(error);
    }
};

export default updateInventory;
