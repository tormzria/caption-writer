import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const imageUrl = `data:${file.type || "image/jpeg"};base64,${base64}`;

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [{
      role: "user",
      content: [
        {
          type: "input_text",
          text:
            "Write a neutral, factual image caption in one sentence. " +
            "Do not guess identity, age, or medical condition.",
        },
        {
          type: "input_image",
          image_url: imageUrl,
        },
      ],
    }],
  });

  return NextResponse.json({ caption: response.output_text });
}
