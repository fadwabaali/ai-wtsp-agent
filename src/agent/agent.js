import fetch from "node-fetch";
import { SYSTEM_PROMPT } from "./prompt.js";

const OLLAMA_URL = "http://localhost:11434/api/chat"; // Ollama local server

export async function talkToAI(userMessage) {
  console.log("TALK TO AI:", userMessage);

  if (!userMessage) return "مرحبا 😊✨ كيفاش نقدر نعاونك اليوم؟ 🛍️🤍";

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:latest", // ✅ Use your installed model
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        stream: false
      })
    });

    const data = await response.json();
    console.log("🧠 AI RESPONSE:", data);

    return data.message?.content || "سمحي ليا ما فهمتش مزيان 🤍";
  } catch (err) {
    console.error("❌ OLLAMA ERROR:", err.message);
    return "كاين ضغط دابا 😅 عاودي المحاولة شوية 🤍";
  }
}
