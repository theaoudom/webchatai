import { NextResponse } from "next/server";
import { getSpeechFeedback } from "../../../../service/gemini"; // Adjust path if needed

export async function POST(req) {
  try {
    const { transcript, lessonContext } = await req.json();

    if (!transcript || !lessonContext) {
      return new NextResponse("Bad Request: Missing transcript or lesson context.", { status: 400 });
    }

    const aiFeedbackText = await getSpeechFeedback(transcript, lessonContext);

    return NextResponse.json({ text: aiFeedbackText });
    
  } catch (error) {
    console.error("Error in AI Feedback API Route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}