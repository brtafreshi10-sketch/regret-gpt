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
          content: `You are RegretGPT. Analyze the user's decision and return only valid JSON. Do not include any explanation outside the JSON object. Use the following structure exactly:\n{\n  "title": "string",\n  "immediate": "string",\n  "one_month": "string",\n  "one_year": "string",\n  "regret_score": number,\n  "advice": "string",\n  "category": "money | relationships | school | health | other"\n}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.45,
      max_tokens: 420,
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from model" },
        { status: 500 }
      );
    }

    try {
      return NextResponse.json(JSON.parse(content));
    } catch {
      return NextResponse.json({
        title: "Regret Analysis",
        immediate: content,
        one_month: "Unknown",
        one_year: "Unknown",
        regret_score: 50,
        advice: "The model returned invalid JSON. Try again with a shorter prompt.",
        category: "other",
      });
    }
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
