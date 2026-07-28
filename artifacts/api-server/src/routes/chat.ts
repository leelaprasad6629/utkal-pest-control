import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";

const router = Router();

/**
 * Tighter per-IP rate limit for the chat endpoint to keep Gemini API
 * usage and cost under control. 20 messages / minute / IP.
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages. Please slow down." },
});

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

const FALLBACK_REPLY =
  "Sorry, I'm currently unavailable. Please contact us through WhatsApp.";

/**
 * System instruction that turns Gemini into a professional customer-support
 * executive for Utkal Pest Control. Keeps answers on-topic and safe.
 */
const SYSTEM_PROMPT = [
  "You are a professional, friendly customer support executive for Utkal Pest Control,",
  "a trusted provider of eco-friendly pest control services across India.",
  "",
  "Your role:",
  "- Assist customers with questions about our pest control services, booking process, pricing, safety, service areas, and general FAQs.",
  "- Services we offer: Residential Pest Control, Commercial Pest Control, Termite Treatment, Cockroach Control, Mosquito Control / Fumigation, Rodent Control, Bed Bug Treatment, and Agricultural Advisory services.",
  "- Be concise, professional, and helpful. Keep answers short (under 120 words) unless the customer asks for more detail.",
  "- If a customer wants to book a service, encourage them to use the Book a Service option or visit the Get Quote page.",
  "- If a customer wants to speak to a human, suggest the WhatsApp Support option.",
  "- If a customer asks for our phone number, provide it: +91 70938 23752.",
  "- Never make up specific prices. Explain that final pricing depends on property size, pest type and severity, and encourage them to request a quote.",
  "",
  "Important boundaries:",
  "- Only answer questions related to Utkal Pest Control services, pest control in general, booking, pricing, safety, and service areas.",
  "- If a user asks about topics unrelated to pest control (e.g. politics, sports, coding, other companies), politely explain that you can only assist with Utkal Pest Control services and steer the conversation back.",
  "- Never generate misleading information. If you do not know something, say so and suggest contacting support via WhatsApp.",
  "",
  "Always be polite, warm, and professional, as a real customer support executive would be.",
].join("\n");

interface ChatMessage {
  role: string;
  content: string;
}

/**
 * POST /api/chat
 * Body: { message: string, history?: ChatMessage[] }
 * Returns: { reply: string, unavailable?: boolean }
 *
 * Calls the Google Gemini API server-side so the API key is never exposed
 * to the client. If GEMINI_API_KEY is missing or the call fails, a friendly
 * fallback message is returned instead of crashing.
 */
router.post("/chat", chatLimiter, async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = req.body as { message?: string; history?: ChatMessage[] };
    const message = body.message;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    // No API key configured — return a friendly message instead of crashing.
    if (!apiKey) {
      logger.warn("GEMINI_API_KEY is not set; chatbot returning fallback message");
      return res.status(200).json({ reply: FALLBACK_REPLY, unavailable: true });
    }

    // Build the contents payload for Gemini from the conversation history.
    const contents = [
      ...(body.history ?? []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      GEMINI_MODEL +
      ":generateContent?key=" +
      apiKey;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error({ status: response.status, errText }, "Gemini API error");
      return res.status(200).json({ reply: FALLBACK_REPLY, unavailable: true });
    }

    const data = await response.json();
    const reply: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      return res.status(200).json({ reply: FALLBACK_REPLY, unavailable: true });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    logger.error({ err: error }, "Chat route error");
    return res.status(200).json({ reply: FALLBACK_REPLY, unavailable: true });
  }
});

export default router;
