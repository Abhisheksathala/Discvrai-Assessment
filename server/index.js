import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "./products.js";

dotenv.config();

const app = express();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// middleware
app.use(cors());
app.use(express.json());

// API endpoints
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the server!" });
});
app.get("/api/test-gemini", async (req, res) => {
  try {
    const result = await model.generateContent("Say 'Gemini is working!' in one line");
    const response = await result.response;
    const text = response.text();
    res.json({ success: true, message: text });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/ask", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const llmResult = await processWithGemini(query);

    const relevantProducts = products.filter((p) =>
      llmResult.relevantProducts?.includes(p.id),
    );

    res.json({
      query,
      answer: llmResult.answer || "Here are some products you might like:",
      products: relevantProducts,
    });
  } catch (error) {
    console.error("Error in /api/ask:", error);
    res.status(500).json({
      error: "Failed to process your query",
      details: error.message,
    });
  }
});

async function processWithGemini(query) {
  try {
    const prompt = `
      You are a product assistant. The user query is: "${query}"
      
      Based on our product catalog: ${JSON.stringify(products)}
      
      Return a JSON response with:
      1. "answer": A helpful response to the user's query (a friendly sentence or two)
      2. "relevantProducts": Array of product IDs that match the query (from the catalog above)
      
      IMPORTANT: Format your response as valid JSON only. No markdown, no explanation, just pure JSON.
      
      Example format:
      {
        "answer": "I found some great laptops for you!",
        "relevantProducts": ["P001", "P004"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const llmResponse = response.text();

    console.log("Gemini raw response:", llmResponse);
    const cleanedResponse = llmResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", cleanedResponse);

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        answer: "I found some products that might interest you.",
        relevantProducts: [],
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error("Failed to process query with Gemini");
  }
}


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
