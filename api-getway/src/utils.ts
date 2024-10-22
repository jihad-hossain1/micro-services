import { Express, Request, Response, NextFunction } from "express";
import config from "./config.json";
import axios from "axios";
import middlewares from "./middlewares";

export const createHandler = (
    hostName: string,
    path: string,
    method: string,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            let url = `${hostName}${path}`;

            req.params &&
                Object.keys(req.params).forEach((param) => {
                    url = url.replace(`:${param}`, req.params[param]);
                });

            const { data } = await axios({
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
        } catch (error) {
            if (error instanceof axios.AxiosError) {
                return res.status(error.response?.status || 500).json({
                    error: error.response?.data || error.message,
                });
            }
            return res.status(500).json({
                error: (error as Error).message,
                message: "Internal server error",
            });
        }
    };
};

export const getMiddlewares = (names: string[]) => {
    return names.map((name) => {
        return middlewares[name];
    });
}

export const configureRoutes = (app: Express) => {
    Object.entries(config.services).forEach(([name, service]) => {
        const hostName = service.url;
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const endPoint = `/api${route.path}`;
                const middleware = getMiddlewares(route.middlewares);
                const handler = createHandler(hostName, route.path, method);
                app[method](endPoint,...middleware, handler);
            });
        });
    });
};
