import { Router } from "express";
import { Institution } from "../models/institution";

const router = Router();

router.get("/", async (req, res) => {
  const institutions = await Institution.findAll();
  res.json(institutions);
});

router.get("/:id", async (req, res) => {
  const institution = await Institution.findByPk(req.params.id, {
    include: [Institution.associations.providers],
  });
  res.json(institution);
});

router.put("/:id", async (req, res) => {
  res.send(`TODO: build this PUT /institutions/${req.params.id} endpoint`);
});

router.post("/", async (req, res) => {
  try {
    const institution = await Institution.create(req.body);

    res.status(201).json(institution);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create institution" });
  }
});

router.delete("/:id", async (req, res) => {
  const institution = await Institution.findByPk(req.params.id);

  if (await institution?.destroy()) {
    res.status(204);
    res.json({ message: "Institution deleted" });
  } else {
    res.status(400);
    res.send("Failure to delete");
  }
});

export default router;
