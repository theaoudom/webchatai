import { NextResponse } from "next/server";
import { verifyAlarmCallback } from "../../../../service/qstash";
import { sendMessage } from "../../../../service/telegram";

// QStash calls this route at an alarm's fire time (scheduled by the Telegram
// webhook when a user runs /alarm). The signature is verified so only QStash —
// holding our signing keys — can trigger a reminder send. We always return 200
// once verified so QStash does not retry a delivered reminder.
export async function POST(req) {
  // Verify against the RAW body (parsing first would change the bytes the
  // signature was computed over).
  const rawBody = await req.text();
  const signature = req.headers.get("upstash-signature");

  const valid = await verifyAlarmCallback({ signature, body: rawBody });
  if (!valid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const { chatId, reminder, replyTo } = data || {};
  if (chatId && reminder) {
    try {
      await sendMessage(chatId, `⏰ Reminder: ${reminder}`, { replyTo });
    } catch (err) {
      console.error("Alarm send failed:", err.message);
    }
  }

  return NextResponse.json({ ok: true });
}
