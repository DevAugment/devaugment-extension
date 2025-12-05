import * as vscode from "vscode";

export async function setApiKeyCommand(context: vscode.ExtensionContext) {
  const provider = await vscode.window.showQuickPick(
    ["openai", "gemini"],
    { placeHolder: "Select provider to set API key" }
  );

  if (!provider) return;

  const key = await vscode.window.showInputBox({
    prompt: `Enter your ${provider.toUpperCase()} API Key`,
    password: true,
    ignoreFocusOut: true
  });

  if (!key) {
    vscode.window.showErrorMessage("API key not provided.");
    return;
  }

  const storageKey =
    provider === "gemini"
      ? "devaugment.gemini_api_key"
      : "devaugment.openai_api_key";

  await context.secrets.store(storageKey, key);

  vscode.window.showInformationMessage(`${provider.toUpperCase()} API key saved successfully!`);
}
