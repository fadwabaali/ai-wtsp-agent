import ollama from "ollama";
import { SYSTEM_PROMPT } from "./prompt.js";

export async function talkToAI(userMessage) {
  const response = await ollama.chat({
    model: "llama3",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });

  return response.message.content;
}
