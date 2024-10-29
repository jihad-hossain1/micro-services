import { CartCreateDTOSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";

const addToCart:any = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validated request body
        const parsedBody = CartCreateDTOSchema.safeParse(req.body);

        if(!parsedBody.success){
            return res.status(400).json({ error: parsedBody.error.errors });
        }


        let cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

    } catch (error) {
        next(error);
    }
};

export default addToCart;
