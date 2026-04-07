// import { bedrock } from "@ai-sdk/amazon-bedrock";
// import { streamText } from "ai";
// import { buildUnifiedRFQPrompt } from "@/lib/rfq-prompts";
// import type { RFQData } from "@/types/rfq";

// // Allow responses up to 60 seconds
// export const maxDuration = 60;

// const model = bedrock("apac.anthropic.claude-3-5-sonnet-20240620-v1:0");

// // ── Claude 3.5 Sonnet pricing (USD per token) ───────────────────
// const INPUT_PRICE_PER_TOKEN  = 3.0  / 1_000_000;
// const OUTPUT_PRICE_PER_TOKEN = 15.0 / 1_000_000;

// // ── Global Session Tracking (Resets on server restart) ──────────
// const sessionUsage = {
//   promptTokens: 0,
//   completionTokens: 0,
//   totalCost: 0,
//   callCount: 0,
// };

// /** Pretty-print token usage to the server console */
// function logTokenUsage(
//   mode: string,
//   usage: { promptTokens?: number; completionTokens?: number; inputTokens?: number; outputTokens?: number }
// ) {
//   const promptTokens     = usage.promptTokens     ?? usage.inputTokens     ?? 0;
//   const completionTokens = usage.completionTokens ?? usage.outputTokens ?? 0;
//   const inputCost  = promptTokens     * INPUT_PRICE_PER_TOKEN;
//   const outputCost = completionTokens * OUTPUT_PRICE_PER_TOKEN;
//   const totalCost  = inputCost + outputCost;

//   sessionUsage.promptTokens     += promptTokens;
//   sessionUsage.completionTokens += completionTokens;
//   sessionUsage.totalCost        += totalCost;
//   sessionUsage.callCount        += 1;

//   console.log(`\n╔══════════════════════════════════════════════╗`);
//   console.log(`║        🪙  RFQ TOKEN USAGE  [${mode.toUpperCase().padEnd(8)}]      ║`);
//   console.log(`╠══════════════════════════════════════════════╣`);
//   console.log(`║  [Current Request]                           ║`);
//   console.log(`║  Input  Tokens : ${String(promptTokens).padStart(10)}               ║`);
//   console.log(`║  Output Tokens : ${String(completionTokens).padStart(10)}               ║`);
//   console.log(`║  💰 COST       :   $${totalCost.toFixed(6).padStart(10)}            ║`);
//   console.log(`╠══════════════════════════════════════════════╣`);
//   console.log(`║  🚀 SESSION TOTAL (All Chat Sum)             ║`);
//   console.log(`║  Calls Count   : ${String(sessionUsage.callCount).padStart(10)}               ║`);
//   console.log(`║  Accum. Input  : ${String(sessionUsage.promptTokens).padStart(10)}               ║`);
//   console.log(`║  Accum. Output : ${String(sessionUsage.completionTokens).padStart(10)}               ║`);
//   console.log(`║  ──────────────────────────────────────────  ║`);
//   console.log(`║  💎 GRAND TOTAL:   $${sessionUsage.totalCost.toFixed(6).padStart(10)}            ║`);
//   console.log(`╚══════════════════════════════════════════════╝\n`);
// }

// /**
//  * POST /api/chat
//  * Single unified mode: extracts RFQ data + returns chat reply as JSON.
//  */
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const {
//       userMessage,
//       rfqData,
//       conversationHistory,
//       language,
//     }: {
//       userMessage: string;
//       rfqData: RFQData;
//       conversationHistory?: { role: "user" | "assistant"; content: string }[];
//       language?: string;
//     } = body;

//     if (!userMessage?.trim()) {
//       return Response.json(
//         { error: "No message provided" },
//         { status: 400 }
//       );
//     }

//     const systemPrompt = buildUnifiedRFQPrompt(rfqData, language || "english");

//     // Build message array: system + recent history + current user message
//     // Limit history to last 8 messages (4 turns) for token savings
//     const trimmedHistory = (conversationHistory ?? []).slice(-8);
//     const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
//       { role: "system", content: systemPrompt },
//       ...trimmedHistory,
//       { role: "user", content: userMessage },
//     ];

//     // Use streamText for a better, streaming UI experience
//     const result = await streamText({
//       model,
//       messages,
//       temperature: 0.2,
//       // Removed maxTokens as it seems to be erroring in this version's type def
//       onFinish: (res) => {
//         if (res.usage) {
//           logTokenUsage("unified", res.usage);
//         }
//       },
//     });

//     return result.toTextStreamResponse();

//   } catch (err) {
//     console.error("API route error:", err);
//     return Response.json(
//       { error: "Internal server error", message: String(err) },
//       { status: 500 }
//     );
//   }
// }


// /**
//  * Fix unescaped control characters inside JSON string values.
//  * LLMs often output literal newlines in strings, which breaks JSON.parse.
//  */
// function fixJsonControlChars(raw: string): string {
//   let result = "";
//   let inString = false;
//   let escaped = false;

//   for (let i = 0; i < raw.length; i++) {
//     const ch = raw[i];

//     if (escaped) {
//       result += ch;
//       escaped = false;
//       continue;
//     }

//     if (ch === "\\" && inString) {
//       result += ch;
//       escaped = true;
//       continue;
//     }

//     if (ch === '"') {
//       inString = !inString;
//       result += ch;
//       continue;
//     }

//     if (inString) {
//       const code = ch.charCodeAt(0);
//       if (code < 0x20) {
//         switch (ch) {
//           case "\n": result += "\\n"; break;
//           case "\r": result += "\\r"; break;
//           case "\t": result += "\\t"; break;
//           default: result += "\\u" + code.toString(16).padStart(4, "0"); break;
//         }
//       } else {
//         result += ch;
//       }
//     } else {
//       result += ch;
//     }
//   }

//   return result;
// }


export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      return Response.json({ error: err.detail || "Backend error" }, { status: response.status });
    }

    // Stream the response straight through to the client
    return new Response(response.body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (err) {
    console.error("FastAPI proxy error:", err);
    return Response.json({ error: "Could not reach AI backend" }, { status: 500 });
  }
}