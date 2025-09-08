import { NextResponse } from "next/server";
import { getTutorChatResponse } from "../../../service/gemini"; // Adjust path if needed

export async function POST(req) {
  try {
    const { history, lessonContext } = await req.json();

    if (!history || !lessonContext) {
      return new NextResponse("Bad Request: Missing history or lesson context.", { status: 400 });
    }

    const aiResponseText = await getTutorChatResponse(history, lessonContext);

    return NextResponse.json({ text: aiResponseText });
    
  } catch (error) {
    console.error("Error in AI Chat API Route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}