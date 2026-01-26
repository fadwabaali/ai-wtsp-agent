import express from "express";
import twilio from "twilio";

const router = express.Router();

// This is where WhatsApp messages arrive
router.post("/", (req, res) => {
  const incomingMsg = req.body.Body;
  const from = req.body.From;

  console.log("Message:", incomingMsg);
  console.log("From:", from);

  // Twilio response
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message("Hello from my bot");

  res.type("text/xml");
  res.send(twiml.toString());
});

export default router;
