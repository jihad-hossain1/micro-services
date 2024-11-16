"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = exports.getMiddlewares = exports.createHandler = void 0;
const config_json_1 = __importDefault(require("./config.json"));
const axios_1 = __importDefault(require("axios"));
const middlewares_1 = __importDefault(require("./middlewares"));
const createHandler = (hostName, path, method) => {
    return async (req, res, next) => {
        try {
            let url = `${hostName}${path}`;
            req.params &&
                Object.keys(req.params).forEach((param) => {
                    url = url.replace(`:${param}`, req.params[param]);
                });
            const { data } = await (0, axios_1.default)({
                method,
                url,
                data: req.body,
                headers: {
                    origin: "http://localhost:8081",
                    "x-user-id": req.headers["x-user-id"] || "",
                    "x-user-role": req.headers["x-user-role"] || "",
                    "x-user-name": req.headers["x-user-name"] || "",
                    "x-user-email": req.headers["x-user-email"] || "",
                    "user-agent": req.headers["user-agent"] || "",
                }
            });
            res.status(200).json(data);
        }
        catch (error) {
            if (error instanceof axios_1.default.AxiosError) {
                return res.status(error.response?.status || 500).json({
                    error: error.response?.data || error.message,
                });
            }
            return res.status(500).json({
                error: error.message,
                message: "Internal server error",
            });
        }
    };
};
exports.createHandler = createHandler;
const getMiddlewares = (names) => {
    return names.map((name) => {
        return middlewares_1.default[name];
    });
};
exports.getMiddlewares = getMiddlewares;
const configureRoutes = (app) => {
    Object.entries(config_json_1.default.services).forEach(([name, service]) => {
        const hostName = service.url;
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const endPoint = `/api${route.path}`;
                const middleware = (0, exports.getMiddlewares)(route.middlewares);
                const handler = (0, exports.createHandler)(hostName, route.path, method);
                app[method](endPoint, ...middleware, handler);
            });
        });
    });
};
exports.configureRoutes = configureRoutes;
