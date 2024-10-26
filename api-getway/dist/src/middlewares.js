"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const auth = async (req, res, next) => {
    if (!req.headers["authorization"]) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const token = req.headers["authorization"].split(" ")[1];
        const { data } = await axios_1.default.post("http://localhost:4006/auth/verify-token", {
            accessToken: token,
            headers: {
                ip: req.ip,
                "user-agent": req.headers["user-agent"]
            }
        });
        req.headers['x-user-id'] = data.user.id;
        req.headers['x-user-role'] = data.user.role;
        req.headers['x-user-name'] = data.user.name;
        req.headers['x-user-email'] = data.user.email;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
const middlewares = { auth };
exports.default = middlewares;
