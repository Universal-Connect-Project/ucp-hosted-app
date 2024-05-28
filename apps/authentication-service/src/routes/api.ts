import express, { Application, Request, Response } from "express";

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
}

export default apiRoutes;
