import cors from "cors";
import envs from "./config";
import express, { Request, Response, NextFunction } from "express";
import nocache from "nocache";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";

export const SERVICE_NAME = "ucp-authentication-service";
const PORT = parseInt(envs.PORT, 10);
const CLIENT_ORIGIN_URL = envs.CLIENT_ORIGIN_URL;

const app = express();
const apiRouter = express.Router();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("json spaces", 2);

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
    },
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        "default-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
    frameguard: {
      action: "deny",
    },
  }),
);

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.contentType("application/json; charset=utf-8");
  next();
});
app.use(nocache());

app.use(
  cors({
    origin: CLIENT_ORIGIN_URL,
    methods: ["GET"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 86400,
  }),
);

app.use("/api", apiRouter);

apiRouter.get("/ping", (_req: Request, res: Response) => {
  res.send(
    JSON.stringify({
      message: "pong",
    }),
  );
});

app.use(errorHandler);
app.use(notFoundHandler);

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is listening on port ${PORT}`);
});
