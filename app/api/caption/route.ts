import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("image") as File;

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Describe the image as a riddle.

Focus:
- Something that normally moves, acts, or is used.
- The fact that it is currently still or inactive.

Rules:
- Do not name the object directly.
- Use concrete, visible details.
- Avoid poetic or abstract language.
- One or two sentences maximum.
- Make the connection recognizable, not tricky.
`,
          },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64}`,
              detail: "auto",
            },

        ],
      },
    ],
  });

  const riddle =
  response.output_text ||
  "Unable to describe this image.";


  return NextResponse.json({ riddle });
}
