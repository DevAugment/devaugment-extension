import * as vscode from "vscode";
import { ProviderInterface } from "./baseProvider";
import { OpenAIProvider } from "./openaiProvider";
import { GeminiProvider } from "./geminiProvider";

export class Providers {
  static getDefault(context: vscode.ExtensionContext): ProviderInterface {
    const providerSetting = vscode.workspace
      .getConfiguration("devaugment")
      .get<string>("provider", "openai");

    switch (providerSetting.toLowerCase()) {
      case "gemini":
        return new GeminiProvider(context);
      case "openai":
      default:
        return new OpenAIProvider(context);
    }
  }
}
