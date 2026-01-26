import express from "express";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config(); // Load .env so OpenAI API key is available
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../agent/prompt.js";

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function for AI reply
async function talkToAI(userMessage) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key missing! Check your .env file.");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });

  return response.choices[0].message.content;
}

router.post("/", async (req, res) => {
  const incomingMsg = req.body.Body;
  const mediaType = req.body.MediaContentType0;

  const twiml = new twilio.twiml.MessagingResponse();

  try {
    // 📸 IMAGE
    if (mediaType && mediaType.startsWith("image")) {
      twiml.message(
        "توصلنا بالصورة 😊✨ إلى سمحتي قولي لينا فالكلام شنو بغيتِ بالضبط باش نعاونك 🤍🛍️"
      );
    }
    // 🎤 AUDIO
    else if (mediaType && mediaType.startsWith("audio")) {
      twiml.message(
        "توصلنا بالرسالة الصوتية 🎤✨ حاليا كنخدمو غير بالكلام المكتوب، إلى سمحتي كتبِ لينا شنو محتاجة 😊🤍"
      );
    }
    // ✍️ TEXT → AI
    else {
      const aiReply = await talkToAI(incomingMsg);
      twiml.message(aiReply);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    twiml.message(
      "وقع شي مشكل صغير 😕✨ إلى سمحتي عاودي المحاولة من بعد شوية 🤍"
    );
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

export default router;
