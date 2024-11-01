
import { z } from "zod";

export const OrderCreateDTOSchema = z.object({
   userId : z.string(),
   userName : z.string(),
   userEmail: z.string(),
   cartSessionId: z.string(),
})

export const OrderItemDTOSchema = z.object({
    orderId: z.string(),
    productId: z.string(),
    productName: z.string(),
    sku: z.string(),
    price: z.string(),
    quantity: z.number().int(),
    total: z.number().int(),
})

export const CartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int(),
    inventoryId: z.string(),
})