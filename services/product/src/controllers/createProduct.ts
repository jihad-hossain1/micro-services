import { Request, Response, NextFunction } from "express";
import { ProductCreateDTOSchema } from "../schemas";
import prisma from "@/prisma";
import axios from "axios";
import { INVENTORY_SERVICE_URL } from "@/config";

const createProduct: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = ProductCreateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const existingSku = await prisma.product.findFirst({
            where: {
                sku: parsedBody.data.sku,
            },
        });

        if (existingSku) {
            return res.status(400).json({ error: "SKU already exists" });
        }

        const product = await prisma.product.create({
            data: { ...parsedBody.data },
        });


        const { data: inventory } = await axios.post(
            `${INVENTORY_SERVICE_URL}/inventories`,
            {
                productId: product.id,
                sku: product.sku,
            },
        );
        console.log("🚀 ~ inventory:", inventory)

        const updatedProduct = await prisma.product.update({
            where: {
                id: product.id,
            },
            data: {
                inventoryId: inventory?.inventory?.id,
            },
        });
        console.log("🚀 ~ updatedProduct:", updatedProduct)

        return res
            .status(201)
            .json({ ...updatedProduct });
    } catch (error) {
        next(error);
    }
};

export default createProduct;
