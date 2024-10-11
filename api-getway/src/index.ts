import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { configureRoutes } from "./utils";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());

const port = process.env.PORT || 8081;


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
   handler: (_req, res, next) => {
       res.status(429).send("Too many requests, please try again later.");
   }
});
app.use('/api',limiter);

app.use(express.json());
app.use(morgan("dev"));

// routes
configureRoutes(app);

app.get("/health", (_req, res) => {
   res.status(200).json({ status: "UP" });
});

// error handler
app.use((_req, res) => {
   res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
   console.log(`Server running on port ${port}`);
})