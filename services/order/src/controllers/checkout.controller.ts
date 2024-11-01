import { CART_SERVICE, EMAIL_SERVICE, PRODUCT_SERVICE } from "@/config";
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { CartItemSchema, OrderCreateDTOSchema } from "@/schemas";
import { z } from "zod";
import prisma from "@/prisma";

export const checkout: any = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const parsedBody = OrderCreateDTOSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }

        const { data: cartData } = await axios.get(`${CART_SERVICE}/cart/me`, {
            headers: {
                "x-cart-session-id": parsedBody.data.cartSessionId,
            },
        });

        const cartItem = z.array(CartItemSchema).safeParse(cartData.data);

        if (!cartItem.success) {
            return res.status(400).json({ error: cartItem.error.errors });
        }

        if (cartItem.data.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // get product details
        const productDetails = await Promise.all(
            cartItem.data.map(async (item) => {
                const { data: productData } = await axios.get(
                    `${PRODUCT_SERVICE}/products/${item.productId}`,
                );
                return {
                    productId: productData.id as string,
                    prodcutName: productData.name as string,
                    sku: productData.sku as string,
                    price: productData.price as number,
                    quantity: item.quantity as number,
                    total: Number(productData?.price) * Number(item?.quantity),
                };
            }),
        );

        const subTotal = productDetails?.reduce(
            (acc, item) => Number(acc) + Number(item.total),
            0,
        );

        const tax = 0;
        const grandTotal = Number(subTotal) + tax;

        const order = await prisma.order.create({
            data: {
                userId: parsedBody.data.userId,
                userName: parsedBody.data.userName,
                userEmail: parsedBody.data.userEmail,
                subTotal,
                tax,
                grandTotal: Number(grandTotal),
                orderItmes: {
                    create: productDetails.map((item) => ({
                        productName: item.prodcutName,
                        productId: item.productId,
                        sku: item.sku,
                        price: String(item.price),
                        quantity: item.quantity as number,
                        total: Number(item.total),
                    })),
                },
            },
        });

        // clear cart
        await axios.get(`${CART_SERVICE}/cart/clear`, {
            headers: {
                "x-cart-session-id": parsedBody.data.cartSessionId,
            },
        });

        const bodyData = {
            recipient: parsedBody.data?.userEmail,
            subject: "Order Confirmation",
            source: "checkout",
            body: `Thank you for your order. Your order number is ${order.id}. your otder total is ${grandTotal}`,
        };

        // send email
         await axios.post(
            `${EMAIL_SERVICE}/emails/send`,
            bodyData,
        );

        return res
                .status(200)
                .json(order);
    } catch (error) {
        console.log((error as Error).message);
        next(error);
    }
};

export default checkout;
