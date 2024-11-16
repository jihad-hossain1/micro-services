"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const utils_1 = require("./utils");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("./swagger-output.json"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
const port = process.env.PORT || 8081;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    handler: (_req, res, next) => {
        res.status(429).send("Too many requests, please try again later.");
    }
});
app.use('/api', limiter);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// routes
(0, utils_1.configureRoutes)(app);
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP" });
});
// error handler
app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
