export type RetrievalGrade = { precisionAtK: number; recallAtK: number; passed: boolean };

export function gradeRetrieval(expectedIds: string[], retrievedIds: string[], k: number, minRecall = 0.5): RetrievalGrade {
  const topK = retrievedIds.slice(0, k);
  const expected = new Set(expectedIds);
  const found = new Set(topK.filter((id) => expected.has(id)));
  const precisionAtK = topK.length === 0 ? 0 : found.size / topK.length;
  const recallAtK = expected.size === 0 ? 1 : found.size / expected.size;
  return { precisionAtK, recallAtK, passed: recallAtK >= minRecall };
}

export function hasRequiredKeywords(text: string, keywords: string[]): boolean {
  const normalized = text.toLocaleLowerCase();
  return keywords.every((keyword) => normalized.includes(keyword.toLocaleLowerCase()));
}
