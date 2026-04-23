import express from "express";
import twilio from "twilio";

import { PRODUCTS } from "../data/products.js";
import { getSession, updateSession, clearSession } from "../services/sessionService.js";
import { saveOrder } from "../services/orderService.js";
import { isValidPhone, isValidQuantity } from "../utils/validators.js";
import { talkToAI } from "../agent/agent.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const incomingMsg = (req.body.Body || "").trim();
  const userId = req.body.From;
  const mediaType = req.body.MediaContentType0;

  const twiml = new twilio.twiml.MessagingResponse();
  const session = getSession(userId);

  try {
    // =========================
    // MEDIA HANDLING
    // =========================
    if (mediaType && mediaType.startsWith("image")) {
      return respond(twiml, res,
        "توصلنا بالصورة 😊✨ إلا سمحتي كتب لينا شنو بغيتي باش نعاونك 🤍"
      );
    }

    if (mediaType && mediaType.startsWith("audio")) {
      return respond(twiml, res,
        "توصلنا بالصوت 🎤 حاليا خدامين غير بالكتابة، كتب لينا شنو محتاجة 🤍"
      );
    }

    // =========================
    // AI TRIGGER (ONLY OUTSIDE FLOW)
    // =========================
    if (session.step === "START" && shouldUseAI(incomingMsg)) {
      const aiReply = await talkToAI(incomingMsg);
      return respond(twiml, res, aiReply);
    }

    // =========================
    // ORDER FLOW
    // =========================

    // START → ASK PRODUCT
    if (session.step === "START") {
      session.step = "ASK_PRODUCT";
      updateSession(userId, session);

      const productList = PRODUCTS.map(p => `- ${p.name}`).join("\n");

      return respond(twiml, res,
        `مرحبا 😊✨ مرحبا بك فـ Fatima Style!\n\nشنو بغيتي من هاد المنتجات:\n${productList}`
      );
    }

    // PRODUCT
    if (session.step === "ASK_PRODUCT") {
      const product = PRODUCTS.find(p =>
        p.name.toLowerCase().includes(incomingMsg.toLowerCase())
      );

      if (!product) {
        return respond(twiml, res,
          "سمحي ليا، هاد المنتج ما عندناش 🤍 جربي واحد من اللائحة"
        );
      }

      session.data.product = product.name;
      session.productRef = product;
      session.step = "ASK_SIZE";
      updateSession(userId, session);

      return respond(twiml, res,
        `شنو المقاس؟ ${product.sizes.join(" / ")}`
      );
    }

    // SIZE
    if (session.step === "ASK_SIZE") {
      if (!session.productRef.sizes.includes(incomingMsg)) {
        return respond(twiml, res,
          "اختاري مقاس صحيح 🤍"
        );
      }

      session.data.size = incomingMsg;
      session.step = "ASK_COLOR";
      updateSession(userId, session);

      return respond(twiml, res,
        `شنو اللون؟ ${session.productRef.colors.join(" / ")}`
      );
    }

    // COLOR
    if (session.step === "ASK_COLOR") {
      if (!session.productRef.colors.includes(incomingMsg)) {
        return respond(twiml, res,
          "اختاري لون صحيح 🤍"
        );
      }

      session.data.color = incomingMsg;
      session.step = "ASK_QTY";
      updateSession(userId, session);

      return respond(twiml, res,
        "شحال العدد؟"
      );
    }

    // QUANTITY
    if (session.step === "ASK_QTY") {
      if (!isValidQuantity(incomingMsg)) {
        return respond(twiml, res,
          "دخل عدد صحيح 🤍"
        );
      }

      session.data.quantity = incomingMsg;
      session.step = "ASK_CITY";
      updateSession(userId, session);

      return respond(twiml, res,
        "فين المدينة؟"
      );
    }

    // CITY
    if (session.step === "ASK_CITY") {
      session.data.city = incomingMsg;
      session.step = "ASK_PHONE";
      updateSession(userId, session);

      return respond(twiml, res,
        "عطينا رقم الهاتف 🤍"
      );
    }

    // PHONE
    if (session.step === "ASK_PHONE") {
      if (!isValidPhone(incomingMsg)) {
        return respond(twiml, res,
          "رقم غير صحيح 🤍"
        );
      }

      session.data.phone = incomingMsg;
      session.step = "CONFIRM";
      updateSession(userId, session);

      return respond(twiml, res,
        `تأكيد الطلب:\n
📦 ${session.data.product}
📏 ${session.data.size}
🎨 ${session.data.color}
🔢 ${session.data.quantity}
📍 ${session.data.city}
📞 ${session.data.phone}

كتب YES باش تأكد 🤍`
      );
    }

    // CONFIRM
    if (session.step === "CONFIRM") {
      if (incomingMsg.toLowerCase() === "yes") {
        saveOrder(session.data);
        clearSession(userId);

        return respond(twiml, res,
          "تم تأكيد الطلب ديالك 🎉 شكرا بزاف 🤍"
        );
      } else {
        return respond(twiml, res,
          "كتب YES باش تأكد الطلب 🤍"
        );
      }
    }

  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return respond(twiml, res,
      "وقع مشكل 😅 عاودي المحاولة من بعد 🤍"
    );
  }
});

// =========================
// HELPERS
// =========================

function respond(twiml, res, message) {
  twiml.message(message);
  res.type("text/xml");
  return res.send(twiml.toString());
}

function shouldUseAI(message) {
  if (!message) return false;

  const triggers = [
    "ثمن", "prix", "price",
    "واش", "عندكم", "كاين",
    "شنو", "help", "?"
  ];

  return triggers.some(word =>
    message.toLowerCase().includes(word)
  );
}

export default router;