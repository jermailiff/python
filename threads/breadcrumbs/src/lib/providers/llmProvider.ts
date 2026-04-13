export interface LlmThreadSuggestionInput {
  rawText: string;
  candidateThreadTitles: string[];
}

export interface LlmProvider {
  suggestThread(input: LlmThreadSuggestionInput): Promise<string | null>;
  summarizeDailyDigest(lines: string[]): Promise<string[]>;
}

export class LocalStubLlmProvider implements LlmProvider {
  async suggestThread(input: LlmThreadSuggestionInput): Promise<string | null> {
    const lower = input.rawText.toLowerCase();
    const match = input.candidateThreadTitles.find((title) =>
      lower.includes(title.toLowerCase().split(' ')[0])
    );
    return match ?? null;
  }

  async summarizeDailyDigest(lines: string[]): Promise<string[]> {
    return lines.slice(0, 4).map((line) => `• ${line}`);
  }
}
