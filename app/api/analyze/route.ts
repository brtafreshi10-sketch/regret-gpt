import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const { text } = await req.json();

    const prompt = `
You are RegretGPT — a decision analysis AI.

Be realistic, not dramatic.

Return ONLY valid JSON:

{
  "immediate": "how user feels right after action",
  "one_month": "likely emotional outcome after 1 month",
  "one_year": "long-term emotional outcome after 1 year",
  "regret_score": number (0-100),
  "advice": "short practical advice (max 2 sentences)"
}

Rules:
- Be realistic, not extreme
- No moral judging
- Focus on psychology and consequences

User decision:
${text}
`;

    const res = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const content = res.choices[0].message.content || "{}";

    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}