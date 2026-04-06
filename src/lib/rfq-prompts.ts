import type { RFQData } from "@/types/rfq";

/**
 * Build the system prompt for conversational RFQ building.
 * The AI acts as a procurement specialist for the Indian metals industry.
 */
export function buildRFQExtractionPrompt(
  userMessage: string,
  currentData: RFQData
): string {
  return `Role: RFQ Data Extractor.
Task: Merge USER_MESSAGE into EXISTING_DATA. Return ONLY valid JSON matching the exact schema.

RULES:
1. NO HALLUCINATIONS: Only extract data explicitly mentioned in the text. Do not guess, assume, or invent grades, dimensions, or quantities.
2. EXACT LEGITIMATE TERMS: Do not restrict materials or grades to a predefined list. If the user asks for a highly specific or rare material (e.g., "Hastelloy C276"), extract it exactly as written.
3. NULL ON MISSING: If a field (like grade, product form, or brand) is not mentioned, set its value to null. Do not populate it with "N/A" or "Unknown".
4. Standardize Units: ton/tonne="MT", kg="KG", pieces/nos="Nos", meter/mtr="Mtr".

USER_MESSAGE: "${userMessage}"

EXISTING_DATA:
${JSON.stringify(currentData)}

OUTPUT SCHEMA:
{
  "updatedData": { /* full updated rfq object */ },
  "fieldsUpdated": ["list", "of", "updated", "keys"]
}
CRITICAL: Output JSON ONLY. No text.`;
}