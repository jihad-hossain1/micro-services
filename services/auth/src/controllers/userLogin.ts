import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { UserLoginSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@prisma/client";


type LoginHistory = {
    userId: string;
    ipAddress: string | undefined;
    userAgent: string | undefined;
    attempt: LoginAttempt;
}

const createLoginHistory = async(info: LoginHistory)=>{
    await prisma.loginHistory.create({
        data: info
    })
}


const userLogin: any = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || '';
        const userAgent = req.headers['user-agent'] || '';
    
        //
        const parsedBody = UserLoginSchema.safeParse(req.body);
        
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }
        
        
        const { email, password } = parsedBody.data;


        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        console.log("🚀 ~ user:", user)

        if (!user) {
            // await createLoginHistory({ userId: "Guest", ipAddress, userAgent, attempt: 'FAILED' });
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            await createLoginHistory({ userId: user.id, ipAddress, userAgent, attempt: 'FAILED' });
            return res.status(401).json({ error: "Invalid password" });
        }

        // check if the user is verified
        if (!user.verified) {
            await createLoginHistory({ userId: user.id, ipAddress, userAgent, attempt: 'FAILED' });
            return res.status(401).json({ error: "User not verified" });
        }

        // check if the user is active
        if (user.status !== "ACTIVE") {
            await createLoginHistory({ userId: user.id, ipAddress, userAgent, attempt: 'FAILED' });
            return res.status(401).json({ error: `Your account is ${user.status}` });
        }

        // generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        

        await createLoginHistory({ userId: user.id, ipAddress, userAgent, attempt: 'SUCCESS' });
        return res.status(200).json({ accessToken:  token });
    } catch (error) {
        next(error);
    }


}



export default userLogin


