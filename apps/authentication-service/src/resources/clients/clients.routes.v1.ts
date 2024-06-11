import { validateAccessToken } from "@/middleware/auth.middleware";
import { Request, Response, Router } from "express";

function clientsRoutesV1(router: Router): void {
  router.get("/ping", (_req: Request, res: Response) => {
    res.send(
      JSON.stringify({
        message: "pong",
      }),
    );
  });

  router.get("/client", validateAccessToken, (req: Request, res: Response) => {
    const body = req.body as string;

    console.log(body);

    res.send(
      JSON.stringify({
        message: "coming soon...(client get)",
      }),
    );
  });

  router.post("/client", validateAccessToken, (req: Request, res: Response) => {
    const body = req.body as string;

    console.log(body);

    res.send(
      JSON.stringify({
        message: "coming soon...(client post)",
      }),
    );
  });
}

export default clientsRoutesV1;
