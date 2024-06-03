import express, { Application, Request, Response } from "express";
import { validateAccessToken } from "@/middleware/auth0.middleware";

const apiRouter = express.Router();

function apiRoutes(app: Application): void {
  app.use("/api", apiRouter);

  apiRouter.get("/ping", (_req: Request, res: Response) => {
    res.send(
      JSON.stringify({
        message: "pong",
      }),
    );
  });

  apiRouter.post(
    "/createClient",
    validateAccessToken,
    (req: Request, res: Response) => {
      const body = req.body as string;

      console.log(body);

      res.send(
        JSON.stringify({
          message: "pong",
        }),
      );
    },
  );
  apiRouter.post(
    "/getClient",
    validateAccessToken,
    (req: Request, res: Response) => {
      const body = req.body as string;

      console.log(body);

      res.send(
        JSON.stringify({
          message: "pong",
        }),
      );
    },
  );
}

export default apiRoutes;
