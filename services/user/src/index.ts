import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createUser, getUserById, getUsers } from "./controllers";




dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT || 4004;
const servicesName = process.env.SERVICES_NAME || "User-management";


app.get("/health", (_req, res) => {
   res.status(200).json({ status: "UP" });
});


// routes 
app.get("/users/:id", getUserById);
app.post("/users", createUser);
app.get("/users", getUsers);

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