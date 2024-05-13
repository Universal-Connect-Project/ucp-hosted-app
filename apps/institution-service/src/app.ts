import dotenv from 'dotenv';
import express, { Express, Request, Response } from "express";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`)
})

app.get("/ping", (req: Request, res: Response) => {
  res.send("Greetings.")
});
