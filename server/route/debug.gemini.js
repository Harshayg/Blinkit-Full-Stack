// server/route/debug.gemini.js
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const router = express.Router();
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.get("/gemini-raw", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(400).json({ error: "GEMINI_API_KEY not set" });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await client.models.generateContent({
      model,
      contents: [{ parts: [{ text: "Return a short JSON object: {\"ok\":true}" }] }],
      temperature: 0.0,
      maxOutputTokens: 50
    });
    return res.json({ status: "ok", raw: response });
  } catch (err) {
    console.error("debug.gemini error:", err);
    return res.status(500).json({ error: err.message, raw: err });
  }
});

export default router;
