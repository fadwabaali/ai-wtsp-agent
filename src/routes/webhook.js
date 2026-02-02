import express from "express";
import twilio from "twilio";
import { talkToAI } from "../agent/agent.js";

const router = express.Router();
router.post("/", async (req, res) => {
  console.log("🔥 WEBHOOK HIT");
  console.log("BODY FULL:", req.body);

  const incomingMsg = req.body.Body;
  const mediaType = req.body.MediaContentType0;

  console.log("TEXT:", incomingMsg);
  console.log("MEDIA:", mediaType);

  const twiml = new twilio.twiml.MessagingResponse();

  try {
    if (mediaType && mediaType.startsWith("image")) {
      twiml.message("صورة وصلات 📸");
    } 
    else if (mediaType && mediaType.startsWith("audio")) {
      twiml.message("صوت وصل 🎤");
    } 
    else {
      twiml.message("نص وصل ✅");
    }
  } catch (err) {
    console.error(err);
    twiml.message("error");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});


export default router;
