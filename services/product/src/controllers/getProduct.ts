import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import axios from "axios";
import { INVENTORY_SERVICE_URL } from "@/config";

const getProduct: any = async (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = _req.params;
    try {
        const product = await prisma.product.findUnique({
            where: {
                id,
            },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (product.inventoryId === null) {
            const { data: inventory } = await axios.post(
                `${INVENTORY_SERVICE_URL}/inventories`,
                {
                    productId: product.id,
                    sku: product.sku,
                },
            );

            const updateProduct = await prisma.product.update({
                where: {
                    id: product.id,
                },
                data: {
                    inventoryId: inventory.id,
                },
            });


            return res
                .status(200)
                .json({
                    ...updateProduct,
                    inventoryId: inventory.id,
                    stock: inventory.quantity || 0,
                    stockStatus:
                        inventory.quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
                });
        }


        const { data: inventory } = await axios.get(
            `${INVENTORY_SERVICE_URL}/inventories/${product.inventoryId}`,
        );

        console.log("🚀 ~ inventory:", inventory);

        return res.status(200).json({
            ...product,
            inventoryId: inventory.id,
            stock: inventory.quantity || 0,
            stockStatus: inventory.quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
        });
    } catch (error) {
        next(error);
    }
};

export default getProduct;
