import { ProviderInterface, GenerateOptions } from "./baseProvider";
import * as vscode from "vscode";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider implements ProviderInterface {
  defaultModel = "gemini-2.0-flash"; // working model

  private genAI: GoogleGenerativeAI | null = null;

  constructor(private context: vscode.ExtensionContext) {}

  private async getApiKey() {
    const key = await this.context.secrets.get("devaugment.gemini_api_key");
    if (!key) throw new Error("Gemini API key not set. Use 'DevAugment: Set API Key'.");
    return key;
  }

  private initialize(apiKey: string) {
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generate(options: GenerateOptions): Promise<string> {
    const apiKey = await this.getApiKey();
    this.initialize(apiKey);

    const model = this.genAI!.getGenerativeModel({
      model: options.model || this.defaultModel,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens ?? 500,
      },
    });

    const result = await model.generateContent(options.prompt);
    const response = await result.response;

    return response.text().trim();
  }
}
