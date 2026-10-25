import { streamCoach } from "@/lib/ai";
import { requireApiUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => ({}));
  const encoder = new TextEncoder();
  const stream = new ReadableStream({ async start(controller) { for await (const chunk of streamCoach(body.prompt ?? "我该从哪里开始？")) controller.enqueue(encoder.encode(chunk)); controller.close(); } });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
}
