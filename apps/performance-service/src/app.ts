import cors from "cors";
import "dotenv/config";
import express, { Request, RequestHandler, Response } from "express";
import logger from "morgan";

import { rateLimit } from "express-rate-limit";

const app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  handler: (_req, res, _next, _options) =>
    res.status(429).json({ message: "Too many requests" }),
}) as unknown as RequestHandler;

app.use(limiter);
app.use(express.json());
app.use(logger("dev"));
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

app.get("/ping", (_req: Request, res: Response) => {
  res.send({ message: "pong" });
});

app.listen(process.env.PORT || 8055, () => {
  console.info(`App listening on port ${process.env.PORT || 8055}`);
});
