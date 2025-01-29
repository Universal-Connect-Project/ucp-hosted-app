import cors from "cors";
import express, { Request, Response } from "express";
import logger from "morgan";
import "./dotEnv";

import { rateLimit } from "express-rate-limit";
import sequelize from "./database";
import { defineAssociations } from "./models/associations";
import aggregatorIntegrationRoutes from "./routes/aggregatorIntegrationRoutes";
import aggregatorRoutes from "./routes/aggregatorRoutes";
import institutionRoutes from "./routes/institutionRoutes";
import permissionsRoutes from "./routes/permissionRoutes";
import { PORT } from "./shared/const";

const createLimiter = (
  options: { timeIntervalInMinutes: number; requestLimit: number } = {
    timeIntervalInMinutes: 1,
    requestLimit: 100,
  },
) => {
  const { timeIntervalInMinutes, requestLimit } = options;
  return rateLimit({
    windowMs: timeIntervalInMinutes * 60 * 1000, // 1 minute
    limit: requestLimit, // Limit to 100 requests per windowMs
    handler: (_req, res, _next, _options) =>
      res.status(429).json({ message: "Too many requests" }),
  });
};

const defaultLimiter = createLimiter();

const cacheListLimiter = createLimiter({
  timeIntervalInMinutes: 1,
  requestLimit: 3,
});

sequelize
  .authenticate()
  .then(() => {
    defineAssociations();
    console.log("Database initialized");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

const app = express();

if (process.env.DISABLE_RATE_LIMITING !== "true") {
  app.use(defaultLimiter);
  app.use("/institutions/cacheList", cacheListLimiter);
}

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
app.use("/institutions", institutionRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/aggregatorIntegrations", aggregatorIntegrationRoutes);
app.use("/aggregators", aggregatorRoutes);

app.listen(process.env.PORT || PORT, () => {
  console.info(
    `Institution Service listening on port ${process.env.PORT || PORT}`,
  );
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Greetings.");
});
