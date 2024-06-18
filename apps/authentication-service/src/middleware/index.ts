import { Application } from "express";
import { errorHandler } from "@/middleware/errorMiddleware";
import { notFoundHandler } from "@/middleware/notFoundMiddleware";

const initMiddleware = (app: Application) => {
  app.use(errorHandler);
  app.use(notFoundHandler);
};

export default initMiddleware;
