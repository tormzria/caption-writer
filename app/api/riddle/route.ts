import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mode = "easy" | "medium" | "hard";
type Detail = "low" | "high" | "auto";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return jsonError("Missing OPENAI_API_KEY", 500);

  const client = new OpenAI({ apiKey });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.");
  }

  const imageDataUrl = body?.imageDataUrl;
  const mode: Mode = asMode(body?.mode);
  const detail: Detail =
    body?.detail === "low" || body?.detail === "high" ? body.detail : "auto";
  const includeSolution = body?.includeSolution !== false;


  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
    return jsonError("imageDataUrl must be a data:image/*;base64,... string");
  }

  const difficultyGuide: Record<Mode, string> = {
    easy:
      "Make it easy: 2 short clues, no metaphors, refer to the main subject clearly.",
    medium:
      "Make it medium: 2–3 clues, one mild metaphor allowed, still fair.",
    hard:
      "Make it hard: 3 clues, more indirect, but still solvable without obscure knowledge."
  };

  // Structured output style (JSON in plain text) – egyszerű és stabil MVP-nek.
  const prompt = `
You are a riddle game generator for casual players.

Return STRICT JSON with these keys:
- "riddle": string (max 3 lines)
- "solution": string (one short sentence explaining the answer)
- "focus": string (what part of the image your riddle targets: e.g., "main subject", "foreground object", "background scene")
- "difficulty": "easy" | "medium" | "hard"
- "answer": string (the expected guess, 1–5 words)

Rules:
- English only.
- Do NOT mention "photo", "image", "picture", "uploaded".
- Do NOT reveal the answer inside the riddle.
- Avoid ultra-abstract poetry; make it playable.
- ${difficultyGuide[mode]}
`.trim();

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: imageDataUrl,
              detail // <-- required/expected; if omitted defaults to auto :contentReference[oaicite:3]{index=3}
            }
          ]
        }
      ],
      temperature: mode === "hard" ? 0.9 : 0.6,
      max_output_tokens: 300
    });

    const text = response.output_text?.trim() || "";
    // strict JSON parse, with a friendly fallback
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        riddle: text || "I couldn’t generate a riddle for this one.",
        solution: includeSolution ? "Try a clearer image with a distinct subject." : "",
        focus: "unknown",
        difficulty: mode,
        answer: ""
      };
    }

    if (!includeSolution) {
      delete parsed.solution;
      delete parsed.answer;
    }

    return NextResponse.json({ ok: true, ...parsed });
  } catch (err: any) {
    // Common: policy blocks, or rate limits
    const msg = err?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
