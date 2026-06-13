const OpenAI = require("openai");
const { searchProduct } = require("../service/productService");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.chatBot = async (req, res) => {
  try {
    const { message } = req.body;

    const lowerMessage = message.toLowerCase();

    // PRODUCT SEARCH
    const products = await searchProduct(lowerMessage);

    if (products.length > 0) {
      return res.json({
        type: "products",
        products,
        reply: `I found ${products.length} matching products.`,
      });
    }

    // STORE FAQS
    if (
      lowerMessage.includes("shipping") ||
      lowerMessage.includes("delivery")
    ) {
      return res.json({
        reply:
          "We deliver across India. Orders usually arrive within 3-7 business days.",
      });
    }

    if (
      lowerMessage.includes("return") ||
      lowerMessage.includes("refund")
    ) {
      return res.json({
        reply:
          "Returns are accepted within 7 days of delivery if the product is unused.",
      });
    }

    // GPT FALLBACK
    const completion =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
You are Ridhs Design AI Assistant.

About Ridhs Design:
- Premium ethnic fashion brand
- Sarees
- Kurti Sets
- Lehengas
- Dupattas
- Handcrafted Products

If product information is unavailable, suggest users browse products.

Keep responses short, helpful and sales-focused.
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

    res.json({
      type: "chat",
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};