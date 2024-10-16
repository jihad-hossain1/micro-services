import { z } from "zod";


export const UserCreateDTOSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(256),
    name: z.string().min(3).max(250),
})


export const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const AccessTokenSchema = z.object({
    accessToken: z.string()
})