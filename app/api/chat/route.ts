import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response";
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 