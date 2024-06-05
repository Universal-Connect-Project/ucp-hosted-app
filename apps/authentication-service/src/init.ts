import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import nocache from "nocache";
import initRoutes from "@/resources";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";

// import envs from "./config";

// const CLIENT_ORIGIN_URL = envs.CLIENT_ORIGIN_URL;

function initErrorHandling(app: Application): void {
  app.use(errorHandler);
  app.use(notFoundHandler);
}

export function initExpress(app: Application): void {
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
    cors(), // <-- for testing...tighten it up when we're ready for deployment
    // cors({
    //   origin: CLIENT_ORIGIN_URL,
    //   methods: ["GET", "POST"],
    //
    //   allowedHeaders: [
    //     "Access-Control-Allow-Origin",
    //     "Authorization",
    //     "Content-Type",
    //   ],
    //   maxAge: 86400,
    // }),
  );

  // Routes
  initRoutes(app);

  // Keep this at the bottom
  initErrorHandling(app);
}
