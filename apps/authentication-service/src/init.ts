import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import nocache from "nocache";
import { initRoutes } from "@/resources";
import { errorHandler } from "@/middleware/errorMiddleware";
import { notFoundHandler } from "@/middleware/notFoundMiddleware";

const initErrorHandling = (app: Application): void => {
  app.use(errorHandler);
  app.use(notFoundHandler);
};

export const initExpress = (app: Application): void => {
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
  initRoutes(app);

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
