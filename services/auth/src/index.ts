import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { userLogin, userRegistration, verifyEmail, verifyToken } from "./controllers";





dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT || 3004;
const servicesName = process.env.SERVICES_NAME || "AUTH-management";


app.get("/health", (_req, res) => {
   res.status(200).json({ status: "UP" });
});


// routes 
app.post('/auth/register', userRegistration);
app.post('/auth/login', userLogin);
app.post('/auth/verify-token', verifyToken);
app.post('/auth/verify-email', verifyEmail);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});


// Error handler
app.use((err: Error, _req, res, _next) => {
    res.status(500).json({ error: err.message , message: "Internal Server Error" });
});


app.listen(port, () => {
    console.log(`${servicesName} Server started on port ${port}`);
});