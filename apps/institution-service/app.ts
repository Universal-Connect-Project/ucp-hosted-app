import dotenv from "dotenv";
import express, { Request, Response } from "express";
import logger from "morgan";
import institutionRoutes from "./routes/institutionRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json()); // http://expressjs.com/en/api.html#express.json
app.use(express.urlencoded({ extended: false })); // http://expressjs.com/en/5x/api.html#express.urlencoded
app.use(logger("dev"));

// Routes
app.use("/institutions", institutionRoutes);

app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`);
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Greetings.");
});