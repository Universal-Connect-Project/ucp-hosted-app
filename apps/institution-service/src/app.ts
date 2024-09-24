import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import logger from "morgan";

import institutionRoutes from "./routes/institutionRoutes";
import { PORT } from "./shared/const";
import permissionsRoutes from "./routes/permissionRoutes";

const app = express();

app.set("etag", "strong");
app.use(express.json()); // http://expressjs.com/en/api.html#express.json
app.use(express.urlencoded({ extended: false })); // http://expressjs.com/en/5x/api.html#express.urlencoded
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

// Routes
app.use("/institutions", institutionRoutes);
app.use("/permissions", permissionsRoutes);

app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`);
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Greetings.");
});
