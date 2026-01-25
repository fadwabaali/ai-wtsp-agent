import express from "express";
import bodyParser from "body-parser";

export function startServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", (req, res) => {
    res.send("Server is running");
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
}
