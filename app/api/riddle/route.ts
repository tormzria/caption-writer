import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Mode = "easy" | "medium" | "hard";
type Detail = "low" | "auto" | "high";

function asMode(value: any): Mode {
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }
  return "medium";
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  // ✅ ENV csak runtime-ban
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

  const difficultyGuide: Record<Mode, string> = {
    easy:
      "Make it easy: 2 short clues, no metaphors, refer to the main subject clearly.",
    medium:
      "Make it medium: 2–3 clues, one mild metaphor allowed, still fair.",
    hard:
      "Make it hard: 3 clues, indirect but solvable without obscure knowledge."
  };

  const prompt = `
You are a riddle game generator.

Return STRICT JSON with:
- riddle (string, max 3 lines)
- solution (string)
- focus (string)
- difficulty ("easy" | "medium" | "hard")
- answer (1–5 words)

Rules:
- English only
- Do not mention images/photos
- Do not reveal the answer in the riddle
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
              detail
            }
          ]
        }
      ],
      temperature: mode === "hard" ? 0.9 : 0.6,
      max_output_tokens: 300
    });

    const text = response.output_text?.trim() ?? "";

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        riddle: text || "I couldn't generate a riddle.",
        solution: "No explanation available.",
        focus: "unknown",
        difficulty: mode,
        answer: ""
      };
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
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
