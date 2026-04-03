import { bedrock } from "@ai-sdk/amazon-bedrock";
import { generateText } from "ai";
import { buildUnifiedRFQPrompt } from "@/lib/rfq-prompts";
import type { RFQData } from "@/types/rfq";

// Allow responses up to 60 seconds
export const maxDuration = 60;

const model = bedrock("apac.anthropic.claude-3-5-sonnet-20240620-v1:0");

// ── Claude 3.5 Sonnet pricing (USD per token) ───────────────────
const INPUT_PRICE_PER_TOKEN  = 3.0  / 1_000_000;
const OUTPUT_PRICE_PER_TOKEN = 15.0 / 1_000_000;

// ── Global Session Tracking (Resets on server restart) ──────────
const sessionUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalCost: 0,
  callCount: 0,
};

/** Pretty-print token usage to the server console */
function logTokenUsage(
  mode: string,
  usage: { promptTokens?: number; completionTokens?: number; inputTokens?: number; outputTokens?: number }
) {
  const promptTokens     = usage.promptTokens     ?? usage.inputTokens     ?? 0;
  const completionTokens = usage.completionTokens ?? usage.outputTokens ?? 0;
  const inputCost  = promptTokens     * INPUT_PRICE_PER_TOKEN;
  const outputCost = completionTokens * OUTPUT_PRICE_PER_TOKEN;
  const totalCost  = inputCost + outputCost;

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
 * Single unified mode: extracts RFQ data + returns chat reply as JSON.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userMessage,
      rfqData,
      conversationHistory,
      language,
    }: {
      userMessage: string;
      rfqData: RFQData;
      conversationHistory?: { role: "user" | "assistant"; content: string }[];
      language?: string;
    } = body;

    if (!userMessage?.trim()) {
      return Response.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const systemPrompt = buildUnifiedRFQPrompt(rfqData, language || "english");

    // Build message array: system + recent history + current user message
    // Limit history to last 8 messages (4 turns) for token savings
    const trimmedHistory = (conversationHistory ?? []).slice(-8);
    const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: userMessage },
    ];

    // Use generateText (non-streaming) so we get a complete JSON response
    const result = await generateText({
      model,
      messages,
      temperature: 0.2,
      maxTokens: 1500,
    });

    // Log usage
    if (result.usage) {
      logTokenUsage("unified", result.usage);
    }

    const rawText = result.text;

    // Try to parse the JSON response from the LLM
    let cleaned = rawText.trim();

    // Strip markdown code fences if the LLM wraps them
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    // Fix literal control characters inside JSON string values
    cleaned = fixJsonControlChars(cleaned);

    try {
      const parsed = JSON.parse(cleaned);
      return Response.json(parsed);
    } catch (parseErr) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extracted = fixJsonControlChars(jsonMatch[0]);
          const parsed = JSON.parse(extracted);
          return Response.json(parsed);
        } catch {
          // Fall through to fallback
        }
      }

      console.error("Failed to parse LLM response as JSON:", parseErr);
      console.error("Raw response:", rawText.substring(0, 500));

      // Return a fallback response that the client can handle
      return Response.json({
        updatedData: rfqData,
        fieldsUpdated: [],
        assistantMessage: rawText.length > 0
          ? rawText.substring(0, 500)
          : "I processed your request but couldn't format the response properly. Please try again.",
      });
    }
  } catch (err) {
    console.error("API route error:", err);
    return Response.json(
      { error: "Internal server error", message: String(err) },
      { status: 500 }
    );
  }
}

/**
 * Fix unescaped control characters inside JSON string values.
 * LLMs often output literal newlines in strings, which breaks JSON.parse.
 */
function fixJsonControlChars(raw: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\" && inString) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      const code = ch.charCodeAt(0);
      if (code < 0x20) {
        switch (ch) {
          case "\n": result += "\\n"; break;
          case "\r": result += "\\r"; break;
          case "\t": result += "\\t"; break;
          default: result += "\\u" + code.toString(16).padStart(4, "0"); break;
        }
      } else {
        result += ch;
      }
    } else {
      result += ch;
    }
  }

  return result;
}
