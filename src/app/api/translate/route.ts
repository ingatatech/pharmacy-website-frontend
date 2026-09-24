import { NextResponse } from "next/server";

// Server-only: GROQ_API_KEY is read from process.env here and never sent
// to the client. This route is what the language switcher calls — see
// src/lib/language-context.tsx for the client-side caching hook that
// hits this endpoint.

const DEFAULT_MODEL = "openai/gpt-oss-120b";

const LANGUAGE_NAMES: Record<string, string> = {
  rw: "Kinyarwanda",
  fr: "French",
  sw: "Swahili",
};

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set. Add it to .env.local to enable translation." },
      { status: 503 }
    );
  }

  let body: { text?: unknown; targetLang?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const targetLang = typeof body.targetLang === "string" ? body.targetLang : "";
  const languageName = LANGUAGE_NAMES[targetLang];

  if (!text) {
    return NextResponse.json({ error: "`text` is required." }, { status: 400 });
  }
  if (!languageName) {
    return NextResponse.json({ error: `Unsupported targetLang "${targetLang}".` }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              `You are a professional English-to-${languageName} translator for a pharmacy website's ` +
              `interface. Translate the given text naturally and accurately, preserving tone and any ` +
              `placeholders or punctuation. Respond with ONLY the translated text — no quotes, no notes, ` +
              "no explanations.",
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Groq translation request failed:", response.status, detail);
      return NextResponse.json({ error: "Translation service error." }, { status: 502 });
    }

    const data = await response.json();
    const translated = data?.choices?.[0]?.message?.content?.trim();

    if (!translated) {
      return NextResponse.json({ error: "Translation service returned no content." }, { status: 502 });
    }

    return NextResponse.json({ translated });
  } catch (error) {
    console.error("Groq translation request threw:", error);
    return NextResponse.json({ error: "Translation service unreachable." }, { status: 502 });
  }
}
