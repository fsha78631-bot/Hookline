// api/generate.js
// This is a Vercel-style serverless function. Deploy this alongside your
// frontend so your Claude API key never touches the browser.
//
// Setup:
// 1. Put this file at /api/generate.js in a Vercel project.
// 2. In your hosting dashboard, add an environment variable:
//      ANTHROPIC_API_KEY = sk-ant-xxxxxxxx
//    (get this from console.anthropic.com -> API Keys)
// 3. The frontend calls /api/generate and sends { draft: "..." }.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { draft } = req.body || {};
  if (!draft || typeof draft !== "string") {
    return res.status(400).json({ error: "Missing 'draft' text" });
  }

  const prompt = `You are an expert social media copywriter. A user gave you this rough caption or post idea:\n\n"${draft}"\n\nWrite exactly 3 alternative opening hooks (the first line of a social post) that would stop someone from scrolling. Vary the style: one bold/direct, one curiosity-driven, one story/relatable. Keep each hook under 20 words.\n\nRespond ONLY with valid JSON, no markdown fences, no preamble, in this exact shape:\n{"hooks": [{"style": "Bold", "text": "..."}, {"style": "Curiosity", "text": "..."}, {"style": "Relatable", "text": "..."}]}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const textBlock = data?.content?.find((b) => b.type === "text");
    const raw = textBlock ? textBlock.text : "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Generation failed" });
  }
}
