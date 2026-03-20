import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Proxy for OpenRouter
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemInstruction } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.AI_MODEL || "stepfun/step-3.5-flash:free";

    if (!apiKey) {
      return res.status(500).json({ error: "AI API key not configured in environment variables." });
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://peakstaydestination.com",
          "X-Title": "Peak Stay Destination",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemInstruction },
            ...messages
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API Error:", errorData);
        return res.status(response.status).json({ error: "AI Service Error", details: errorData });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("AI Proxy Exception:", error);
      res.status(500).json({ error: "Failed to communicate with AI service" });
    }
  });

  // AI Villa Generator Proxy
  app.post("/api/ai/generate-villa", async (req, res) => {
    const { prompt, type } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.AI_MODEL || "stepfun/step-3.5-flash:free";

    if (!apiKey) {
      return res.status(500).json({ error: "AI API key not configured." });
    }

    let systemInstruction = "";
    if (type === 'full') {
      systemInstruction = `You are a luxury real estate copywriter. Generate a JSON object for a new villa based on the prompt. 
      Fields: 
      - name (string)
      - location (string)
      - pricePerNight (number)
      - bedrooms (number)
      - bathrooms (number)
      - capacity (number)
      - numRooms (number)
      - description (one-liner)
      - longDescription (story)
      - amenities (string array)
      - includedServices (string array)
      - mealsAvailable (boolean)
      - petFriendly (boolean)
      - refundPolicy (string)
      Return ONLY the JSON object.`;
    } else if (type === 'narrative') {
      systemInstruction = `You are a luxury real estate copywriter. Generate an engaging one-liner (description) and an immersive property story (longDescription) based on the creative hints.
      Return ONLY a JSON object with fields: description, longDescription.`;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      res.json(JSON.parse(content));
    } catch (error) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
