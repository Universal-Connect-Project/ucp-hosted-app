import "./dotEnv";
import cors from "cors";
import { CronJob } from "cron";
import express, { NextFunction, Request, Response } from "express";
import logger from "morgan";
import sequelize from "./database";
import { defineAssociations } from "./models/associations";
import aggregatorIntegrationRoutes from "./routes/aggregatorIntegrationRoutes";
import aggregatorRoutes from "./aggregators/aggregatorEndpoints";
import institutionRoutes from "./institutions/institutionEndpoints";
import permissionsRoutes from "./routes/permissionRoutes";
import aggregatorInstitutionRoutes from "./aggregatorInstitutions/aggregatorInstitutionEndpoints";
import { PORT } from "./shared/const";
import performanceAuthEndpoints from "./performanceAuth/performanceAuthEndpoints";
import {
  AGGREGATOR_INSTITUTIONS_ROUTE,
  INSTITUTIONS_ROUTE,
  PERFORMANCE_AUTH_ROUTE,
} from "./shared/consts/routes";
import { useRateLimiting } from "./useRateLimiting";
import { syncInstitutions } from "./aggregatorInstitutions/sync/syncInstitutions";

sequelize
  .authenticate()
  .then(() => {
    defineAssociations();
    console.log("Database initialized");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

CronJob.from({
  cronTime: "0 0 0 * * *",
  onTick: async () => {
    try {
      await syncInstitutions();
    } catch (error) {
      console.error("Failed to sync institutions:", error);
    }
  },
  start: true,
  timeZone: "America/Denver",
});

const app = express();

useRateLimiting(app);

app.set("etag", "strong");
app.use(express.json()); // http://expressjs.com/en/api.html#express.json
app.use(express.urlencoded({ extended: false })); // http://expressjs.com/en/5x/api.html#express.urlencoded
app.use(logger("dev"));
app.set("trust proxy", 1);

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
app.use(INSTITUTIONS_ROUTE, institutionRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/aggregatorIntegrations", aggregatorIntegrationRoutes);
app.use("/aggregators", aggregatorRoutes);
app.use(PERFORMANCE_AUTH_ROUTE, performanceAuthEndpoints);
app.use(AGGREGATOR_INSTITUTIONS_ROUTE, aggregatorInstitutionRoutes);

app.listen(process.env.PORT || PORT, () => {
  console.info(
    `Institution Service listening on port ${process.env.PORT || PORT}`,
  );
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Greetings.");
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
