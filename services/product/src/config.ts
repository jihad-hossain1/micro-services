import dotenv from "dotenv";
dotenv.config();

export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || "http://localhost:4002"