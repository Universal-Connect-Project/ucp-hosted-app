import envs from "./config";
import express from "express";
import { initExpress } from "./init";

export const SERVICE_NAME = "ucp-authentication-service";
const PORT = parseInt(envs.PORT, 10) || 8089;

const app = express();

initExpress(app);

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is listening on port ${PORT}`);
});
