import "./dotEnv";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import logger from "morgan";
import eventRoutes from "./routes/eventRoutes";
import { PORT } from "./shared/consts/port";
import { beginPollAndProcessEvents } from "./services/storageClient/redis";
import performanceRoutingEndpoints from "./performanceRouting/performanceRoutingEndpoints";
import aggregatorGraphEndpoints from "./aggregatorGraphMetrics/aggregatorGraphEndpoints";
import aggregatorMetricsEndpoints from "./aggregatorMetrics/aggregatorMetricsEndpoints";

const app = express();

if (process.env.DISABLE_RATE_LIMITING !== "true") {
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      limit: 100, // Limit to 100 requests per windowMs
      handler: (_req, res, _next, _options) =>
        res.status(429).json({ message: "Too many requests" }),
    }),
  );
}

app.use(logger("dev"));
app.use(express.json());
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
  res.send(
    JSON.stringify({
      message: "pong",
    }),
  );
});

// Routes
app.use("/events", eventRoutes);
app.use(aggregatorGraphEndpoints);
app.use(performanceRoutingEndpoints);
app.use(aggregatorMetricsEndpoints);

app.listen(process.env.PORT || PORT, () => {
  console.info(
    `Performance Service listening on port ${process.env.PORT || PORT}`,
  );
  beginPollAndProcessEvents();
});

app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(
  (
    err: { name: string; status: number; message: string },
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (err?.name === "InvalidTokenError") {
      return res.status(err?.status || 401).json({ error: err?.message });
    }
    next(err);
  },
);
