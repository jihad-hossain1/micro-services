import { CART_TTL } from "@/config";
import redis from "@/redis";
import { CartCreateDTOSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

const addToCart: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        // validated request body
        const parsedBody = CartCreateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        let cartSessionId =
            (req.headers["x-cart-session-id"] as string) || null;

        if (cartSessionId) {
            const exists = await redis.exists(`sessions:${cartSessionId}`);
            console.log("🚀 ~ exists:", exists);

            if (!exists) {
                cartSessionId = null;
            }
        }

        if (!cartSessionId) {
            cartSessionId = uuid();
            console.log("🚀 ~ cartSessionId:", cartSessionId);

            await redis.setex(
                `sessions:${cartSessionId}`,
                CART_TTL,
                cartSessionId,
            );
            res.setHeader("x-cart-session-id", cartSessionId);
        }

    // add item to the cart
        await redis.hset(
            `cart:${cartSessionId}`,
            parsedBody.data.productId,
            JSON.stringify({
                inventoryId: parsedBody.data.inventoryId,
                quantity: parsedBody.data.quantity,
            }),
        );

        return res.status(200).json({message: "Item added to cart",cartSessionId: cartSessionId});

        // TODO: check inventory for availability
        // TODO: update inventory
    } catch (error) {
        next(error);
    }
};

export default addToCart;
