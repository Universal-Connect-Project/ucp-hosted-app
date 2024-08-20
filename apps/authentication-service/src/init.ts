import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import { rateLimit } from "express-rate-limit";
import express, { Application, NextFunction, Request, Response } from "express";

import { errorHandler } from "@/middleware/errorMiddleware";
import { notFoundHandler } from "@/middleware/notFoundMiddleware";
import { clientsRoutes } from "@/resources/clients/clientsRoutes";

const rateLimitWindowMinutes = 10;
const rateLimitTest = process.env.RATE_LIMIT_TEST === "true" || false;

const initErrorHandling = (app: Application): void => {
  app.use(errorHandler);
  app.use(notFoundHandler);
};

export const initExpress = (app: Application): void => {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.set("json spaces", 2);

  const limiter = rateLimit({
    windowMs: rateLimitTest ? 2 * 1000 : rateLimitWindowMinutes * 60 * 1000, // (2 seconds for testing) or 10 minutes for production
    limit: rateLimitTest ? 5 : 500, // max average 5/500 requests per windowMs (2 seconds/10 minutes)
    message: `Too many requests from this IP, please try again after ${rateLimitWindowMinutes} minutes`,
    handler: (_req, res, _next, options) =>
      res
        .status(options.statusCode)
        .json({ message: options.message as string }),
  });
  app.use(limiter);

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
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],

      allowedHeaders: [
        "Access-Control-Allow-Origin",
        "Authorization",
        "Content-Type",
      ],
      maxAge: 86400,
    }),
  );

  // Routes
  clientsRoutes(app);

  app.get("/ping", (_req: Request, res: Response) => {
    res.send(
      JSON.stringify({
        message: "pong",
      }),
    );
  });

  // Keep this at the bottom
  initErrorHandling(app);
};
