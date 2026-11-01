export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "DEVIL CORE is not configured. Add GROQ_API_KEY in Vercel environment variables." });

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const safeMessages = messages
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: "You are DEVIL AI, an intelligent, balanced, helpful and slightly mysterious AI assistant. Be clear, accurate, friendly and practical. Explain complex topics simply. Do not claim to have abilities or access you do not have. Use concise answers by default."
          },
          ...safeMessages
        ],
        temperature: 0.7,
        max_completion_tokens: 2048
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "The AI provider returned an error." });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply || typeof reply !== "string") return res.status(502).json({ error: "The AI returned an empty response. Please try again." });
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: "DEVIL CORE encountered a server error." });
  }
}
