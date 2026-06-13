const OpenAI = require("openai");
const productService = require("./productService");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processChat(message) {
  let productContext = "";

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("saree") ||
    lowerMessage.includes("kurti") ||
    lowerMessage.includes("dress") ||
    lowerMessage.includes("cotton") ||
    lowerMessage.includes("product")
  ) {
    const products = await productService.searchProducts(message);

    productContext = products
      .map(
        (p) =>
          `
Name: ${p.name}
Price: ₹${p.price}
Category: ${p.category}
Description: ${p.description}
`
      )
      .join("\n");
  }

  const completion =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are Ridhs Design AI Assistant.

You help customers:

- Find products
- Recommend outfits
- Shipping questions
- Return policy
- Order support

If product data is provided,
ONLY recommend products from that data.

Never invent products.
`,
        },
        {
          role: "system",
          content: `
Available Products:

${productContext}
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

  return completion.choices[0].message.content;
}

module.exports = {
  processChat,
};