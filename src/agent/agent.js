import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompt.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function talkToAI(userMessage) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });

  return response.choices[0].message.content;
}
