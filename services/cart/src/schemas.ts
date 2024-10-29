import {z} from "zod";



export const CartCreateDTOSchema = z.object({
    productId: z.string(),
    inventoryId: z.string(),
    quantity: z.number().int(),
})

