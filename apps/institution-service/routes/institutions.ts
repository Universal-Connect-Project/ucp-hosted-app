import { Router } from "express";
import { Institution } from "../models/institution";
import { Provider, supportedProviders } from "../models/provider";

const router = Router();

router.get("/", async (req, res) => {
  const inster = await Institution.findOne({
    where: { ucp_id: "UCP-123456789" },
  });
  console.log("test", inster);
  const providers = await inster?.getProviders();
  console.log("providers", inster?.providers);
  const ins = Institution.build({
    ucp_id: "UCP-123",
    name: "test bank",
    logo: "nothing",
    url: "nothing",
    keywords: "hi",
    is_test_bank: false,
    is_hidden: false,
    routing_numbers: [],
  });
  ins.save();
  const prover = await Provider.create({
    provider: supportedProviders.MX,
    supports_oauth: false,
    institution_id: "UCP-123",
  });
  console.log("hi");
  res.send("this is GET /institutions");
});

router.get("/:id", async (req, res) => {
  res.send(`this is GET /institutions/${req.params.id}`);
});

router.put("/:id", async (req, res) => {
  res.send(`this is PUT /institutions/${req.params.id}`);
});

router.delete("/:id", async (req, res) => {
  // try {
  //   await Institution.findByIdAndDelete(req.params.id);
  //   res.json({ message: 'Institution deleted' });
  // } catch (err: any) {
  //   res.status(500).json({ error: err?.message });
  // }
});

export default router;
