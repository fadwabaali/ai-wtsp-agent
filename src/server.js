import express from "express";
import bodyParser from "body-parser";
import webhookRoutes from "./routes/webhook.js";


export function startServer() {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    res.send("Server is running");
  });
  app.use("/webhook", webhookRoutes);
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
}

