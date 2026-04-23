import express from "express";
import twilio from "twilio";
import { talkToAI } from "../agent/agent.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🔥 WEBHOOK HIT");
  console.log("BODY:", req.body);

  const incomingMsg = req.body.Body || req.body.body || ""; // text
  const mediaType = req.body.MediaContentType0; // image/audio

  console.log("TEXT:", incomingMsg);
  console.log("MEDIA:", mediaType);

  const twiml = new twilio.twiml.MessagingResponse();

  try {
    // IMAGE MESSAGE
    if (mediaType && mediaType.startsWith("image")) {
      twiml.message(
        "توصلنا بالصورة 😊✨ إلى سمحتي قولي لينا فالكلام شنو بغيتِ بالضبط باش نعاونك 🤍🛍️"
      );
    }
    // AUDIO MESSAGE
    else if (mediaType && mediaType.startsWith("audio")) {
      twiml.message(
        "توصلنا بالرسالة الصوتية 🎤✨ حاليا كنخدمو غير بالكلام المكتوب، إلى سمحتي كتبِ لينا شنو محتاجة 😊🤍"
      );
    }
    // TEXT MESSAGE → AI
    else if (incomingMsg.trim() !== "") {
      console.log("TEXT RECEIVED FOR AI:", incomingMsg);
      const aiReply = await talkToAI(incomingMsg);
      console.log("AI REPLIED:", aiReply);
      twiml.message(aiReply);
    }
    //EMPTY MESSAGE FALLBACK
    else {
      twiml.message(
        "مرحبا 😊✨ كيفاش نقدر نعاونك اليوم؟ 🛍️🤍"
      );
    }
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    twiml.message(
      "وقع شي مشكل صغير 😕✨ إلى سمحتي عاودي المحاولة من بعد شوية 🤍"
    );
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

export default router;
