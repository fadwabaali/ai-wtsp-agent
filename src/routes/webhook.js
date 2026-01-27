import express from "express";
import twilio from "twilio";
import { talkToAI } from "../agent/agent.js";

const router = express.Router();

router.post("/", async (req, res) => {

  const incomingMsg = req.body.Body;
  const mediaType = req.body.MediaContentType0;

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

    // TEXT → OLLAMA AI
    else {
      const aiReply = await talkToAI(incomingMsg);
      twiml.message(aiReply);
    }
  } catch (error) {
    console.error("Error:", error);
    twiml.message(
      "وقع شي مشكل صغير 😕✨ إلى سمحتي عاودي المحاولة من بعد شوية 🤍"
    );
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

export default router;
