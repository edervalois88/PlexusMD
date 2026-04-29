import type { EnhancedGenerateContentResponse } from "@google/generative-ai";

export type AiAuditPayload = {
  category: string;
  recommendationSummary: string;
  tokenUsage: {
    promptTokens?: number;
    responseTokens?: number;
    totalTokens?: number;
    estimatedResponseTokens: number;
    responseCharacters: number;
  };
  model: string;
};

const CATEGORY_PATTERNS: Array<[string, RegExp]> = [
  ["Alergia", /alerg|anafil|hipersens/i],
  ["Dosificacion", /dosis|dosific|mg|mcg|cada\s+\d+|posolog/i],
  ["Interaccion", /interacci|duplicidad|contraindic|aine|cyp|sangrado/i],
  ["Seguimiento", /seguimiento|monitore|vigilar|control|laboratorio|pregunta/i],
];

export const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export const classifyInsightCategory = (text: string) => {
  const match = CATEGORY_PATTERNS.find(([, pattern]) => pattern.test(text));
  return match?.[0] ?? "General";
};

export const summarizeRecommendation = (text: string, maxLength = 360) => {
  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/\b[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z0-9]{5}\b/g, "[CURP]")
    .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
};

export const buildAiAuditPayload = (
  responseText: string,
  response: Pick<EnhancedGenerateContentResponse, "usageMetadata"> | null,
  model: string,
): AiAuditPayload => {
  const estimatedResponseTokens = estimateTokens(responseText);

  return {
    category: classifyInsightCategory(responseText),
    recommendationSummary: summarizeRecommendation(responseText),
    tokenUsage: {
      promptTokens: response?.usageMetadata?.promptTokenCount,
      responseTokens: response?.usageMetadata?.candidatesTokenCount,
      totalTokens: response?.usageMetadata?.totalTokenCount,
      estimatedResponseTokens,
      responseCharacters: responseText.length,
    },
    model,
  };
};
