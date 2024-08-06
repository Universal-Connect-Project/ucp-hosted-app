import { Router } from "express";
import {
  getAllInstitutions,
} from "../controllers/institutionController";

const router = Router();

router.get("/", getAllInstitutions)

export default router;
