import { Status } from "@prisma/client";
import { z } from "zod";

export const ProductCreateDTOSchema = z.object({
    name: z.string(),
    price: z.number().optional().default(0),
    description: z.string().max(1000).optional(),
    sku: z.string().min(3).max(10),
    status: z.nativeEnum(Status).optional().default(Status.DRAFT),
});
