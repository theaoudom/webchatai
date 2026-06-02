import { NextResponse } from "next/server";
import { generateAIResponse, isValidCommand } from "../../../../service/aiCommands";

// POST /api/ai/chat
// Body:     { "type": "ask", "message": "How to fix Kotlin crash?" }
// Response: { "success": true, "response": "The crash happens because..." }
export async function POST(req) {
  try {
    const { type, message } = await req.json();

    if (!isValidCommand(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid command type." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required." },
        { status: 400 }
      );
    }

    const response = await generateAIResponse(type, message);

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("Error in /api/ai/chat:", error.status || "", error.message);
    if (error.status === 429) {
      return NextResponse.json(
        { success: false, error: "Rate limited. Please try again shortly." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { success: false, error: "AI is temporarily unavailable." },
      { status: 502 }
    );
  }
}
