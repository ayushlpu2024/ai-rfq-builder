import { bedrock } from "@ai-sdk/amazon-bedrock";
import { streamText } from "ai";
import { buildRFQSystemPrompt, buildRFQExtractionPrompt } from "@/lib/rfq-prompts";
import type { RFQData } from "@/types/rfq";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const model = bedrock("apac.anthropic.claude-3-5-sonnet-20240620-v1:0");

// ── Claude 3.5 Sonnet pricing (USD per token) ───────────────────
const INPUT_PRICE_PER_TOKEN  = 3.0  / 1_000_000;  // $3.00 per 1M input tokens
const OUTPUT_PRICE_PER_TOKEN = 15.0 / 1_000_000;   // $15.00 per 1M output tokens

// ── Global Session Tracking (Resets on server restart) ──────────
const sessionUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalCost: 0,
  callCount: 0
};

/** Pretty-print token usage to the server console */
function logTokenUsage(mode: string, usage: any) {
  // 1. Current Transaction
  const promptTokens = usage.promptTokens ?? usage.inputTokens ?? 0;
  const completionTokens = usage.completionTokens ?? usage.outputTokens ?? 0;
  const inputCost  = promptTokens     * INPUT_PRICE_PER_TOKEN;
  const outputCost = completionTokens * OUTPUT_PRICE_PER_TOKEN;
  const totalCost  = inputCost + outputCost;

  // 2. Update Session Totals
  sessionUsage.promptTokens     += promptTokens;
  sessionUsage.completionTokens += completionTokens;
  sessionUsage.totalCost        += totalCost;
  sessionUsage.callCount        += 1;

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║        🪙  RFQ TOKEN USAGE  [${mode.toUpperCase().padEnd(8)}]      ║`);
  console.log(`╠══════════════════════════════════════════════╣`);
  console.log(`║  [Current Request]                           ║`);
  console.log(`║  Input  Tokens : ${String(promptTokens).padStart(10)}               ║`);
  console.log(`║  Output Tokens : ${String(completionTokens).padStart(10)}               ║`);
  console.log(`║  💰 COST       :   $${totalCost.toFixed(6).padStart(10)}            ║`);
  console.log(`╠══════════════════════════════════════════════╣`);
  console.log(`║  🚀 SESSION TOTAL (All Chat Sum)             ║`);
  console.log(`║  Calls Count   : ${String(sessionUsage.callCount).padStart(10)}               ║`);
  console.log(`║  Accum. Input  : ${String(sessionUsage.promptTokens).padStart(10)}               ║`);
  console.log(`║  Accum. Output : ${String(sessionUsage.completionTokens).padStart(10)}               ║`);
  console.log(`║  ──────────────────────────────────────────  ║`);
  console.log(`║  💎 GRAND TOTAL:   $${sessionUsage.totalCost.toFixed(6).padStart(10)}            ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);
}

/**
 * POST /api/chat
 * Handles two modes:
 *   1. "chat"    — streams the AI's conversational reply for RFQ building
 *   2. "extract" — returns structured RFQ JSON from user message
 */
export async function POST(request: Request) {
  const body = await request.json();
  const {
    mode,
    userMessage,
    rfqData,
    conversationHistory,
  }: {
    mode: "chat" | "extract";
    userMessage: string;
    rfqData: RFQData;
    conversationHistory?: { role: "user" | "assistant"; content: string }[];
  } = body;

  // ── Extract mode: return structured JSON ──────────────────────
  if (mode === "extract") {
    const extractionPrompt = buildRFQExtractionPrompt(userMessage, rfqData);

    const result = await streamText({
      model,
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.1,
      onFinish({ usage }) {
        logTokenUsage("extract", usage);
      },
    });

    return result.toTextStreamResponse();
  }

  // ── Chat mode: stream conversational reply ────────────────────
  const systemPrompt = buildRFQSystemPrompt(rfqData);

  const messages: { role: "user" | "assistant" | "system"; content: string }[] =
    [
      { role: "system", content: systemPrompt },
      ...(conversationHistory ?? []),
      { role: "user", content: userMessage },
    ];

  const result = await streamText({
    model,
    messages,
    temperature: 0.6,
    maxOutputTokens: 1024,
    onFinish({ usage }) {
      logTokenUsage("chat", usage);
    },
  });

  return result.toTextStreamResponse();
}




