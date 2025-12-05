import fetch from "node-fetch";
import { ProviderInterface, GenerateOptions } from "./baseProvider";
import * as vscode from "vscode";

export class OpenAIProvider implements ProviderInterface {
  defaultModel = "gpt-4o-mini";

  constructor(private context: vscode.ExtensionContext) {}

  private async getApiKey() {
    const key = await this.context.secrets.get("devaugment.openai_api_key");
    if (!key) {
      throw new Error("OpenAI API key not configured. Set it in SecretStorage.");
    }
    return key;
  }

  async generate(options: GenerateOptions): Promise<string> {
    const apiKey = await this.getApiKey();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: "user", content: options.prompt }],
        max_tokens: options.maxTokens ?? 500,
        temperature: options.temperature ?? 0
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI error: ${response.status} - ${text}`);
    }

    const json = await response.json();

    return json.choices?.[0]?.message?.content ?? "";
  }
}
