import prisma from "@/prisma";
import { ProductUpdateDTOSchema } from "@/schemas";
import { Response, Request,NextFunction } from "express";


const updateProduct: any = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
       const parsedBody = ProductUpdateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        // TODO: Check if product exists

        const _product = await prisma.product.findUnique({
            where: {
                id,
            },
        });
       
        if(!_product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = await prisma.product.update({
            where: {
                id,
            },
            data: {
                ...parsedBody.data,
            },
        });
        return res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

export default updateProduct;
