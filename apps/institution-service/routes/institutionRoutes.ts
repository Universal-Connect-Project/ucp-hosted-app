import dotenv from "dotenv";
import { Router } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import {
  getAllInstitutions,
  getInstitutionCachedList,
} from "../controllers/institutionController";

dotenv.config();

const validateAccessToken = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

const router = Router();

router.get("/", getAllInstitutions);

router.get("/cacheList", [validateAccessToken], getInstitutionCachedList);

export default router;
