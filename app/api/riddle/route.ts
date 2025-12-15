import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* =======================
   Types
======================= */

type Mode = "easy" | "medium" | "hard";
type Detail = "low" | "auto" | "high";

function asMode(value: any): Mode {
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }
  return "medium";
}

/* =======================
   Helpers
======================= */

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/* =======================
   POST handler
======================= */

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return jsonError("Missing OPENAI_API_KEY", 500);
  }

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

  if (
    typeof imageDataUrl !== "string" ||
    !imageDataUrl.startsWith("data:image/")
  ) {
    return jsonError(
      "imageDataUrl must be a data:image/*;base64,... string"
    );
  }

  /* =======================
     Difficulty guidance
  ======================= */

  const difficultyGuide: Record<Mode, string> = {
    easy:
      "Make it easy: 2 short clues, no metaphors, clearly refer to the main subject.",
    medium:
      "Make it medium: 2–3 clues, one mild metaphor allowed, still fair.",
    hard:
      "Make it hard: 3 clues, indirect wording, but solvable without obscure knowledge."
  };

  /* =======================
     Prompt
  ======================= */

  const prompt = `
You are a visual riddle game generator.

Return STRICT JSON with these keys:
- "riddle": string (max 3 short lines)
- "solution": string (1 sentence explanation)
- "focus": string (what part of the image is targeted)
- "difficulty": "easy" | "medium" | "hard"
- "answer": string (1–5 words, the expected guess)

Rules:
- English only.
- Do NOT mention "image", "photo", "picture", or "uploaded".
- Do NOT reveal the answer inside the riddle.
- Avoid ultra-abstract poetry; make it playable.
- ${difficultyGuide[mode]}
`.trim();

  /* =======================
     OpenAI call
  ======================= */

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
              detail
            }
          ]
        }
      ],
      temperature: mode === "hard" ? 0.9 : 0.6,
      max_output_tokens: 300
    });

    /* =======================
       Robust JSON extraction
    ======================= */

    const raw = response.output_text?.trim() || "";

    let parsed: any;

    try {
      // Attempt direct JSON parse
      parsed = JSON.parse(raw);
    } catch {
      try {
        // Attempt to extract JSON from text
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found");
        parsed = JSON.parse(match[0]);
      } catch {
        // Final fallback
        parsed = {
          riddle: raw || "I couldn’t generate a riddle for this one.",
          solution: includeSolution
            ? "Try a clearer image with a distinct subject."
            : "",
          focus: "unknown",
          difficulty: mode,
          answer: ""
        };
      }
    }

    if (!includeSolution) {
      delete parsed.solution;
      delete parsed.answer;
    }

    return NextResponse.json({
      ok: true,
      ...parsed
    });
  } catch (err: any) {
    const msg = err?.message || "Unknown error";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
