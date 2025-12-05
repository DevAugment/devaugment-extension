import * as vscode from "vscode";
import { ProviderInterface } from "./baseProvider";
import { OpenAIProvider } from "./openaiProvider";

export class Providers {
  static getDefault(context: vscode.ExtensionContext): ProviderInterface {
    return new OpenAIProvider(context);
  }
}
