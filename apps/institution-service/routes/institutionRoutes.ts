import { Router } from "express";
import {
  createInstitution,
  deleteInstitution,
  getAllInstitutions,
  getInstitutionById,
} from "../controllers/institutionController";

const router = Router();

router.get("/", getAllInstitutions);

router.get("/:id", getInstitutionById);

router.put("/:id", async (req, res) => {
  res.send(`TODO: build this PUT /institutions/${req.params.id} endpoint`);
});

router.post("/", createInstitution);

router.delete("/:id", deleteInstitution);

export default router;
