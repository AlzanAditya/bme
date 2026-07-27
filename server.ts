import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/extract-invoice", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback rule parsing if GEMINI_API_KEY is not set
        return res.json({ items: parseTextToItems(prompt) });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Ekstrak item invoice dari teks berikut dan kembalikan HANYA JSON array dengan atribut:
- name (string)
- tipe (string, default "-")
- note (string, default "")
- qty (number)
- qtyUnit (string, e.g. "pcs", "unit", "lot")
- price (number)

Teks:
${prompt}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      try {
        const parsed = JSON.parse(responseText);
        const items = Array.isArray(parsed) ? parsed : parsed.items || [];
        return res.json({ items });
      } catch (parseErr) {
        return res.json({ items: parseTextToItems(prompt) });
      }
    } catch (err: any) {
      console.error("Gemini Extraction Error:", err);
      return res.json({ items: parseTextToItems(req.body?.prompt || "") });
    }
  });

  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function parseTextToItems(text: string) {
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.map((line) => {
    const qtyMatch = line.match(/(\d+)\s*(pcs|unit|lot)?/i);
    const priceMatch = line.match(/(\d[\d\.\,]*000)/);

    const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
    const qtyUnit = qtyMatch && qtyMatch[2] ? qtyMatch[2].toLowerCase() : "pcs";
    let price = 0;
    if (priceMatch) {
      price = parseInt(priceMatch[1].replace(/\D/g, "")) || 0;
    }

    return {
      name: line.split(/harga|rp/i)[0].trim(),
      tipe: "-",
      note: "",
      qty,
      qtyUnit,
      price,
    };
  });
}

startServer();
