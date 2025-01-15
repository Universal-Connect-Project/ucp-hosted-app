import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "dist" directory
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route to serve index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`ucp-ui is running on port ${PORT}`);
});
