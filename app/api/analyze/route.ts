import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are RegretGPT.

Return ONLY valid JSON:
{
  "title": "string",
  "immediate": "string",
  "one_month": "string",
  "one_year": "string",
  "regret_score": number,
  "advice": "string",
  "category": "money | relationships | school | health | other"
}
          `.trim(),
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response" },
        { status: 500 }
      );
    }

    // SAFE PARSE
    try {
      return NextResponse.json(JSON.parse(content));
    } catch {
      return NextResponse.json({
        title: "Regret Analysis",
        immediate: content,
        one_month: "Unknown",
        one_year: "Unknown",
        regret_score: 50,
        advice: "Model returned non-JSON output",
        category: "other",
      });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}