// import config from "@/config";
import { validateAccessToken } from "@/middleware/auth.middleware";
import { Request, Response, Router } from "express";

function authRoutesV1(router: Router): void {
  // const baseAuth0Url = `https://${config.AUTH0_DOMAIN}`;

  router.get("/ping", (_req: Request, res: Response) => {
    res.send(
      JSON.stringify({
        message: "pong",
      }),
    );
  });

  router.get("/post-login", (_req: Request, res: Response) => {
    res.send(
      JSON.stringify({
        message: "post-login",
      }),
    );
  });

  router.post("/client", validateAccessToken, (req: Request, res: Response) => {
    const body = req.body as string;

    console.log(body);

    res.send(
      JSON.stringify({
        message: "pong",
      }),
    );
  });

  router.post("/client", validateAccessToken, (req: Request, res: Response) => {
    const body = req.body as string;

    console.log(body);

    res.send(
      JSON.stringify({
        message: "pong",
      }),
    );
  });
}

export default authRoutesV1;
