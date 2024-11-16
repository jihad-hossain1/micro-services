import axios from "axios";
import { CART_TTL, INVENTORY_SERVICE_URL } from "@/config";
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

        // console.log("🚀 ~ cartSessionId:", cartSessionId);

        // check if the inventory is available
        const { data } = await axios.get(
            `${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`,
        );
        console.log("🚀 ~ data:", data.quantity);

        if (Number(data.quantity) < parsedBody.data.quantity) {
            return res.status(400).json({ message: "Inventory not available" });
        }

        // check TODO: if the item is already in the cart
        // logic: parsedBody.data.quantity - existing quantity

        // const item = await redis.hget(
        //     `cart:${cartSessionId}`,
        //     parsedBody.data.productId,
        // );

        // if (item) {
        //     await redis.hset(
        //         `cart:${cartSessionId}`,
        //         parsedBody.data.productId,
        //         JSON.stringify({
        //             inventoryId: parsedBody.data.inventoryId,
        //             quantity: Number(item) + parsedBody.data.quantity,
        //         }),
        //     )

        //     return res.status(200).json({
        //         message: "Item added to cart",
        //         cartSessionId: cartSessionId,
        //     });
        // }
        
        // add item to the cart
        await redis.hset(
            `cart:${cartSessionId}`,
            parsedBody.data.productId,
            JSON.stringify({
                inventoryId: parsedBody.data.inventoryId,
                quantity: parsedBody.data.quantity,
            }),
        );

        // update inventory
        await axios.put(
            `${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`,
            {
                quantity: parsedBody.data.quantity,
                actionType: "OUT",
            },
        );

        return res
            .status(200)
            .json({
                message: "Item added to cart",
                cartSessionId: cartSessionId,
            });

        // TODO: update inventory
    } catch (error) {
        console.log("🚀 ~add to cart error:", (error as Error).message);
        next(error);
    }
};

export default addToCart;
